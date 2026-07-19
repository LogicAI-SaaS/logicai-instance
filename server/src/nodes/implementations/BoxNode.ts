import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * BoxNode - Box Cloud Storage API Integration
 *
 * Provides comprehensive integration with Box API including:
 * - Files: Upload, download, delete, copy, move, lock, metadata
 * - Folders: Create, list, delete, get info, collaboration
 * - Search: Search files and folders
 * - Sharing: Create shared links, manage permissions
 * - Comments: Add, get, update, delete comments
 * - Versions: List file versions, restore, delete
 * - Tasks: Create and manage tasks on files
 * - Collaborators: Manage folder collaborations
 * - Retention: Apply retention policies
 * - Watermarking: Apply watermarks to files
 * - Metadata: File and folder metadata templates
 * - Locks: Lock and unlock files
 * - Webhooks: Manage webhook notifications
 *
 * Authentication: OAuth2 Access Token
 * API Docs: https://developer.box.com/reference
 */
export class BoxNode extends BaseNode {
  readonly accessToken: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.accessToken = config.accessToken || '';

    if (!this.accessToken) {
      throw new Error('Box access token is required');
    }

    this.apiUrl = 'https://api.box.com/2.0';
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
    return 'box';
  }

  getIcon(): string {
    return '📦';
  }

  getCategory(): string {
    return 'cloud-storage';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'listFolderItems';

    try {
      switch (operation) {
        // File Operations
        case 'uploadFile':
          return await this.uploadFile(context);
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
        case 'updateFileInfo':
          return await this.updateFileInfo(context);

        // Folder Operations
        case 'listFolderItems':
          return await this.listFolderItems(context);
        case 'createFolder':
          return await this.createFolder(context);
        case 'deleteFolder':
          return await this.deleteFolder(context);
        case 'getFolderInfo':
          return await this.getFolderInfo(context);
        case 'getTrashItems':
          return await this.getTrashItems(context);
        case 'permanentlyDelete':
          return await this.permanentlyDelete(context);

        // Search Operations
        case 'search':
          return await this.search(context);
        case 'searchFiles':
          return await this.searchFiles(context);

        // Sharing Operations
        case 'createSharedLink':
          return await this.createSharedLink(context);
        case 'updateSharedLink':
          return await this.updateSharedLink(context);
        case 'getSharedLink':
          return await this.getSharedLink(context);
        case 'deleteSharedLink':
          return await this.deleteSharedLink(context);

        // Comment Operations
        case 'listComments':
          return await this.listComments(context);
        case 'createComment':
          return await this.createComment(context);
        case 'updateComment':
          return await this.updateComment(context);
        case 'deleteComment':
          return await this.deleteComment(context);

        // Version Operations
        case 'listVersions':
          return await this.listVersions(context);
        case 'restoreVersion':
          return await this.restoreVersion(context);
        case 'deleteVersion':
          return await this.deleteVersion(context);

        // Lock Operations
        case 'lockFile':
          return await this.lockFile(context);
        case 'unlockFile':
          return await this.unlockFile(context);
        case 'getLock':
          return await this.getLock(context);

        // Collaboration Operations
        case 'listCollaborations':
          return await this.listCollaborations(context);
        case 'addCollaborator':
          return await this.addCollaborator(context);
        case 'updateCollaboration':
          return await this.updateCollaboration(context);
        case 'removeCollaborator':
          return await this.removeCollaborator(context);

        // Task Operations
        case 'listTasks':
          return await this.listTasks(context);
        case 'createTask':
          return await this.createTask(context);
        case 'updateTask':
          return await this.updateTask(context);
        case 'deleteTask':
          return await this.deleteTask(context);

        // Metadata Operations
        case 'getMetadata':
          return await this.getMetadata(context);
        case 'createMetadataTemplate':
          return await this.createMetadataTemplate(context);
        case 'getMetadataTemplates':
          return await this.getMetadataTemplates(context);

        // Watermarking Operations
        case 'applyWatermark':
          return await this.applyWatermark(context);
        case 'getWatermark':
          return await this.getWatermark(context);
        case 'removeWatermark':
          return await this.removeWatermark(context);

        // Webhook Operations
        case 'listWebhooks':
          return await this.listWebhooks();
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'deleteWebhook':
          return await this.deleteWebhook(context);
        case 'verifyWebhook':
          return await this.verifyWebhook(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Box operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  private async callApi(
    endpoint: string,
    method = 'GET',
    body?: any,
    queryParams?: Record<string, string>
  ): Promise<any> {
    let url = `${this.apiUrl}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Box API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        } else if (errorJson.error?.description) {
          errorMessage = errorJson.error.description;
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
    const parentId = this.resolveValue(this.config.parentId, context) || '0';
    const fileName = this.resolveValue(this.config.fileName, context);
    const fileData = this.resolveValue(this.config.fileData, context);
    const contentCreatedAt = this.resolveValue(this.config.contentCreatedAt, context) || null;
    const description = this.resolveValue(this.config.description, context) || '';
    const tags = this.config.tags || [];

    if (!fileName) {
      throw new Error('fileName is required');
    }
    if (!fileData) {
      throw new Error('fileData is required');
    }

    const url = `${this.apiUrl}/files/content`;
    const formData = new FormData();
    formData.append('attributes', JSON.stringify({
      name: fileName,
      parent: { id: parentId },
      ...(contentCreatedAt && { content_created_at: contentCreatedAt }),
      ...(description && { description }),
      ...(tags.length > 0 && { tags }),
    }));
    formData.append('file', fileData);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        entries: data.entries || [],
        file: data.entries?.[0],
        id: data.entries?.[0]?.id,
        name: data.entries?.[0]?.name,
        size: data.entries?.[0]?.size,
        message: 'File uploaded successfully',
      },
    };
  }

  private async downloadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}`, 'GET');
    const downloadUrl = data.shared_link?.download_url || `${this.apiUrl}/files/${fileId}/content`;

    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!downloadResponse.ok) {
      throw new Error(`Download failed: ${downloadResponse.statusText}`);
    }

    const content = await downloadResponse.text();

    return {
      success: true,
      data: {
        metadata: data,
        content,
        id: data.id,
        name: data.name,
        size: data.size,
        message: 'File downloaded successfully',
      },
    };
  }

  private async deleteFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}`, 'DELETE');

    return {
      success: true,
      data: {
        file: data,
        message: 'File deleted successfully',
      },
    };
  }

  private async copyFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const parentId = this.resolveValue(this.config.parentId, context) || '0';
    const newName = this.resolveValue(this.config.newName, context) || null;

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const body: any = {
      parent: { id: parentId },
    };

    if (newName) {
      body.name = newName;
    }

    const data = await this.callApi(`/files/${fileId}/copy`, 'POST', body);

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
    const fileId = this.resolveValue(this.config.fileId, context);
    const parentId = this.resolveValue(this.config.parentId, context) || null;
    const folderId = this.resolveValue(this.config.folderId, context) || null;

    if (!fileId) {
      throw new Error('fileId is required');
    }
    if (!parentId && !folderId) {
      throw new Error('Either parentId or folderId is required');
    }

    const body: any = {};
    if (parentId) {
      body.parent = { id: parentId };
    }
    if (folderId) {
      body.parent = { id: folderId };
    }

    const data = await this.callApi(`/files/${fileId}`, 'PUT', body);

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
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async updateFileInfo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const description = this.resolveValue(this.config.description, context) || null;
    const tags = this.config.tags || null;
    const lock = this.config.lock !== undefined ? this.config.lock : null;

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const body: any = {};
    if (name) {
      body.name = name;
    }
    if (description !== null) {
      body.description = description;
    }
    if (tags) {
      body.tags = tags;
    }
    if (lock !== null) {
      body.lock = lock ? { type: 'lock' } : { type: 'unlock' };
    }

    const data = await this.callApi(`/files/${fileId}`, 'PUT', body);

    return {
      success: true,
      data: {
        file: data,
        message: 'File info updated successfully',
      },
    };
  }

  // ==================== Folder Operations ====================

  private async listFolderItems(context: ExecutionContext): Promise<NodeExecutionResult> {
    const folderId = this.resolveValue(this.config.folderId, context) || '0';
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;
    const sort = this.config.sort || 'name';
    const direction = this.config.direction || 'ASC';

    const data = await this.callApi(`/folders/${folderId}/items`, 'GET', null, {
      limit: String(limit),
      offset: String(offset),
      sort,
      direction,
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
        offset: data.offset || 0,
        limit: data.limit,
      },
    };
  }

  private async createFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const parentFolderId = this.resolveValue(this.config.parentFolderId, context) || '0';
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || '';

    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      name,
      parent: { id: parentFolderId },
    };

    if (description) {
      body.description = description;
    }

    const data = await this.callApi('/folders', 'POST', body);

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
    const folderId = this.resolveValue(this.config.folderId, context);
    const recursive = this.config.recursive !== false;

    if (!folderId) {
      throw new Error('folderId is required');
    }

    const queryParams = recursive ? { recursive: 'true' } : undefined;

    await this.callApi(`/folders/${folderId}`, 'DELETE', null, queryParams);

    return {
      success: true,
      data: {
        message: 'Folder deleted successfully',
      },
    };
  }

  private async getFolderInfo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const folderId = this.resolveValue(this.config.folderId, context);

    if (!folderId) {
      throw new Error('folderId is required');
    }

    const data = await this.callApi(`/folders/${folderId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async getTrashItems(context: ExecutionContext): Promise<NodeExecutionResult> {
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;
    const sort = this.config.sort || 'name';
    const direction = this.config.direction || 'ASC';

    const data = await this.callApi('/folders/trash/items', 'GET', null, {
      limit: String(limit),
      offset: String(offset),
      sort,
      direction,
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
      },
    };
  }

  private async permanentlyDelete(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context);

    if (!itemId) {
      throw new Error('itemId is required');
    }

    await this.callApi(`/trash/${itemId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Item permanently deleted',
      },
    };
  }

  // ==================== Search Operations ====================

  private async search(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const scope = this.config.scope || '';
    const contentTypes = this.config.contentTypes || [];
    const fileExtensions = this.config.fileExtensions || [];
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;

    if (!query) {
      throw new Error('query is required');
    }

    const queryParams: Record<string, string> = {
      query,
      limit: String(limit),
      offset: String(offset),
    };

    if (scope) {
      queryParams.scope = scope;
    }

    const data = await this.callApi('/search', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
        limit: data.limit || 100,
        offset: data.offset || 0,
      },
    };
  }

  private async searchFiles(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const ancestorFolderIds = this.config.ancestorFolderIds || [];
    const contentTypes = this.config.contentTypes || [];
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;

    if (!query) {
      throw new Error('query is required');
    }

    const filters: string[] = [];
    if (contentTypes.length > 0) {
      filters.push(`content_type=${encodeURIComponent(contentTypes.join(','))}`);
    }
    if (ancestorFolderIds.length > 0) {
      filters.push(`ancestor_folder_ids=${encodeURIComponent(ancestorFolderIds.join(','))}`);
    }

    const queryParams: Record<string, string> = {
      query,
      limit: String(limit),
      offset: String(offset),
      ...(filters.length > 0 && { type: 'file', filter: filters.join(' AND ') }),
    };

    const data = await this.callApi('/search', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
      },
    };
  }

  // ==================== Sharing Operations ====================

  private async createSharedLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const itemId = this.resolveValue(this.config.itemId, context);
    const access = this.config.access || 'open';
    const canDownload = this.config.canDownload !== false;
    const canPreview = this.config.canPreview !== false;
    const password = this.resolveValue(this.config.password, context) || null;
    const unsharedAt = this.resolveValue(this.config.unsharedAt, context) || null;
    const vanishingUrl = this.config.vanishingUrl !== false;

    if (!itemId) {
      throw new Error('itemId is required');
    }

    const body: any = {
      access,
      can_download: canDownload,
      can_preview: canPreview,
    };

    if (password) {
      body.password = password;
    }
    if (unsharedAt) {
      body.unshared_at = unsharedAt;
    }
    if (vanishingUrl) {
      body.vanishing_url = vanishingUrl;
    }

    const data = await this.callApi(`/files/${itemId}/shared_links`, 'POST', {
      shared_link: body,
    });

    return {
      success: true,
      data: {
        sharedLink: data,
        url: data.url,
        access: data.access,
        downloadUrl: data.download_url,
        vanityUrl: data.vanity_url,
        message: 'Shared link created successfully',
      },
    };
  }

  private async updateSharedLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedLinkUrl = this.resolveValue(this.config.sharedLinkUrl, context);
    const access = this.config.access || null;
    const canDownload = this.config.canDownload !== undefined ? this.config.canDownload : null;
    const canPreview = this.config.canPreview !== undefined ? this.config.canPreview : null;
    const password = this.resolveValue(this.config.password, context) || null;
    const unsharedAt = this.resolveValue(this.config.unsharedAt, context) || null;

    if (!sharedLinkUrl) {
      throw new Error('sharedLinkUrl is required');
    }

    // Extract shared link ID from URL
    const linkId = sharedLinkUrl.split('/').pop();

    const body: any = {};
    if (access) {
      body.access = access;
    }
    if (canDownload !== null) {
      body.can_download = canDownload;
    }
    if (canPreview !== null) {
      body.can_preview = canPreview;
    }
    if (password) {
      body.password = password;
    }
    if (unsharedAt) {
      body.unshared_at = unsharedAt;
    }

    const data = await this.callApi(`/shared_links/${linkId}`, 'PUT', {
      shared_link: body,
    });

    return {
      success: true,
      data: {
        sharedLink: data,
        message: 'Shared link updated successfully',
      },
    };
  }

  private async getSharedLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedLinkUrl = this.resolveValue(this.config.sharedLinkUrl, context);

    if (!sharedLinkUrl) {
      throw new Error('sharedLinkUrl is required');
    }

    const linkId = sharedLinkUrl.split('/').pop();
    const data = await this.callApi(`/shared_links/${linkId}`);

    return {
      success: true,
      data: {
        sharedLink: data,
      },
    };
  }

  private async deleteSharedLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedLinkUrl = this.resolveValue(this.config.sharedLinkUrl, context);

    if (!sharedLinkUrl) {
      throw new Error('sharedLinkUrl is required');
    }

    const linkId = sharedLinkUrl.split('/').pop();
    await this.callApi(`/shared_links/${linkId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Shared link deleted successfully',
      },
    };
  }

  // ==================== Comment Operations ====================

  private async listComments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}/comments`, 'GET', null, {
      limit: String(limit),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
      },
    };
  }

  private async createComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const message = this.resolveValue(this.config.message, context);
    const taggedMessage = this.resolveValue(this.config.taggedMessage, context) || null;

    if (!fileId) {
      throw new Error('fileId is required');
    }
    if (!message && !taggedMessage) {
      throw new Error('Either message or taggedMessage is required');
    }

    const body: any = {
      message,
    };

    if (taggedMessage) {
      body.tagged_message = taggedMessage;
    }

    const data = await this.callApi(`/files/${fileId}/comments`, 'POST', body);

    return {
      success: true,
      data: {
        comment: data,
        id: data.id,
        message: 'Comment created successfully',
      },
    };
  }

  private async updateComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const commentId = this.resolveValue(this.config.commentId, context);
    const message = this.resolveValue(this.config.message, context) || null;

    if (!fileId) {
      throw new Error('fileId is required');
    }
    if (!commentId) {
      throw new Error('commentId is required');
    }

    const body: any = {};
    if (message) {
      body.message = message;
    }

    const data = await this.callApi(`/comments/${commentId}`, 'PUT', body);

    return {
      success: true,
      data: {
        comment: data,
        message: 'Comment updated successfully',
      },
    };
  }

  private async deleteComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const commentId = this.resolveValue(this.config.commentId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }
    if (!commentId) {
      throw new Error('commentId is required');
    }

    await this.callApi(`/comments/${commentId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Comment deleted successfully',
      },
    };
  }

  // ==================== Version Operations ====================

  private async listVersions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}/versions`, 'GET', null, {
      limit: String(limit),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
      },
    };
  }

  private async restoreVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const versionId = this.resolveValue(this.config.versionId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }
    if (!versionId) {
      throw new Error('versionId is required');
    }

    const data = await this.callApi(`/files/${fileId}/versions/${versionId}/restore`, 'POST');

    return {
      success: true,
      data: {
        file: data,
        message: 'Version restored successfully',
      },
    };
  }

  private async deleteVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const versionId = this.resolveValue(this.config.versionId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }
    if (!versionId) {
      throw new Error('versionId is required');
    }

    await this.callApi(`/files/${fileId}/versions/${versionId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Version deleted successfully',
      },
    };
  }

  // ==================== Lock Operations ====================

  private async lockFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const expiresAt = this.resolveValue(this.config.expiresAt, context) || null;
    const isPreventDownload = this.config.isPreventDownload !== false;

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}/lock`, 'POST', {
      lock: {
        type: 'lock',
        ...(expiresAt && { expires_at: expiresAt }),
        is_prevent_download: isPreventDownload,
      },
    });

    return {
      success: true,
      data: {
        lock: data,
        id: data.id,
        message: 'File locked successfully',
      },
    };
  }

  private async unlockFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    await this.callApi(`/files/${fileId}/lock`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'File unlocked successfully',
      },
    };
  }

  private async getLock(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}/lock`);

    return {
      success: true,
      data: {
        lock: data,
        isLocked: data.type === 'lock',
      },
    };
  }

  // ==================== Collaboration Operations ====================

  private async listCollaborations(context: ExecutionContext): Promise<NodeExecutionResult> {
    const folderId = this.resolveValue(this.config.folderId, context);
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;

    if (!folderId) {
      throw new Error('folderId is required');
    }

    const data = await this.callApi(`/folders/${folderId}/collaborations`, 'GET', null, {
      limit: String(limit),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
      },
    };
  }

  private async addCollaborator(context: ExecutionContext): Promise<NodeExecutionResult> {
    const folderId = this.resolveValue(this.config.folderId, context);
    const accessibleBy = this.resolveValue(this.config.accessibleBy, context);
    const role = this.config.role || 'viewer';
    const notify = this.config.notify !== false;
    const canViewPath = this.config.canViewPath !== false;
    const canDownload = this.config.canDownload !== false;
    const canPreview = this.config.canPreview !== false;

    if (!folderId) {
      throw new Error('folderId is required');
    }
    if (!accessibleBy) {
      throw new Error('accessibleBy (login/email) is required');
    }

    const body: any = {
      accessibleBy: { login: accessibleBy },
      role,
    };

    if (notify) {
      body.notify = notify;
    }
    if (canViewPath) {
      body.can_view_path = canViewPath;
    }
    if (canDownload) {
      body.can_download = canDownload;
    }
    if (canPreview) {
      body.can_preview = canPreview;
    }

    const data = await this.callApi(`/folders/${folderId}/collaborations`, 'POST', body);

    return {
      success: true,
      data: {
        collaboration: data,
        id: data.id,
        message: 'Collaborator added successfully',
      },
    };
  }

  private async updateCollaboration(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collaborationId = this.resolveValue(this.config.collaborationId, context);
    const role = this.config.role || 'viewer';
    const canViewPath = this.config.canViewPath !== false;
    const canDownload = this.config.canDownload !== false;
    const canPreview = this.config.canPreview !== false;

    if (!collaborationId) {
      throw new Error('collaborationId is required');
    }

    const body: any = {
      role,
    };

    if (canViewPath) {
      body.can_view_path = canViewPath;
    }
    if (canDownload) {
      body.can_download = canDownload;
    }
    if (canPreview) {
      body.can_preview = canPreview;
    }

    const data = await this.callApi(`/collaborations/${collaborationId}`, 'PUT', body);

    return {
      success: true,
      data: {
        collaboration: data,
        message: 'Collaboration updated successfully',
      },
    };
  }

  private async removeCollaborator(context: ExecutionContext): Promise<NodeExecutionResult> {
    const collaborationId = this.resolveValue(this.config.collaborationId, context);

    if (!collaborationId) {
      throw new Error('collaborationId is required');
    }

    await this.callApi(`/collaborations/${collaborationId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Collaborator removed successfully',
      },
    };
  }

  // ==================== Task Operations ====================

  private async listTasks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context) || null;
    const folderId = this.resolveValue(this.config.folderId, context) || null;
    const limit = Math.min(this.config.limit || 100, 1000);
    const offset = this.config.offset || 0;

    if (!fileId && !folderId) {
      throw new Error('Either fileId or folderId is required');
    }

    let endpoint = '';
    if (fileId) {
      endpoint = `/files/${fileId}/tasks`;
    } else if (folderId) {
      endpoint = `/folders/${folderId}/tasks`;
    }

    const data = await this.callApi(endpoint, 'GET', null, {
      limit: String(limit),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        total_count: data.total_count || 0,
      },
    };
  }

  private async createTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context) || null;
    const folderId = this.resolveValue(this.config.folderId, context) || null;
    const message = this.resolveValue(this.config.message, context);
    const dueAt = this.resolveValue(this.config.dueAt, context) || null;
    const action = this.resolveValue(this.config.action, context) || 'review';
    const taskAssignment = this.resolveValue(this.config.taskAssignment, context) || null;
    const isCompleted = this.config.isCompleted !== false;

    if (!fileId && !folderId) {
      throw new Error('Either fileId or folderId is required');
    }
    if (!message) {
      throw new Error('message is required');
    }

    const body: any = {
      item: {
        type: fileId ? 'file' : 'folder',
        id: fileId || folderId,
      },
      message,
      action,
      due_at: dueAt,
      is_completed: isCompleted,
    };

    if (taskAssignment) {
      body.task_assignment = {
        login: taskAssignment,
      };
    }

    const data = await this.callApi('/tasks', 'POST', body);

    return {
      success: true,
      data: {
        task: data,
        id: data.id,
        message: 'Task created successfully',
      },
    };
  }

  private async updateTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);
    const message = this.resolveValue(this.config.message, context) || null;
    const dueAt = this.resolveValue(this.config.dueAt, context) || null;
    const action = this.config.action || null;
    const isCompleted = this.config.isCompleted !== undefined ? this.config.isCompleted : null;

    if (!taskId) {
      throw new Error('taskId is required');
    }

    const body: any = {};
    if (message) {
      body.message = message;
    }
    if (dueAt) {
      body.due_at = dueAt;
    }
    if (action) {
      body.action = action;
    }
    if (isCompleted !== null) {
      body.is_completed = isCompleted;
    }

    const data = await this.callApi(`/tasks/${taskId}`, 'PUT', body);

    return {
      success: true,
      data: {
        task: data,
        message: 'Task updated successfully',
      },
    };
  }

  private async deleteTask(context: ExecutionContext): Promise<NodeExecutionResult> {
    const taskId = this.resolveValue(this.config.taskId, context);

    if (!taskId) {
      throw new Error('taskId is required');
    }

    await this.callApi(`/tasks/${taskId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Task deleted successfully',
      },
    };
  }

  // ==================== Metadata Operations ====================

  private async getMetadata(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context) || null;
    const folderId = this.resolveValue(this.config.folderId, context) || null;
    const scope = this.config.scope || 'global';

    if (!fileId && !folderId) {
      throw new Error('Either fileId or folderId is required');
    }

    let endpoint = '';
    if (fileId) {
      endpoint = `/files/${fileId}/metadata/${scope}`;
    } else if (folderId) {
      endpoint = `/folders/${folderId}/metadata/${scope}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        metadata: data,
      },
    };
  }

  private async createMetadataTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const displayName = this.resolveValue(this.config.displayName, context);
    const scope = this.config.scope || 'global';
    const templateKey = this.config.templateKey || '';
    const fields = this.config.fields || [];
    const hidden = this.config.hidden !== false;

    if (!displayName) {
      throw new Error('displayName is required');
    }
    if (!templateKey) {
      throw new Error('templateKey is required');
    }

    const body: any = {
      displayName,
      hidden,
      fields,
    };

    const data = await this.callApi('/metadata_templates/global', 'POST', {
      scope,
      templateKey,
      metadataTemplate: body,
    });

    return {
      success: true,
      data: {
        template: data,
        message: 'Metadata template created successfully',
      },
    };
  }

  private async getMetadataTemplates(context: ExecutionContext): Promise<NodeExecutionResult> {
    const scope = this.config.scope || 'global';

    const data = await this.callApi(`/metadata_templates/${scope}`);

    return {
      success: true,
      data: {
        entries: data.entries || [],
      },
    };
  }

  // ==================== Watermarking Operations ====================

  private async applyWatermark(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);
    const defaultWatermarkText = this.resolveValue(this.config.defaultWatermarkText, context) || '';

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}/watermark`, 'PUT', {
      default_watermark_text: defaultWatermarkText,
    });

    return {
      success: true,
      data: {
        watermark: data,
        message: 'Watermark applied successfully',
      },
    };
  }

  private async getWatermark(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    const data = await this.callApi(`/files/${fileId}/watermark`);

    return {
      success: true,
      data: {
        watermark: data,
      },
    };
  }

  private async removeWatermark(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileId = this.resolveValue(this.config.fileId, context);

    if (!fileId) {
      throw new Error('fileId is required');
    }

    await this.callApi(`/files/${fileId}/watermark`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Watermark removed successfully',
      },
    };
  }

  // ==================== Webhook Operations ====================

  private async listWebhooks(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/webhooks');

    return {
      success: true,
      data: {
        entries: data.entries || [],
      },
    };
  }

  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const targetUrl = this.resolveValue(this.config.targetUrl, context);
    const topic = this.config.topic || 'all';
    const address = this.resolveValue(this.config.address, context) || null;
    const triggers = this.config.triggers || ['FILE.UPLOADED', 'FILE.UPDATED'];

    if (!targetUrl) {
      throw new Error('targetUrl is required');
    }

    const body: any = {
      target: {
        type: 'webhook',
        address: targetUrl,
      },
      triggers,
    };

    if (address) {
      body.notification_emails = { address };
    }

    const data = await this.callApi('/webhooks', 'POST', body);

    return {
      success: true,
      data: {
        webhook: data,
        id: data.id,
        message: 'Webhook created successfully',
      },
    };
  }

  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    await this.callApi(`/webhooks/${webhookId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Webhook deleted successfully',
      },
    };
  }

  private async verifyWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const data = await this.callApi(`/webhooks/${webhookId}`, 'GET');

    return {
      success: true,
      data: {
        webhook: data,
        isActive: data.active,
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly FileAccessLevel = {
    Owner: 'owner',
    CoOwner: 'co-owner',
    Editor: 'editor',
    ViewerPreview: 'viewer preview',
    Viewer: 'viewer',
    ViewerNoDownload: 'viewer no-download',
    Uploader: 'uploader',
    Previewer: 'previewer',
    UploaderPreviewer: 'uploader-previewer',
  } as const;

  static readonly SharedLinkAccessLevel = {
    Open: 'open',
    Collaborators: 'collaborators',
    Company: 'company',
  } as const;

  static readonly TaskAction = {
    Review: 'review',
    Complete: 'complete',
    Comment: 'comment',
  } as const;

  static readonly SearchScope = {
    UserContent: 'user_content',
    EnterpriseContent: 'enterprise_content',
  } as const;

  /**
   * Format Box API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response?.data?.error?.description) {
      return error.response.data.error.description;
    }
    return error.message || 'Unknown Box API error';
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format Box item URL
   */
  static getItemUrl(id: string, type = 'file'): string {
    const baseUrl = 'https://app.box.com';
    if (type === 'folder') {
      return `${baseUrl}/folder/${id}`;
    }
    return `${baseUrl}/file/${id}`;
  }

  /**
   * Check if path is a file or folder
   */
  static getItemType(path: string): string {
    // Box uses IDs for both files and folders
    // You would need to check the type attribute from the API
    return path.startsWith('folder_') ? 'folder' : 'file';
  }
}
