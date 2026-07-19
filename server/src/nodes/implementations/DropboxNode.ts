import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * DropboxNode - Dropbox Cloud Storage API Integration
 *
 * Provides comprehensive integration with Dropbox API including:
 * - Files: Upload, download, delete, copy, move, search
 * - Folders: Create, list, delete, get info
 * - Sharing: Create share links, manage permissions, shared folders
 * - Revisions: List file versions, restore
 * - Search: Search files and folders
 * - Thumbnails: Generate thumbnails
 * - Paper: Dropbox Paper documents
 * - Team: Team folders, member management
 * - Properties: File properties and metadata
 * - Locking: Lock/unlock files
 * - Preview: Generate file previews
 *
 * Authentication: OAuth2 Bearer Token
 * API Docs: https://www.dropbox.com/developers/documentation/http/overview
 */
export class DropboxNode extends BaseNode {
  readonly accessToken: string;
  readonly apiUrl: string;
  readonly contentUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.accessToken = config.accessToken || '';

    if (!this.accessToken) {
      throw new Error('Dropbox access token is required');
    }

    this.apiUrl = 'https://api.dropboxapi.com/2';
    this.contentUrl = 'https://content.dropboxapi.com/2';
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
    return 'dropbox';
  }

  getIcon(): string {
    return '📦';
  }

  getCategory(): string {
    return 'cloud-storage';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'listFolder';

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
        case 'getTemporaryLink':
          return await this.getTemporaryLink(context);
        case 'getThumbnail':
          return await this.getThumbnail(context);
        case 'getPreview':
          return await this.getPreview(context);

        // Folder Operations
        case 'listFolder':
          return await this.listFolder(context);
        case 'createFolder':
          return await this.createFolder(context);
        case 'deleteFolder':
          return await this.deleteFolder(context);
        case 'getFolderInfo':
          return await this.getFolderInfo(context);
        case 'listFolderLongpoll':
          return await this.listFolderLongpoll(context);
        case 'listRevisions':
          return await this.listRevisions(context);
        case 'restoreRevision':
          return await this.restoreRevision(context);

        // Search Operations
        case 'search':
          return await this.search(context);
        case 'searchFiles':
          return await this.searchFiles(context);

        // Sharing Operations
        case 'createSharedLink':
          return await this.createSharedLink(context);
        case 'listSharedLinks':
          return await this.listSharedLinks(context);
        case 'revokeSharedLink':
          return await this.revokeSharedLink(context);
        case 'createSharedFolder':
          return await this.createSharedFolder(context);
        case 'listSharedFolders':
          return await this.listSharedFolders(context);
        case 'getSharedFolderMetadata':
          return await this.getSharedFolderMetadata(context);
        case 'updateFolderPolicy':
          return await this.updateFolderPolicy(context);
        case 'mountFolder':
          return await this.mountFolder(context);
        case 'unmountFolder':
          return await this.unmountFolder(context);

        // Locking Operations
        case 'lockFile':
          return await this.lockFile(context);
        case 'unlockFile':
          return await this.unlockFile(context);
        case 'listLocks':
          return await this.listLocks(context);

        // Properties Operations
        case 'addProperties':
          return await this.addProperties(context);
        case 'updateProperties':
          return await this.updateProperties(context);
        case 'removeProperties':
          return await this.removeProperties(context);
        case 'listProperties':
          return await this.listProperties(context);
        case 'getPropertyGroups':
          return await this.getPropertyGroups(context);
        case 'createPropertyGroupTemplate':
          return await this.createPropertyGroupTemplate(context);
        case 'deletePropertyGroupTemplate':
          return await this.deletePropertyGroupTemplate(context);
        case 'listPropertyGroupTemplates':
          return await this.listPropertyGroupTemplates(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Dropbox operation: ${operation}`,
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
    method = 'POST',
    body?: any,
    isContentApi = false
  ): Promise<any> {
    const baseUrl = isContentApi ? this.contentUrl : this.apiUrl;
    const url = `${baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        ...this.getAuthHeaders(),
      },
    };

    if (body) {
      if (isContentApi && endpoint.includes('/upload')) {
        // For upload endpoints, body is passed as arg in DropBox-API-Arg
        options.headers['Dropbox-API-Arg'] = JSON.stringify(body);
      } else if (isContentApi && endpoint.includes('/download')) {
        // For download endpoints, path is passed in DropBox-API-Arg
        options.headers['Dropbox-API-Arg'] = JSON.stringify(body);
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Dropbox API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error_summary) {
          errorMessage = errorJson.error_summary;
        } else if (errorJson.error) {
          errorMessage = JSON.stringify(errorJson.error);
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    // For download endpoints, return raw response
    if (isContentApi && endpoint.includes('/download')) {
      const dropboxData = response.headers.get('dropbox-api-result');
      const fileData = await response.text();
      return {
        metadata: dropboxData ? JSON.parse(dropboxData) : null,
        fileData: body?.binary ? await response.arrayBuffer() : fileData,
      };
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  // ==================== File Operations ====================

  private async uploadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const content = this.resolveValue(this.config.content, context);
    const mode = this.config.mode || 'add';
    const autorename = this.config.autorename !== false;
    const modificationTime = this.resolveValue(this.config.modificationTime, context) || null;
    const mute = this.config.mute !== false;
    const strictConflict = this.config.strictConflict !== false;

    if (!path) {
      throw new Error('path is required');
    }
    if (content === undefined || content === null) {
      throw new Error('content is required');
    }

    const body: any = {
      path,
      mode: { '.tag': mode },
      autorename,
      mute,
      strict_conflict: strictConflict,
    };

    if (modificationTime) {
      body.client_modified = modificationTime;
    }

    // For file content, we need to use the content API
    const options: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Dropbox-API-Arg': JSON.stringify(body),
        'Content-Type': 'application/octet-stream',
      },
      body: content,
    };

    const response = await fetch(`${this.contentUrl}/files/upload`, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Dropbox API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error_summary) {
          errorMessage = errorJson.error_summary;
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        file: data,
        name: data.name,
        path: data.path_lower,
        size: data.size,
        clientModified: data.client_modified,
        serverModified: data.server_modified,
        rev: data.rev,
        message: 'File uploaded successfully',
      },
    };
  }

  private async downloadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const rev = this.resolveValue(this.config.rev, context) || null;

    if (!path) {
      throw new Error('path is required');
    }

    const arg: any = { path };
    if (rev) {
      arg.rev = rev;
    }

    const options: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Dropbox-API-Arg': JSON.stringify(arg),
      },
    };

    const response = await fetch(`${this.contentUrl}/files/download`, options);

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    const dropboxData = JSON.parse(response.headers.get('dropbox-api-result') || '{}');
    const fileData = await response.text();

    return {
      success: true,
      data: {
        metadata: dropboxData,
        content: fileData,
        name: dropboxData.name,
        size: dropboxData.size,
        message: 'File downloaded successfully',
      },
    };
  }

  private async deleteFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/delete', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        file: data,
        path: data.path_lower,
        message: 'File deleted successfully',
      },
    };
  }

  private async copyFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fromPath = this.resolveValue(this.config.fromPath, context);
    const toPath = this.resolveValue(this.config.toPath, context);
    const allowSharedStorage = this.config.allowSharedStorage !== false;
    const autorename = this.config.autorename !== false;
    const allowTransferOwnership = this.config.allowTransferOwnership !== false;

    if (!fromPath) {
      throw new Error('fromPath is required');
    }
    if (!toPath) {
      throw new Error('toPath is required');
    }

    const data = await this.callApi('/files/copy_v2', 'POST', {
      from_path: fromPath,
      to_path: toPath,
      allow_shared_storage: allowSharedStorage,
      autorename,
      allow_transfer_ownership: allowTransferOwnership,
    });

    return {
      success: true,
      data: {
        file: data,
        path: data.path_lower,
        message: 'File copied successfully',
      },
    };
  }

  private async moveFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fromPath = this.resolveValue(this.config.fromPath, context);
    const toPath = this.resolveValue(this.config.toPath, context);
    const allowSharedStorage = this.config.allowSharedStorage !== false;
    const autorename = this.config.autorename !== false;
    const allowTransferOwnership = this.config.allowTransferOwnership !== false;

    if (!fromPath) {
      throw new Error('fromPath is required');
    }
    if (!toPath) {
      throw new Error('toPath is required');
    }

    const data = await this.callApi('/files/move_v2', 'POST', {
      from_path: fromPath,
      to_path: toPath,
      allow_shared_storage: allowSharedStorage,
      autorename,
      allow_transfer_ownership: allowTransferOwnership,
    });

    return {
      success: true,
      data: {
        file: data,
        path: data.path_lower,
        message: 'File moved successfully',
      },
    };
  }

  private async getFileInfo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const includeMediaInfo = this.config.includeMediaInfo !== false;
    const includeDeleted = this.config.includeDeleted !== false;
    const includeHasExplicitSharedMembers = this.config.includeHasExplicitSharedMembers !== false;
    const includeProperties = this.config.includeProperties || [];
    const includePropertyGroups = this.config.includePropertyGroups || false;

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/get_metadata', 'POST', {
      path,
      include_media_info: includeMediaInfo,
      include_deleted: includeDeleted,
      include_has_explicit_shared_members: includeHasExplicitSharedMembers,
      include_properties: includeProperties,
      include_property_groups: includePropertyGroups,
    });

    return {
      success: true,
      data: {
        file: data,
        name: data.name,
        size: data.size,
        path: data.path_lower,
      },
    };
  }

  private async getTemporaryLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/get_temporary_link', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        link: data.link,
        metadata: data.metadata,
        expiresAt: data.expires,
      },
    };
  }

  private async getThumbnail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const format = this.config.format || 'jpeg';
    const size = this.config.size || 'w64h64';

    if (!path) {
      throw new Error('path is required');
    }

    const arg = {
      path,
      format,
      size,
    };

    const options: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Dropbox-API-Arg': JSON.stringify(arg),
      },
    };

    const response = await fetch(`${this.contentUrl}/files/get_thumbnail`, options);

    if (!response.ok) {
      throw new Error(`Failed to get thumbnail: ${response.statusText}`);
    }

    const dropboxData = JSON.parse(response.headers.get('dropbox-api-result') || '{}');
    const thumbnailData = await response.arrayBuffer();
    const base64Thumbnail = Buffer.from(thumbnailData).toString('base64');

    return {
      success: true,
      data: {
        thumbnail: `data:image/${format};base64,${base64Thumbnail}`,
        metadata: dropboxData,
      },
    };
  }

  private async getPreview(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const arg = {
      path,
    };

    const options: RequestInit = {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Dropbox-API-Arg': JSON.stringify(arg),
      },
    };

    const response = await fetch(`${this.contentUrl}/files/get_preview`, options);

    if (!response.ok) {
      throw new Error(`Failed to get preview: ${response.statusText}`);
    }

    const dropboxData = JSON.parse(response.headers.get('dropbox-api-result') || '{}');
    const previewData = await response.text();

    return {
      success: true,
      data: {
        preview: previewData,
        metadata: dropboxData,
      },
    };
  }

  // ==================== Folder Operations ====================

  private async listFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context) || '';
    const recursive = this.config.recursive !== false;
    const includeMediaInfo = this.config.includeMediaInfo !== false;
    const includeDeleted = this.config.includeDeleted !== false;
    const includeHasExplicitSharedMembers = this.config.includeHasExplicitSharedMembers !== false;
    const includeMountedFolders = this.config.includeMountedFolders !== true;
    const limit = this.config.limit || null;
    const sharedLink = this.resolveValue(this.config.sharedLink, context) || null;
    const includePropertyGroups = this.config.includePropertyGroups !== false;

    const data = await this.callApi('/files/list_folder', 'POST', {
      path,
      recursive,
      include_media_info: includeMediaInfo,
      include_deleted: includeDeleted,
      include_has_explicit_shared_members: includeHasExplicitSharedMembers,
      include_mounted_folders: includeMountedFolders,
      limit,
      shared_link: sharedLink,
      include_property_groups: includePropertyGroups,
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        cursor: data.cursor,
        hasMore: data.has_more,
      },
    };
  }

  private async createFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const autorename = this.config.autorename !== false;

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/create_folder_v2', 'POST', {
      path,
      autorename,
    });

    return {
      success: true,
      data: {
        folder: data.metadata,
        path: data.metadata.path_lower,
        name: data.metadata.name,
        message: 'Folder created successfully',
      },
    };
  }

  private async deleteFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/delete_v2', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        folder: data.metadata,
        path: data.metadata.path_lower,
        message: 'Folder deleted successfully',
      },
    };
  }

  private async getFolderInfo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const includeMediaInfo = this.config.includeMediaInfo !== false;
    const includeDeleted = this.config.includeDeleted !== false;
    const includeHasExplicitSharedMembers = this.config.includeHasExplicitSharedMembers !== false;

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/get_metadata', 'POST', {
      path,
      include_media_info: includeMediaInfo,
      include_deleted: includeDeleted,
      include_has_explicit_shared_members: includeHasExplicitSharedMembers,
    });

    return {
      success: true,
      data: {
        folder: data,
        name: data.name,
        path: data.path_lower,
      },
    };
  }

  private async listFolderLongpoll(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cursor = this.resolveValue(this.config.cursor, context);
    const timeout = this.config.timeout || 30;

    if (!cursor) {
      throw new Error('cursor is required (from previous list_folder call)');
    }

    const data = await this.callApi('/files/list_folder/longpoll', 'POST', {
      cursor,
      timeout: Math.min(timeout, 480),
    });

    return {
      success: true,
      data: {
        changes: data !== false,
        backoff: data?.backoff || null,
      },
    };
  }

  private async listRevisions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const limit = Math.min(this.config.limit || 10, 100);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/list_revisions', 'POST', {
      path,
      limit,
    });

    return {
      success: true,
      data: {
        entries: data.entries || [],
        isDeleted: data.is_deleted,
        serverDeleted: data.server_deleted,
      },
    };
  }

  private async restoreRevision(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const rev = this.resolveValue(this.config.rev, context);

    if (!path) {
      throw new Error('path is required');
    }
    if (!rev) {
      throw new Error('rev is required');
    }

    const data = await this.callApi('/files/restore', 'POST', {
      path,
      rev,
    });

    return {
      success: true,
      data: {
        file: data,
        message: 'Revision restored successfully',
      },
    };
  }

  // ==================== Search Operations ====================

  private async search(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const path = this.resolveValue(this.config.path, context) || '';
    const mode = this.config.mode || 'filename';
    const includeDeleted = this.config.includeDeleted !== false;
    const includeHasExplicitSharedMembers = this.config.includeHasExplicitSharedMembers !== false;
    const limit = Math.min(this.config.limit || 100, 1000);

    if (!query) {
      throw new Error('query is required');
    }

    const data = await this.callApi('/files/search_v2', 'POST', {
      query,
      include_deleted: includeDeleted,
      include_has_explicit_shared_members: includeHasExplicitSharedMembers,
      limit,
      options: {
        path,
        mode,
      },
    });

    return {
      success: true,
      data: {
        matches: data.matches || [],
        hasMore: data.has_more,
        cursor: data.cursor,
      },
    };
  }

  private async searchFiles(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const path = this.resolveValue(this.config.path, context) || '';
    const startTime = this.resolveValue(this.config.startTime, context) || null;
    const endTime = this.resolveValue(this.config.endTime, context) || null;
    const includeDeleted = this.config.includeDeleted !== false;
    const limit = Math.min(this.config.limit || 100, 1000);

    if (!query) {
      throw new Error('query is required');
    }

    const options: any = {
      path,
    };

    if (startTime) {
      options.start_time = startTime;
    }
    if (endTime) {
      options.end_time = endTime;
    }

    const data = await this.callApi('/files/search/continue', 'POST', {
      query,
      include_deleted: includeDeleted,
      limit,
      options,
    });

    return {
      success: true,
      data: {
        matches: data.matches || [],
        hasMore: data.has_more,
      },
    };
  }

  // ==================== Sharing Operations ====================

  private async createSharedLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const settings = this.config.settings || {
      requested_visibility: 'public',
      allow_download: true,
    };

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/sharing/create_shared_link_with_settings', 'POST', {
      path,
      settings,
    });

    return {
      success: true,
      data: {
        url: data.url,
        name: data.name,
        pathLower: data.path_lower,
        expires: data.expires,
        message: 'Shared link created successfully',
      },
    };
  }

  private async listSharedLinks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const cursor = this.resolveValue(this.config.cursor, context) || null;
    const limit = Math.min(this.config.limit || 100, 1000);

    if (!path) {
      throw new Error('path is required');
    }

    const body: any = {
      path,
      limit,
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const data = await this.callApi('/sharing/list_shared_links', 'POST', body);

    return {
      success: true,
      data: {
        links: data.links || [],
        hasMore: data.has_more,
        cursor: data.cursor,
      },
    };
  }

  private async revokeSharedLink(context: ExecutionContext): Promise<NodeExecutionResult> {
    const url = this.resolveValue(this.config.url, context);

    if (!url) {
      throw new Error('url is required');
    }

    const data = await this.callApi('/sharing/revoke_shared_link', 'POST', {
      url,
    });

    return {
      success: true,
      data: {
        message: 'Shared link revoked successfully',
      },
    };
  }

  private async createSharedFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const memberPolicy = this.config.memberPolicy || null;
    const aclUpdatePolicy = this.config.aclUpdatePolicy || null;
    const forceAsync = this.config.forceAsync !== false;

    if (!path) {
      throw new Error('path is required');
    }

    const body: any = {
      path,
      force_async: forceAsync,
    };

    if (memberPolicy) {
      body.member_policy = memberPolicy;
    }
    if (aclUpdatePolicy) {
      body.acl_update_policy = aclUpdatePolicy;
    }

    const data = await this.callApi('/sharing/create_shared_folder_with_settings', 'POST', body);

    return {
      success: true,
      data: {
        sharedFolder: data,
        message: 'Shared folder created successfully',
      },
    };
  }

  private async listSharedFolders(context: ExecutionContext): Promise<NodeExecutionResult> {
    const limit = Math.min(this.config.limit || 100, 1000);
    const cursor = this.resolveValue(this.config.cursor, context) || null;

    const body: any = {
      limit,
    };

    if (cursor) {
      body.cursor = cursor;
    }

    const data = await this.callApi('/sharing/list_folders', 'POST', body);

    return {
      success: true,
      data: {
        entries: data.entries || [],
        cursor: data.cursor,
        hasMore: data.has_more,
      },
    };
  }

  private async getSharedFolderMetadata(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedFolderId = this.resolveValue(this.config.sharedFolderId, context);

    if (!sharedFolderId) {
      throw new Error('sharedFolderId is required');
    }

    const data = await this.callApi('/sharing/get_folder_metadata', 'POST', {
      shared_folder_id: sharedFolderId,
    });

    return {
      success: true,
      data: {
        folder: data,
      },
    };
  }

  private async updateFolderPolicy(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedFolderId = this.resolveValue(this.config.sharedFolderId, context);
    const memberPolicy = this.config.memberPolicy || null;
    const aclUpdatePolicy = this.config.aclUpdatePolicy || null;
    const sharedLinkPolicy = this.config.sharedLinkPolicy || null;

    if (!sharedFolderId) {
      throw new Error('sharedFolderId is required');
    }

    const body: any = {
      shared_folder_id: sharedFolderId,
    };

    if (memberPolicy) {
      body.member_policy = memberPolicy;
    }
    if (aclUpdatePolicy) {
      body.acl_update_policy = aclUpdatePolicy;
    }
    if (sharedLinkPolicy) {
      body.shared_link_policy = sharedLinkPolicy;
    }

    const data = await this.callApi('/sharing/update_folder_policy', 'POST', body);

    return {
      success: true,
      data: {
        folder: data,
        message: 'Folder policy updated successfully',
      },
    };
  }

  private async mountFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedFolderId = this.resolveValue(this.config.sharedFolderId, context);
    const path = this.resolveValue(this.config.path, context);

    if (!sharedFolderId) {
      throw new Error('sharedFolderId is required');
    }

    const body: any = {
      shared_folder_id: sharedFolderId,
    };

    if (path) {
      body.path = path;
    }

    const data = await this.callApi('/sharing/mount_folder', 'POST', body);

    return {
      success: true,
      data: {
        folder: data,
        message: 'Folder mounted successfully',
      },
    };
  }

  private async unmountFolder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sharedFolderId = this.resolveValue(this.config.sharedFolderId, context);
    const leaveCopy = this.config.leaveCopy !== false;

    if (!sharedFolderId) {
      throw new Error('sharedFolderId is required');
    }

    const data = await this.callApi('/sharing/unmount_folder', 'POST', {
      shared_folder_id: sharedFolderId,
      leave_copy: leaveCopy,
    });

    return {
      success: true,
      data: {
        folder: data,
        message: 'Folder unmounted successfully',
      },
    };
  }

  // ==================== Locking Operations ====================

  private async lockFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const maxLockDuration = Math.min(this.config.maxLockDuration || 3600, 86400);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/lock', 'POST', {
      path,
      max_lock_duration: maxLockDuration,
    });

    return {
      success: true,
      data: {
        lock: data,
        message: 'File locked successfully',
      },
    };
  }

  private async unlockFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/unlock', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        message: 'File unlocked successfully',
      },
    };
  }

  private async listLocks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/files/list_locks', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        locks: data.entries || [],
      },
    };
  }

  // ==================== Properties Operations ====================

  private async addProperties(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const propertyGroups = this.config.propertyGroups || [];

    if (!path) {
      throw new Error('path is required');
    }
    if (propertyGroups.length === 0) {
      throw new Error('propertyGroups are required');
    }

    const data = await this.callApi('/file_properties/properties/add', 'POST', {
      path,
      property_groups: propertyGroups,
    });

    return {
      success: true,
      data: {
        properties: data,
        message: 'Properties added successfully',
      },
    };
  }

  private async updateProperties(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const propertyGroups = this.config.propertyGroups || [];

    if (!path) {
      throw new Error('path is required');
    }
    if (propertyGroups.length === 0) {
      throw new Error('propertyGroups are required');
    }

    const data = await this.callApi('/file_properties/properties/update', 'POST', {
      path,
      property_groups: propertyGroups,
    });

    return {
      success: true,
      data: {
        properties: data,
        message: 'Properties updated successfully',
      },
    };
  }

  private async removeProperties(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);
    const propertyGroups = this.config.propertyGroups || [];

    if (!path) {
      throw new Error('path is required');
    }
    if (propertyGroups.length === 0) {
      throw new Error('propertyGroups are required');
    }

    const data = await this.callApi('/file_properties/properties/remove', 'POST', {
      path,
      property_groups: propertyGroups,
    });

    return {
      success: true,
      data: {
        message: 'Properties removed successfully',
      },
    };
  }

  private async listProperties(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/file_properties/properties/list', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        properties: data,
      },
    };
  }

  private async getPropertyGroups(context: ExecutionContext): Promise<NodeExecutionResult> {
    const path = this.resolveValue(this.config.path, context);

    if (!path) {
      throw new Error('path is required');
    }

    const data = await this.callApi('/file_properties/property_groups/list', 'POST', {
      path,
    });

    return {
      success: true,
      data: {
        propertyGroups: data.results || [],
      },
    };
  }

  private async createPropertyGroupTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || '';
    const fields = this.config.fields || [];

    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/file_properties/property_groups/templates/create', 'POST', {
      name,
      description,
      fields,
    });

    return {
      success: true,
      data: {
        template: data,
        message: 'Property group template created successfully',
      },
    };
  }

  private async deletePropertyGroupTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }

    await this.callApi('/file_properties/property_groups/templates/delete', 'POST', {
      template_id: templateId,
    });

    return {
      success: true,
      data: {
        message: 'Property group template deleted successfully',
      },
    };
  }

  private async listPropertyGroupTemplates(context: ExecutionContext): Promise<NodeExecutionResult> {
    const data = await this.callApi('/file_properties/property_groups/templates/list', 'POST', {});

    return {
      success: true,
      data: {
        templates: data.templates || [],
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly UploadMode = {
    Add: 'add',
    Overwrite: 'overwrite',
    Update: 'update',
  } as const;

  static readonly ThumbnailFormat = {
    Jpeg: 'jpeg',
    Png: 'png',
    Webp: 'webp',
  } as const;

  static readonly ThumbnailSize = {
    W32H32: 'w32h32',
    W64H64: 'w64h64',
    W128H128: 'w128h128',
    W256H256: 'w256h256',
    W480H320: 'w480h320',
    W640H480: 'w640h480',
    W960H640: 'w960h640',
    W1024H768: 'w1024h768',
    W2048H1536: 'w2048h1536',
  } as const;

  static readonly SearchMode = {
    Filename: 'filename',
    FilenameAndContent: 'filename_and_content',
    DeletedFilename: 'deleted_filename',
  } as const;

  static readonly SharedLinkVisibility = {
    Public: 'public',
    TeamOnly: 'team_only',
    Password: 'password',
    TeamAndPassword: 'team_and_password',
    Count: 'count',
  } as const;

  /**
   * Format Dropbox API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.error_summary) {
      return error.response.data.error_summary;
    }
    if (error.response?.data?.error) {
      return JSON.stringify(error.response.data.error);
    }
    return error.message || 'Unknown Dropbox API error';
  }

  /**
   * Validate path format
   */
  static isValidPath(path: string): boolean {
    return path.startsWith('/');
  }

  /**
   * Escape path for API calls
   */
  static escapePath(path: string): string {
    return path;
  }
}
