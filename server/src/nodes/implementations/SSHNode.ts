import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { Client, SFTPWrapper } from 'ssh2';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * SSH Node - Execute commands on remote server
 * n8n-compatible: Remote command execution via SSH
 *
 * Configuration:
 * - host: SSH server hostname or IP
 * - port: SSH port (default: 22)
 * - username: SSH username
 * - password: SSH password (alternative to privateKey)
 * - privateKey: Private key content for authentication
 * - passphrase: Passphrase for private key (optional)
 * - command: Command to execute
 * - options: { timeout, cwd, env, pty }
 * - operation: 'execute' | 'upload' | 'download' | 'list'
 */
export class SSHNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.host) {
      throw new Error('host is required for SSH connection');
    }

    if (!this.config.username) {
      throw new Error('username is required for SSH connection');
    }

    if (!this.config.password && !this.config.privateKey) {
      throw new Error('Either password or privateKey is required for authentication');
    }

    const port = this.config.port || 22;
    if (typeof port !== 'number' || port < 1 || port > 65535) {
      throw new Error(`Invalid port: ${port}. Must be between 1 and 65535`);
    }

    const operation = this.config.operation || 'execute';
    if (!['execute', 'upload', 'download', 'list', 'mkdir', 'delete'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}. Valid: execute, upload, download, list, mkdir, delete`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'execute';
      const command = this.resolveValue(this.config.command, context);

      switch (operation) {
        case 'execute':
          return await this.executeCommand(command);
        case 'upload':
          return await this.uploadFile(context);
        case 'download':
          return await this.downloadFile(context);
        case 'list':
          return await this.listFiles(context);
        case 'mkdir':
          return await this.createDirectory(context);
        case 'delete':
          return await this.deleteFile(context);
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
   * Execute SSH command
   */
  private async executeCommand(command: string): Promise<NodeExecutionResult> {
    const conn = await this.createConnection();

    return new Promise((resolve, reject) => {
      let stdout = '';
      let stderr = '';
      let exitCode = 0;

      try {
        conn.exec(command, (err: any, stream: any) => {
          if (err) {
            conn.end();
            reject(err);
            return;
          }

          stream.on('data', (data: Buffer) => {
            stdout += data.toString('utf8');
          });

          stream.stderr.on('data', (data: Buffer) => {
            stderr += data.toString('utf8');
          });

          stream.on('close', (code: number) => {
            exitCode = code || 0;
            conn.end();

            resolve({
              success: exitCode === 0,
              data: {
                host: this.config.host,
                command,
                stdout,
                stderr,
                exitCode,
                _ssh: {
                  host: this.config.host,
                  port: this.config.port || 22,
                  username: this.config.username,
                },
              },
            });
          });
        });

        // Timeout handling
        const timeout = this.config.options?.timeout || 30000;
        setTimeout(() => {
          conn.end();
          reject(new Error(`SSH command timeout after ${timeout}ms`));
        }, timeout);
      } catch (error) {
        conn.end();
        reject(error);
      }
    }).then((result: any) => result, (error: any) => {
      throw error;
    });
  }

  /**
   * Upload file via SFTP
   */
  private async uploadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conn = await this.createConnection();
    const sftp = await this.getSFTP(conn);

    try {
      const localPath = this.resolvePath(this.config.localPath, context);
      const remotePath = this.config.remotePath;

      if (!localPath) {
        throw new Error('localPath is required for upload operation');
      }
      if (!remotePath) {
        throw new Error('remotePath is required for upload operation');
      }

      // Read local file
      const localContent = await fs.readFile(localPath);

      // Ensure remote directory exists
      const remoteDir = path.dirname(remotePath);
      try {
        await sftp.mkdir(remoteDir, { recursive: true });
      } catch {
        // Directory might already exist
      }

      // Upload file
      await sftp.fastPut(localPath, remotePath);

      const stats = await sftp.stat(remotePath);

      conn.end();

      return {
        success: true,
        data: {
          localPath,
          remotePath,
          uploaded: true,
          size: stats.size,
          modified: stats.mtime,
          _ssh: {
            host: this.config.host,
            operation: 'upload',
          },
        },
      };
    } catch (error: any) {
      conn.end();
      throw error;
    }
  }

  /**
   * Download file via SFTP
   */
  private async downloadFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conn = await this.createConnection();
    const sftp = await this.getSFTP(conn);

    try {
      const remotePath = this.config.remotePath;
      const localPath = this.resolvePath(this.config.localPath, context);

      if (!remotePath) {
        throw new Error('remotePath is required for download operation');
      }
      if (!localPath) {
        throw new Error('localPath is required for download operation');
      }

      // Check remote file exists
      const stats = await sftp.stat(remotePath);
      if (!stats.isFile()) {
        throw new Error(`Remote path is not a file: ${remotePath}`);
      }

      // Download file
      await sftp.fastGet(remotePath, localPath);

      const localStats = await fs.stat(localPath);

      conn.end();

      return {
        success: true,
        data: {
          remotePath,
          localPath,
          downloaded: true,
          size: localStats.size,
          _ssh: {
            host: this.config.host,
            operation: 'download',
          },
        },
      };
    } catch (error: any) {
      conn.end();
      throw error;
    }
  }

  /**
   * List directory via SFTP
   */
  private async listFiles(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conn = await this.createConnection();
    const sftp = await this.getSFTP(conn);

    try {
      const remotePath = this.config.remotePath || '.';

      const list = await sftp.list(remotePath);
      const files = list.map((item: any) => ({
        name: item.name,
        type: item.type,
        size: item.attrs.size,
        modifyTime: item.attrs.mtime * 1000,
        permissions: item.attrs.mode,
        owner: item.attrs.uid,
        group: item.attrs.gid,
      }));

      conn.end();

      return {
        success: true,
        data: {
          remotePath,
          files,
          count: files.length,
          _ssh: {
            host: this.config.host,
            operation: 'list',
          },
        },
      };
    } catch (error: any) {
      conn.end();
      throw error;
    }
  }

  /**
   * Create directory via SFTP
   */
  private async createDirectory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conn = await this.createConnection();
    const sftp = await this.getSFTP(conn);

    try {
      const remotePath = this.config.remotePath;
      const mode = this.config.mode || 0o755;

      if (!remotePath) {
        throw new Error('remotePath is required for mkdir operation');
      }

      await sftp.mkdir(remotePath, { mode, recursive: true });

      conn.end();

      return {
        success: true,
        data: {
          remotePath,
          created: true,
          _ssh: {
            host: this.config.host,
            operation: 'mkdir',
          },
        },
      };
    } catch (error: any) {
      conn.end();
      throw error;
    }
  }

  /**
   * Delete file via SFTP
   */
  private async deleteFile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const conn = await this.createConnection();
    const sftp = await this.getSFTP(conn);

    try {
      const remotePath = this.config.remotePath;

      if (!remotePath) {
        throw new Error('remotePath is required for delete operation');
      }

      await sftp.unlink(remotePath);

      conn.end();

      return {
        success: true,
        data: {
          remotePath,
          deleted: true,
          _ssh: {
            host: this.config.host,
            operation: 'delete',
          },
        },
      };
    } catch (error: any) {
      conn.end();
      throw error;
    }
  }

  /**
   * Create SSH connection
   */
  private async createConnection(): Promise<Client> {
    return new Promise((resolve, reject) => {
      try {
        const conn = new Client();

        conn.on('ready', () => {
          resolve(conn);
        });

        conn.on('error', (err: Error) => {
          reject(err);
        });

        const connectionConfig: any = {
          host: this.config.host,
          port: this.config.port || 22,
          username: this.config.username,
          readyTimeout: this.config.options?.timeout || 30000,
        };

        // Authentication
        if (this.config.privateKey) {
          connectionConfig.privateKey = this.config.privateKey;
          if (this.config.passphrase) {
            connectionConfig.passphrase = this.config.passphrase;
          }
        } else if (this.config.password) {
          connectionConfig.password = this.config.password;
        }

        // Additional options
        if (this.config.options) {
          if (this.config.options.keepaliveInterval) {
            connectionConfig.keepaliveInterval = this.config.options.keepaliveInterval;
          }
          if (this.config.options.keepaliveCountMax) {
            connectionConfig.keepaliveCountMax = this.config.options.keepaliveCountMax;
          }
        }

        conn.connect(connectionConfig);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get SFTP client
   */
  private async getSFTP(conn: Client): Promise<SFTPWrapper> {
    return new Promise((resolve, reject) => {
      conn.sftp((err: any, sftp) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(sftp);
      });
    });
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

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('host is required')) {
      return error.message;
    }
    if (error.message?.includes('username is required')) {
      return error.message;
    }
    if (error.message?.includes('password or privateKey')) {
      return error.message;
    }
    if (error.level === 'client-authentication') {
      return 'SSH authentication failed: Invalid credentials';
    }
    if (error.code === 'ENOTFOUND') {
      return `Connection failed: Host not found: ${this.config.host}`;
    }
    if (error.code === 'ECONNREFUSED') {
      return `Connection refused: ${this.config.host}:${this.config.port || 22}. Check SSH is running`;
    }
    if (error.code === 'ETIMEDOUT') {
      return 'Connection timeout: Server took too long to respond';
    }
    if (error.code === 'ECONNRESET') {
      return 'Connection reset by server';
    }
    if (error.message?.includes('All configured authentication methods failed')) {
      return 'Authentication failed: Check password or private key';
    }
    if (error.level === 'client-connect-timeout') {
      return 'SSH connection timeout';
    }
    return `SSH error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'ssh';
  }

  getIcon(): string {
    return 'Terminal';
  }

  /**
   * Test SSH connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const conn = await this.createConnection();
      conn.end();
      return { success: true, message: 'SSH connection successful' };
    } catch (error: any) {
      return { success: false, message: this.formatErrorMessage(error) };
    }
  }

  /**
   * Execute multiple commands in sequence
   */
  async executeCommands(commands: string[]): Promise<{
    success: boolean;
    results: any[];
  }> {
    const conn = await this.createConnection();
    const results: any[] = [];

    for (const command of commands) {
      try {
        const result = await new Promise<any>((resolve, reject) => {
          conn.exec(command, (err: any, stream: any) => {
            if (err) {
              reject(err);
              return;
            }

            let stdout = '';
            let stderr = '';

            stream.on('data', (data: Buffer) => {
              stdout += data.toString('utf8');
            });

            stream.stderr.on('data', (data: Buffer) => {
              stderr += data.toString('utf8');
            });

            stream.on('close', (code: number) => {
              resolve({
                command,
                stdout,
                stderr,
                exitCode: code || 0,
              });
            });
          });
        });

        results.push(await result);
      } catch (error: any) {
        results.push({
          command,
          error: error.message,
          exitCode: -1,
        });
      }
    }

    conn.end();

    return {
      success: results.every(r => r.exitCode === 0),
      results,
    };
  }
}
