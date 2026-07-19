import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * OneDriveNode - Microsoft OneDrive Cloud Storage API Integration
 *
 * Provides comprehensive integration with Microsoft OneDrive API including:
 * - Files: Upload, download, delete, copy, move, versions
 * - Folders: Create, list, delete, get children
 * - Drive: Get drive info, available drives
 * - Search: Search files and folders
 * - Thumbnails: Generate thumbnails
 * - Sharing: Create share links, permissions
 * - Permissions: Manage file/folder permissions
 * - Special Folders: Documents, Pictures, Camera, etc.
 * - Sync: Monitor changes
 * - Workflows: Microsoft Flow integration
 *
 * Authentication: OAuth2 Bearer Token
 * API Docs: https://docs.microsoft.com/en-us/onedrive/developer/rest-api/
 */
export class OneDriveNode extends BaseNode {
  readonly accessToken: string;
  readonly driveType: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.accessToken = config.accessToken || '';
    this.driveType = config.driveType || 'me'; // 'me', 'user', 'group', 'site'
    this.apiUrl = 'https://graph.microsoft.com/v1.0';

    if (!this.accessToken) {
      throw new Error('OneDrive access token is required');
    }
  }

  /**
   * Resolve value with variable substitution
   */
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }

    return value;
  }


  getType(): string {
    return 'onedrive';
  }

  getIcon(): string {
    return '☁️';
  }

  getCategory(): string {
    return 'cloud-storage';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'listItems';

    try {
      switch (operation) {
        // File Operations
        case 'uploadFile':
          return await this.uploadFile(context);
        case 'uploadLargeFile':
          return await this.uploadLargeFile(context);
        case 'downloadFile':
          return await this.downloadFile(context);
        case 'deleteFile':
          return await this.deleteFile(context);
        case 'copyFile':
          return await this.copyFile(context);
        case 'moveFile':
          return await this.moveFile(context);
        case 'getFileInfo':
          return await this.getFileInfo(context);
        case 'listVersions':
          return await this.listVersions(context);
        case 'restoreVersion':
          return await this.restoreVersion(context);

        // Folder Operations
        case 'listItems':
          return await this.listItems(context);
        case 'createFolder':
          return await this.createFolder(context);
        case 'deleteFolder':
          return await this.deleteFolder(context);
        case 'getFolderInfo':
          return await this.getFolderInfo(context);

        // Drive Operations
        case 'getDrive':
          return await this.getDrive();
        case 'listDrives':
          return await this.listDrives();
        case 'getRecent':
          return await this.getRecent(context);

        // Search Operations
        case 'search':
          return await this.search(context);

        // Thumbnail Operations
        case 'getThumbnail':
          return await this.getThumbnail(context);

        // Sharing Operations
        case 'createShareLink':
          return await this.createShareLink(context);
        case 'listShareLinks':
          return await this.listShareLinks(context);
        case 'getPermissions':
          return await this.getPermissions(context);
        case 'grantPermission':
          return await this.grantPermission(context);
        case 'deletePermission':
          return await this.deletePermission(context);

        // Special Folders
        case 'getSpecialFolder':
          return await this.getSpecialFolder(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute OneDrive operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private getDrivePath(): string {
    if (this.driveType === 'me') {
      return '/me/drive';
    } else if (this.driveType.startsWith('user')) {
      return `/users/${this.driveType.replace('user/', '')}/drive`;
    } else if (this.driveType.startsWith('group')) {
      return `/groups/${this.driveType.replace('group/', '')}/drive`;
    } else if (this.driveType.startsWith('site')) {
      return `/sites/${this.driveType.replace('site/', '')}/drive`;
    }
    return '/me/drive';
  }

  private async callApi(
    endpoint: string,
    method = 'GET',
    body?: any,
    isUpload = false
  ): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        ...this.getAuthHeaders(),
      },
    };

    if (body) {
      if (isUpload) {
        // For upload, remove Content-Type to let browser set it with boundary
        delete options.headers['Content-Type'];
        options.body = body;
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OneDrive API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        } else if (errorJson.error) {
          errorMessage = JSON.stringify(errorJson.error);
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  // ==================== File Operations ====================

  private async uploadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const fileName = this.resolveValue(this.config.fileName, context);
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const content = this.resolveValue(this.config.content, context);
    const conflictBehavior = this.config.conflictBehavior || 'rename';

    if (!content && content !== '') {
      throw new Error('content is required');
    }
    if (!itemId && !filePath && !fileName) {
      throw new Error('Either itemId, filePath, or fileName is required');
    }

    let endpoint = `${this.getDrivePath()}/root:/${fileName || ''}:/content`;

    if (itemId) {
      endpoint = `${this.getDrivePath()}/items/${itemId}/content`;
    } else if (filePath && !fileName) {
      endpoint = `${this.getDrivePath()}/root:${filePath}:/content`;
    }

    const url = `${endpoint}?@microsoft.graph.conflictBehavior=${conflictBehavior}`;

    const options: RequestInit = {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: content,
    };

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OneDrive upload error: ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) errorMessage = errorJson.error.message;
      } catch {}
      throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        file: data,
        id: data.id,
        name: data.name,
        size: data.size,
        webUrl: data.webUrl,
        message: 'File uploaded successfully',
      },
    };
  }

  private async uploadLargeFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const filePath = this.resolveValue(this.config.filePath, context);
    const content = this.resolveValue(this.config.content, context);
    const fileName = this.resolveValue(this.config.fileName, context) || '';
    const fileSize = this.config.fileSize || 0;

    if (!filePath && !fileName) {
      throw new Error('Either filePath or fileName is required');
    }
    if (!content) {
      throw new Error('content is required');
    }

    // Create upload session
    let itemName: string;
    if (filePath && !fileName) {
      itemName = filePath.split('/').pop() || fileName;
    } else {
      itemName = fileName;
    }

    const uploadUrlBody = {
      item: {
        '@microsoft.graph.conflictBehavior': 'rename',
        name: itemName,
      },
      fileSize,
    };

    const sessionData = await this.callApi(
      `${this.getDrivePath()}/root:/${fileName}:/createUploadSession`,
      'POST',
      uploadUrlBody
    );

    const uploadUrl = sessionData.uploadUrl;

    // Upload in chunks
    const chunkSize = 4 * 1024 * 1024; // 4MB chunks
    const chunks = Math.ceil(fileSize / chunkSize);
    let uploadedBytes = 0;

    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize - 1, fileSize - 1);
      const contentRange = `bytes ${start}-${end}/${fileSize}`;
      const chunk = content.slice(start, end + 1);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Range': contentRange,
        },
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload chunk ${i + 1}: ${response.statusText}`);
      }

      uploadedBytes = end + 1;
    }

    // Complete upload session
    const completeData = await this.callApi(uploadUrl, 'POST', null);

    return {
      success: true,
      data: {
        file: completeData,
        id: completeData.id,
        name: completeData.name,
        size: completeData.size,
        message: 'Large file uploaded successfully',
      },
    };
  }

  private async downloadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    let endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${filePath}`;

    const data = await this.callApi(`${endpoint}?$select=id,name,size,webUrl,@microsoft.graph.downloadUrl`);

    // Get actual file content
    const downloadResponse = await fetch(data['@microsoft.graph.downloadUrl'], {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    const content = await downloadResponse.text();

    return {
      success: true,
      data: {
        metadata: data,
        content,
        id: data.id,
        name: data.name,
        size: data.size,
      },
    };
  }

  private async deleteFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${filePath}`;

    await this.callApi(endpoint, 'DELETE');

    return {
      success: true,
      data: {
        message: 'File deleted successfully',
      },
    };
  }

  private async copyFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const destinationPath = this.resolveValue(this.config.destinationPath, context);
    const destinationName = this.resolveValue(this.config.destinationName, context) || null;

    if (!destinationPath) {
      throw new Error('destinationPath is required');
    }
    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const sourceEndpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${filePath}`;

    const body: any = {
      parentReference: {
        path: destinationPath,
      },
    };

    if (destinationName) {
      body.name = destinationName;
    }

    const data = await this.callApi(`${sourceEndpoint}/copy`, 'POST', body);

    return {
      success: true,
      data: {
        file: data,
        id: data.id,
        name: data.name,
        message: 'File copied successfully',
      },
    };
  }

  private async moveFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const destinationPath = this.resolveValue(this.config.destinationPath, context);
    const destinationName = this.resolveValue(this.config.destinationName, context) || null;

    if (!destinationPath) {
      throw new Error('destinationPath is required');
    }
    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${filePath}`;

    const body: any = {
      parentReference: {
        path: destinationPath,
      },
    };

    if (destinationName) {
      body.name = destinationName;
    }

    const data = await this.callApi(endpoint, 'PATCH', body);

    return {
      success: true,
      data: {
        file: data,
        id: data.id,
        name: data.name,
        message: 'File moved successfully',
      },
    };
  }

  private async getFileInfo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${filePath}`;

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        file: data,
        id: data.id,
        name: data.name,
        size: data.size,
        webUrl: data.webUrl,
      },
    };
  }

  private async listVersions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context);
    const filePath = this.resolveValue(this.config.filePath, context) || null;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/versions`
      : `${this.getDrivePath()}/root:${filePath}:/versions`;

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        versions: data.value || [],
      },
    };
  }

  private async restoreVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const versionId = this.resolveValue(this.config.versionId, context);

    if (!versionId) {
      throw new Error('versionId is required');
    }
    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/versions/${versionId}/restoreVersion`
      : `${this.getDrivePath()}/root:${filePath}:/versions/${versionId}/restoreVersion`;

    const data = await this.callApi(endpoint, 'POST');

    return {
      success: true,
      data: {
        file: data,
        id: data.id,
        message: 'Version restored successfully',
      },
    };
  }

  // ==================== Folder Operations ====================

  private async listItems(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const folderPath = this.resolveValue(this.config.folderPath, context) || '';
    const top = this.config.top || 100;
    const skip = this.config.skip || 0;
    const filter = this.config.filter || '';
    const orderBy = this.config.orderBy || 'name asc';

    let endpoint = folderPath
      ? `${this.getDrivePath()}/root:${folderPath}:/children`
      : `${this.getDrivePath()}/root/children`;

    if (itemId) {
      endpoint = `${this.getDrivePath()}/items/${itemId}/children`;
    }

    const data = await this.callApi(
      `${endpoint}?$top=${top}&$skip=${skip}&$orderby=${orderBy}${filter ? `&$filter=${encodeURIComponent(filter)}` : ''}`
    );

    return {
      success: true,
      data: {
        items: data.value || [],
        folder: data,
      },
    };
  }

  private async createFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const folderPath = this.resolveValue(this.config.folderPath, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const conflictBehavior = this.config.conflictBehavior || 'rename';
    const parentPath = this.resolveValue(this.config.parentPath, context) || '';

    if (!folderPath && !name) {
      throw new Error('Either folderPath or name is required');
    }

    let endpoint: string;
    let body: any;

    if (folderPath) {
      endpoint = `${this.getDrivePath()}/root:${folderPath}`;
      body = {
        folder: {},
        '@microsoft.graph.conflictBehavior': conflictBehavior,
      };
    } else {
      endpoint = `${this.getDrivePath()}/root/children`;
      body = {
        name,
        folder: {},
        '@microsoft.graph.conflictBehavior': conflictBehavior,
      };

      if (parentPath) {
        body.parentReference = {
          path: parentPath,
        };
      }
    }

    const data = await this.callApi(endpoint, 'POST', body);

    return {
      success: true,
      data: {
        folder: data,
        id: data.id,
        name: data.name,
        message: 'Folder created successfully',
      },
    };
  }

  private async deleteFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const folderPath = this.resolveValue(this.config.folderPath, context) || null;

    if (!itemId && !folderPath) {
      throw new Error('Either itemId or folderPath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${folderPath}`;

    await this.callApi(endpoint, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Folder deleted successfully',
      },
    };
  }

  private async getFolderInfo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const folderPath = this.resolveValue(this.config.folderPath, context) || null;

    if (!itemId && !folderPath) {
      throw new Error('Either itemId or folderPath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}`
      : `${this.getDrivePath()}/root:${folderPath}`;

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        folder: data,
        id: data.id,
        name: data.name,
      },
    };
  }

  // ==================== Drive Operations ====================

  private async getDrive(): Promise<NodeExecutionResult> {
    const data = await this.callApi(this.getDrivePath());

    return {
      success: true,
      data: {
        drive: data,
        id: data.id,
        driveType: data.driveType,
        quota: data.quota,
      },
    };
  }

  private async listDrives(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/me/drives');

    return {
      success: true,
      data: {
        drives: data.value || [],
      },
    };
  }

  private async getRecent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const data = await this.callApi(`${this.getDrivePath()}/recent`);

    return {
      success: true,
      data: {
        items: data.value || [],
      },
    };
  }

  // ==================== Search Operations ====================

  private async search(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const top = Math.min(this.config.top || 100, 1000);

    if (!query) {
      throw new Error('query is required');
    }

    const data = await this.callApi(
      `${this.getDrivePath()}/root/search(q='${encodeURIComponent(query)}'&$top=${top})`
    );

    return {
      success: true,
      data: {
        items: data.value || [],
      },
    };
  }

  // ==================== Thumbnail Operations ====================

  private async getThumbnail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const size = this.config.size || 'large';
    const crop = this.config.crop !== false;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/thumbnails`
      : `${this.getDrivePath()}/root:${filePath}:/thumbnails`;

    const body = {
      size,
      crop,
    };

    const data = await this.callApi(endpoint, 'POST', body);

    if (data.value && data.value.length > 0) {
      const thumbnail = data.value[0];
      // Get actual thumbnail image
      const thumbnailResponse = await fetch(thumbnail.url);
      const thumbnailData = await thumbnailResponse.arrayBuffer();
      const base64Thumbnail = Buffer.from(thumbnailData).toString('base64');

      return {
        success: true,
        data: {
          thumbnail: `data:image/jpeg;base64,${base64Thumbnail}`,
          size: thumbnail.size,
          id: thumbnail.id,
        },
      };
    }

    return {
      success: true,
      data: {
        message: 'No thumbnail available',
      },
    };
  }

  // ==================== Sharing Operations ====================

  private async createShareLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const type = this.config.type || 'view';
    const scope = this.config.scope || 'anonymous';

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/createLink`
      : `${this.getDrivePath()}/root:${filePath}:/createLink`;

    const body = {
      type,
      scope,
    };

    const data = await this.callApi(endpoint, 'POST', body);

    return {
      success: true,
      data: {
        link: data,
        shareUrl: data.link?.webUrl,
        id: data.id,
        message: 'Share link created successfully',
      },
    };
  }

  private async listShareLinks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/permissions`
      : `${this.getDrivePath()}/root:${filePath}:/permissions`;

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        permissions: data.value || [],
        shareLinks: (data.value || []).filter((p: any) => p.link),
      },
    };
  }

  private async getPermissions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/permissions`
      : `${this.getDrivePath()}/root:${filePath}:/permissions`;

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        permissions: data.value || [],
      },
    };
  }

  private async grantPermission(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const recipients = this.config.recipients || [];
    const roles = this.config.roles || ['read'];

    if (!itemId && !filePath) {
      throw new Error('Either itemId or filePath is required');
    }
    if (recipients.length === 0) {
      throw new Error('recipients are required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/grant`
      : `${this.getDrivePath()}/root:${filePath}:/grant`;

    const body = {
      recipients,
      roles,
    };

    const data = await this.callApi(endpoint, 'POST', body);

    return {
      success: true,
      data: {
        permissions: data.value || [],
        message: 'Permissions granted successfully',
      },
    };
  }

  private async deletePermission(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context) || null;
    const filePath = this.resolveValue(this.config.filePath, context) || null;
    const permissionId = this.resolveValue(this.config.permissionId, context);

    if (!permissionId) {
      throw new Error('permissionId is required');
    }

    const endpoint = itemId
      ? `${this.getDrivePath()}/items/${itemId}/permissions/${permissionId}`
      : `${this.getDrivePath()}/root:${filePath}:/permissions/${permissionId}`;

    await this.callApi(endpoint, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Permission deleted successfully',
      },
    };
  }

  // ==================== Special Folders ====================

  private async getSpecialFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const folder = this.config.folder || 'documents';
    const folderNames: any = {
      documents: 'Documents',
      pictures: 'Photos',
      camera: 'Camera Roll',
      desktop: 'Desktop',
      music: 'Music',
      videos: 'Videos',
    };

    if (!folderNames[folder]) {
      throw new Error(`Invalid folder. Available: ${Object.keys(folderNames).join(', ')}`);
    }

    const endpoint = `${this.getDrivePath()}/special/${folder}`;

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        folder: data,
        id: data.id,
        name: data.name,
        path: data.parentReference?.path,
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly ConflictBehavior = {
    Rename: 'rename',
    Fail: 'fail',
    Replace: 'replace',
  } as const;

  static readonly ThumbnailSize = {
    Small: 'small',
    Medium: 'medium',
    Large: 'large',
  } as const;

  static readonly ShareLinkType = {
    View: 'view',
    Edit: 'edit',
    Embed: 'embed',
  } as const;

  static readonly ShareScope = {
    Anonymous: 'anonymous',
    Organization: 'organization',
  } as const;

  /**
   * Format OneDrive API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    return error.message || 'Unknown OneDrive API error';
  }

  /**
   * Validate path format
   */
  static isValidPath(path: string): boolean {
    return path.startsWith('/') || path.startsWith('./');
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
  }
}
