import { Client as SSHClient } from 'ssh2';
import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import * as nodemailer from 'nodemailer';

/**
 * Infrastructure Node - SSH / SFTP / SMTP
 * n8n-compatible: Remote bash commands, secure file transfers, transactional emails
 * SECURITY WARNING: Never store private SSH keys in plain text.
 * ENCRYPTION REQUIRED: Use a Master Key for encryption on the server side.
 */
export class InfrastructureNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const { action, service, parameters } = this.config;

      let result: any;

      switch (service) {
        case 'ssh':
          result = await this.handleSSH(action, parameters, context);
          break;
        case 'sftp':
          result = await this.handleSFTP(action, parameters, context);
          break;
        case 'smtp':
          result = await this.handleSMTP(action, parameters, context);
          break;
        default:
          throw new Error(`Unknown Infrastructure service: ${service}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Infrastructure operation failed',
      };
    }
  }

  private async handleSSH(action: string, params: any, context: ExecutionContext): Promise<any> {
    const {
      host,
      port = 22,
      username,
      privateKey, // Should be encrypted!
      password,
      command,
      timeout = 30000,
    } = params;

    return new Promise((resolve, reject) => {
      const conn = new SSHClient();

      conn
        .on('ready', () => {
          conn.exec(command, (err, stream) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            let stdout = '';
            let stderr = '';

            stream
              .on('close', (code: number) => {
                conn.end();
                resolve({
                  output: stdout.trim(),
                  error: stderr.trim(),
                  exitCode: code,
                  command,
                  host,
                  username,
                });
              })
              .on('data', (data: Buffer) => {
                stdout += data.toString();
              })
              .stderr
              .on('data', (data: Buffer) => {
                stderr += data.toString();
              });
          });
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .connect({
          host,
          port,
          username,
          privateKey: privateKey || undefined,
          password: password || undefined,
          readyTimeout: timeout,
        });

      // Overall timeout
      setTimeout(() => {
        conn.end();
        reject(new Error(`SSH command timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  private async handleSFTP(action: string, params: any, context: ExecutionContext): Promise<any> {
    const {
      host,
      port = 22,
      username,
      privateKey,
      password,
      timeout = 30000,
    } = params;

    return new Promise((resolve, reject) => {
      const conn = new SSHClient();

      conn
        .on('ready', () => {
          conn.sftp((err, sftp) => {
            if (err) {
              conn.end();
              return reject(err);
            }

            switch (action) {
              case 'upload':
                sftp.fastPut(
                  params.localPath,
                  params.remotePath,
                  (err) => {
                    conn.end();
                    if (err) return reject(err);
                    resolve({
                      uploaded: true,
                      localPath: params.localPath,
                      remotePath: params.remotePath,
                    });
                  }
                );
                break;

              case 'download':
                sftp.fastGet(
                  params.remotePath,
                  params.localPath,
                  (err) => {
                    conn.end();
                    if (err) return reject(err);
                    resolve({
                      downloaded: true,
                      remotePath: params.remotePath,
                      localPath: params.localPath,
                    });
                  }
                );
                break;

              case 'list':
                sftp.readdir(params.remotePath, (err, list) => {
                  conn.end();
                  if (err) return reject(err);
                  resolve({
                    files: list.map((item: any) => ({
                      name: item.filename,
                      type: item.attrs.isDirectory() ? 'directory' : 'file',
                      size: item.attrs.size,
                      modifyTime: item.attrs.mtime * 1000,
                    })),
                    path: params.remotePath,
                  });
                });
                break;

              case 'delete':
                sftp.unlink(params.remotePath, (err) => {
                  conn.end();
                  if (err) return reject(err);
                  resolve({
                    deleted: true,
                    path: params.remotePath,
                  });
                });
                break;

              case 'mkdir':
                sftp.mkdir(params.remotePath, (err) => {
                  conn.end();
                  if (err) return reject(err);
                  resolve({
                    created: true,
                    path: params.remotePath,
                  });
                });
                break;

              case 'exists':
                sftp.stat(params.remotePath, (err, stats) => {
                  conn.end();
                  resolve({
                    exists: !err,
                    path: params.remotePath,
                    isDirectory: stats ? stats.isDirectory() : false,
                  });
                });
                break;

              default:
                conn.end();
                reject(new Error(`Unknown SFTP action: ${action}`));
            }
          });
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        .connect({
          host,
          port,
          username,
          privateKey: privateKey || undefined,
          password: password || undefined,
          readyTimeout: timeout,
        });

      setTimeout(() => {
        conn.end();
        reject(new Error(`SFTP operation timed out after ${timeout}ms`));
      }, timeout);
    });
  }

  private async handleSMTP(action: string, params: any, context: ExecutionContext): Promise<any> {
    const {
      host,
      port = 587,
      secure = false, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    } = params;

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    switch (action) {
      case 'send':
        const sendResult = await transporter.sendMail({
          from: params.from,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          subject: params.subject,
          text: params.text,
          html: params.html,
          attachments: params.attachments,
        });

        return {
          sent: true,
          messageId: sendResult.messageId,
          response: sendResult.response,
          to: params.to,
          subject: params.subject,
        };

      case 'verify':
        try {
          await transporter.verify();
          return {
            verified: true,
            host,
            port,
          };
        } catch (error: any) {
          return {
            verified: false,
            error: error.message,
          };
        }

      case 'sendBulk':
        const results = [];

        for (const email of params.emails) {
          try {
            const result = await transporter.sendMail({
              from: params.from,
              to: email.to,
              subject: email.subject,
              text: email.text,
              html: email.html,
            });

            results.push({
              to: email.to,
              sent: true,
              messageId: result.messageId,
            });
          } catch (error: any) {
            results.push({
              to: email.to,
              sent: false,
              error: error.message,
            });
          }
        }

        return {
          results,
          total: params.emails.length,
          sent: results.filter((r: any) => r.sent).length,
          failed: results.filter((r: any) => !r.sent).length,
        };

      case 'sendTemplate':
        const templateResult = await transporter.sendMail({
          from: params.from,
          to: params.to,
          subject: params.subject,
          template: params.templateName,
          context: params.templateContext,
        });

        return {
          sent: true,
          messageId: templateResult.messageId,
          template: params.templateName,
        };

      default:
        throw new Error(`Unknown SMTP action: ${action}`);
    }
  }

  getType(): string {
    return 'infrastructure';
  }

  getIcon(): string {
    return 'Server';
  }
}
