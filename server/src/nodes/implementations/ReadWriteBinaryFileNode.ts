import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Read/Write Binary File Node - File system operations
 * n8n-compatible: Read and write binary files
 *
 * Configuration:
 * - operation: 'read' | 'write' | 'delete' | 'move' | 'copy' | 'list'
 * - filePath: Path to the file
 * - data: Data to write (for write operation)
 * - encoding: File encoding (default: 'utf8')
 * - destinationPath: Destination path (for move/copy)
 * - options: { createDirectory, overwrite, baseDir }
 */
export class ReadWriteBinaryFileNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'read';

    if (!['read', 'write', 'delete', 'move', 'copy', 'list'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}. Valid: read, write, delete, move, copy, list`);
    }

    if (!this.config.filePath && operation !== 'list') {
      throw new Error('filePath is required');
    }

    const encoding = this.config.encoding || 'utf8';
    if (!['utf8', 'ascii', 'base64', 'hex', 'binary', 'utf16le'].includes(encoding)) {
      throw new Error(`Invalid encoding: ${encoding}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'read';
      let filePath = this.resolvePath(this.config.filePath, context);
      const data = this.config.data;
      const encoding = this.config.encoding || 'utf8';
      const options = this.config.options || {};

      // Resolve base directory if configured
      if (options.baseDir) {
        filePath = path.resolve(options.baseDir, filePath);
      }

      switch (operation) {
        case 'read':
          return await this.readFile(filePath, encoding);
        case 'write':
          return await this.writeFile(filePath, data, encoding, options);
        case 'delete':
          return await this.deleteFile(filePath);
        case 'move':
          return await this.moveFile(filePath, this.resolvePath(options.destinationPath, context), options);
        case 'copy':
          return await this.copyFile(filePath, this.resolvePath(options.destinationPath, context), options);
        case 'list':
          return await this.listFiles(filePath, options);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Read file
   */
  private async readFile(filePath: string, encoding: string): Promise<NodeExecutionResult> {
    const stats = await fs.stat(filePath).catch(() => null);
    if (!stats) {
      throw new Error(`File not found: ${filePath}`);
    }
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${filePath}`);
    }

    const content = await fs.readFile(filePath, encoding as BufferEncoding);
    const buffer = await fs.readFile(filePath);

    return {
      success: true,
      data: {
        filePath,
        content,
        binaryContent: buffer.toString('base64'),
        encoding,
        size: stats.size,
        mimeType: this.getMimeType(filePath),
        lastModified: stats.mtime,
        created: stats.birthtime,
        isBinary: this.isBinaryFile(filePath),
      },
    };
  }

  /**
   * Write file
   */
  private async writeFile(filePath: string, data: any, encoding: string, options: any): Promise<NodeExecutionResult> {
    // Create directory if needed
    if (options.createDirectory) {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true }).catch(() => {});
    }

    // Check if file exists and overwrite setting
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (exists && options.overwrite === false) {
      throw new Error(`File already exists and overwrite is false: ${filePath}`);
    }

    // Prepare content
    let content: string | Buffer;
    if (options.binary) {
      // Handle binary data
      if (Buffer.isBuffer(data)) {
        content = data;
      } else if (typeof data === 'string' && options.binary === 'base64') {
        content = Buffer.from(data, 'base64');
      } else {
        content = Buffer.from(JSON.stringify(data));
      }
    } else {
      // Handle text data
      content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    }

    await fs.writeFile(filePath, content, encoding as BufferEncoding);

    const stats = await fs.stat(filePath);

    return {
      success: true,
      data: {
        filePath,
        written: true,
        size: stats.size,
        encoding,
        mimeType: this.getMimeType(filePath),
      },
    };
  }

  /**
   * Delete file
   */
  private async deleteFile(filePath: string): Promise<NodeExecutionResult> {
    const exists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!exists) {
      throw new Error(`File not found: ${filePath}`);
    }

    await fs.unlink(filePath);

    return {
      success: true,
      data: {
        filePath,
        deleted: true,
      },
    };
  }

  /**
   * Move file
   */
  private async moveFile(filePath: string, destinationPath: string, options: any): Promise<NodeExecutionResult> {
    if (!destinationPath) {
      throw new Error('destinationPath is required for move operation');
    }

    const sourceExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!sourceExists) {
      throw new Error(`Source file not found: ${filePath}`);
    }

    // Create destination directory if needed
    if (options.createDirectory) {
      const dir = path.dirname(destinationPath);
      await fs.mkdir(dir, { recursive: true }).catch(() => {});
    }

    await fs.rename(filePath, destinationPath);

    return {
      success: true,
      data: {
        filePath,
        destinationPath,
        moved: true,
      },
    };
  }

  /**
   * Copy file
   */
  private async copyFile(filePath: string, destinationPath: string, options: any): Promise<NodeExecutionResult> {
    if (!destinationPath) {
      throw new Error('destinationPath is required for copy operation');
    }

    const sourceExists = await fs.access(filePath).then(() => true).catch(() => false);
    if (!sourceExists) {
      throw new Error(`Source file not found: ${filePath}`);
    }

    // Create destination directory if needed
    if (options.createDirectory) {
      const dir = path.dirname(destinationPath);
      await fs.mkdir(dir, { recursive: true }).catch(() => {});
    }

    // Check if destination exists
    const destExists = await fs.access(destinationPath).then(() => true).catch(() => false);
    if (destExists && options.overwrite === false) {
      throw new Error(`Destination file already exists and overwrite is false: ${destinationPath}`);
    }

    await fs.copyFile(filePath, destinationPath);

    const stats = await fs.stat(destinationPath);

    return {
      success: true,
      data: {
        filePath,
        destinationPath,
        copied: true,
        size: stats.size,
      },
    };
  }

  /**
   * List directory
   */
  private async listFiles(filePath: string, options: any): Promise<NodeExecutionResult> {
    const stats = await fs.stat(filePath).catch(() => null);
    if (!stats) {
      throw new Error(`Path not found: ${filePath}`);
    }

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${filePath}`);
    }

    const files = await fs.readdir(filePath);
    const maxDepth = options.recursive ? (options.maxDepth || 3) : 0;

    const fileList = maxDepth > 0
      ? await this.listFilesRecursive(filePath, maxDepth)
      : await Promise.all(
          files.map(async (name) => {
            const fullPath = path.join(filePath, name);
            const fileStats = await fs.stat(fullPath).catch(() => null);
            if (!fileStats) return null;

            return {
              name,
              path: fullPath,
              isDirectory: fileStats.isDirectory(),
              isFile: fileStats.isFile(),
              size: fileStats.size,
              lastModified: fileStats.mtime,
              mimeType: fileStats.isFile() ? this.getMimeType(fullPath) : undefined,
            };
          })
        );

    const filteredFiles = fileList.filter((f: any) => f !== null);

    return {
      success: true,
      data: {
        path: filePath,
        count: filteredFiles.length,
        files: filteredFiles,
      },
    };
  }

  /**
   * List files recursively
   */
  private async listFilesRecursive(dirPath: string, maxDepth: number, currentDepth = 0): Promise<any[]> {
    if (currentDepth >= maxDepth) return [];

    const entries = await fs.readdir(dirPath);
    const results: any[] = [];

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry);
      const stats = await fs.stat(fullPath).catch(() => null);
      if (!stats) continue;

      const fileData = {
        name: entry,
        path: fullPath,
        relativePath: path.relative(dirPath, fullPath),
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        size: stats.size,
        lastModified: stats.mtime,
        mimeType: stats.isFile() ? this.getMimeType(fullPath) : undefined,
      };

      results.push(fileData);

      if (stats.isDirectory()) {
        const subFiles = await this.listFilesRecursive(fullPath, maxDepth, currentDepth + 1);
        results.push(...subFiles);
      }
    }

    return results;
  }

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.html': 'text/html',
      '.htm': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.ts': 'text/typescript',
      '.md': 'text/markdown',
      '.pdf': 'application/pdf',
      '.zip': 'application/zip',
      '.tar': 'application/x-tar',
      '.gz': 'application/gzip',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.wav': 'audio/wav',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }

  /**
   * Check if file is binary based on extension
   */
  private isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    const binaryExtensions = [
      '.pdf', '.zip', '.tar', '.gz', '.rar', '.7z',
      '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
      '.mp3', '.mp4', '.wav', '.ogg', '.flac',
      '.exe', '.dll', '.so', '.dylib',
      '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    ];

    return binaryExtensions.includes(ext);
  }

  /**
   * Resolve path with variable substitution
   */
  private resolvePath(filePath: string, context: ExecutionContext): string {
    if (!filePath) return '';

    return filePath.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
      const sourceData = source === 'json' ? context.$json
        : source === 'workflow' ? context.$workflow
        : context.$node;
      const found = this.getNestedValue(sourceData, path);
      return found !== undefined ? String(found) : match;
    });
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('Invalid operation')) {
      return error.message;
    }
    if (error.message?.includes('filePath is required')) {
      return error.message;
    }
    if (error.message?.includes('Invalid encoding')) {
      return error.message;
    }
    if (error.code === 'ENOENT') {
      return `File not found: ${error.path}`;
    }
    if (error.code === 'EACCES') {
      return `Permission denied: ${error.path}`;
    }
    if (error.code === 'EISDIR') {
      return `Path is a directory, not a file: ${error.path}`;
    }
    if (error.code === 'ENOSPC') {
      return 'No space left on device';
    }
    if (error.code === 'EROFS') {
      return 'Read-only file system';
    }
    return `File operation error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'readWriteBinaryFile';
  }

  getIcon(): string {
    return 'File';
  }

  /**
   * Check if path exists
   */
  static async pathExists(filePath: string): Promise<boolean> {
    return await fs.access(filePath).then(() => true).catch(() => false);
  }

  /**
   * Get file stats
   */
  static async getFileInfo(filePath: string): Promise<{
    exists: boolean;
    isFile: boolean;
    isDirectory: boolean;
    size?: number;
    modified?: Date;
    created?: Date;
  }> {
    const stats = await fs.stat(filePath).catch(() => null);

    if (!stats) {
      return { exists: false, isFile: false, isDirectory: false };
    }

    return {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory(),
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
    };
  }
}
