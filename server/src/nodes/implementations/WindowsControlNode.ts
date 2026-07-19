import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Windows Control Node - PC Master
 * CRITICAL SECURITY WARNING: Risk of Remote Code Execution (RCE).
 * PROTECTION REQUIRED: Local agent with unique encryption key (Handshake),
 * command whitelist, and sandbox isolation (Docker).
 *
 * This node requires a companion agent running on Windows with strict security controls.
 */
export class WindowsControlNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const { action, service, parameters } = this.config;

      // SECURITY: Check if whitelist is enabled
      if (!this.config.whitelistEnabled) {
        return {
          success: false,
          error: 'SECURITY: Command whitelist must be enabled for Windows Control operations',
        };
      }

      let result: any;

      switch (service) {
        case 'powershell':
          result = await this.handlePowerShell(action, parameters, context);
          break;
        case 'system':
          result = await this.handleSystem(action, parameters, context);
          break;
        case 'process':
          result = await this.handleProcess(action, parameters, context);
          break;
        case 'volume':
          result = await this.handleVolume(action, parameters, context);
          break;
        case 'file':
          result = await this.handleFile(action, parameters, context);
          break;
        default:
          throw new Error(`Unknown Windows service: ${service}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Windows control operation failed',
      };
    }
  }

  private async handlePowerShell(action: string, params: any, context: ExecutionContext): Promise<any> {
    const { script, command } = params;

    // SECURITY: Validate command against whitelist
    if (!this.isWhitelisted(command || script)) {
      throw new Error(`Command not whitelisted: ${command || script}`);
    }

    switch (action) {
      case 'execute':
        // Execute PowerShell command
        const { stdout, stderr } = await execAsync(`powershell -Command "${command}"`, {
          timeout: this.config.commandTimeout || 30000, // 30s default timeout
        });

        return {
          output: stdout.trim(),
          error: stderr.trim(),
          command,
          warning: 'PowerShell execution requires strict sandboxing',
        };

      case 'executeScript':
        // Execute multi-line PowerShell script
        const scriptResult = await execAsync(`powershell -ExecutionPolicy Bypass -File "${script}"`, {
          timeout: this.config.commandTimeout || 60000, // 60s for scripts
        });

        return {
          output: scriptResult.stdout.trim(),
          error: scriptResult.stderr.trim(),
          script,
        };

      case 'listModules':
        const modules = await execAsync('powershell -Command "Get-Module -ListAvailable"');

        return {
          modules: modules.stdout.trim().split('\n'),
        };

      default:
        throw new Error(`Unknown PowerShell action: ${action}`);
    }
  }

  private async handleSystem(action: string, params: any, context: ExecutionContext): Promise<any> {
    switch (action) {
      case 'restart':
        // DANGEROUS: Restart the system
        if (!this.config.allowRestart) {
          throw new Error('System restart is not allowed in configuration');
        }

        await execAsync('shutdown /r /t 0 /c "Restart triggered by LogicAI-N8N"');

        return {
          restarting: true,
          message: 'System restart initiated',
        };

      case 'shutdown':
        // DANGEROUS: Shutdown the system
        if (!this.config.allowShutdown) {
          throw new Error('System shutdown is not allowed in configuration');
        }

        await execAsync('shutdown /s /t 0 /c "Shutdown triggered by LogicAI-N8N"');

        return {
          shuttingDown: true,
          message: 'System shutdown initiated',
        };

      case 'getInfo':
        const info = await execAsync('systeminfo | findstr /B /C:"OS Name" /C:"OS Version"');

        return {
          systemInfo: info.stdout.trim(),
        };

      case 'getUptime':
        const uptime = await execAsync('wmic os get lastbootuptime');

        return {
          lastBootTime: uptime.stdout.trim(),
        };

      default:
        throw new Error(`Unknown System action: ${action}`);
    }
  }

  private async handleProcess(action: string, params: any, context: ExecutionContext): Promise<any> {
    const { processName, pid } = params;

    switch (action) {
      case 'list':
        const processes = await execAsync('tasklist');

        return {
          processes: processes.stdout.trim(),
        };

      case 'kill':
        // DANGEROUS: Kill a process
        if (!this.isWhitelisted(`kill-${pid}`)) {
          throw new Error(`Kill process ${pid} is not whitelisted`);
        }

        await execAsync(`taskkill /PID ${pid} /F`);

        return {
          killed: true,
          pid,
        };

      case 'start':
        // Start a program
        if (!this.isWhitelisted(`start-${processName}`)) {
          throw new Error(`Start ${processName} is not whitelisted`);
        }

        await execAsync(`start "" "${processName}"`);

        return {
          started: true,
          processName,
        };

      default:
        throw new Error(`Unknown Process action: ${action}`);
    }
  }

  private async handleVolume(action: string, params: any, context: ExecutionContext): Promise<any> {
    const { volume = 0 } = params; // 0-100

    switch (action) {
      case 'set':
        // Set system volume (requires third-party tool like nircmd)
        if (!this.config.allowVolumeControl) {
          throw new Error('Volume control is not allowed');
        }

        // This is a placeholder - actual implementation requires nircmd or similar
        await execAsync(`nircmd.exe setsysvolume ${volume * 655.35}`);

        return {
          volume,
          message: `Volume set to ${volume}%`,
        };

      case 'mute':
        await execAsync('nircmd.exe mutesysvolume 1');

        return {
          muted: true,
        };

      case 'unmute':
        await execAsync('nircmd.exe mutesysvolume 0');

        return {
          muted: false,
        };

      default:
        throw new Error(`Unknown Volume action: ${action}`);
    }
  }

  private async handleFile(action: string, params: any, context: ExecutionContext): Promise<any> {
    const { path, content } = params;

    switch (action) {
      case 'read':
        const { readFile } = require('fs/promises');
        const fileContent = await readFile(path, 'utf-8');

        return {
          path,
          content: fileContent,
        };

      case 'write':
        const { writeFile } = require('fs/promises');
        await writeFile(path, content, 'utf-8');

        return {
          path,
          written: true,
        };

      case 'delete':
        const { unlink } = require('fs/promises');
        await unlink(path);

        return {
          path,
          deleted: true,
        };

      case 'list':
        const { readdir } = require('fs/promises');
        const files = await readdir(path, { withFileTypes: true });

        return {
          path,
          files: files.map(f => ({
            name: f.name,
            isDirectory: f.isDirectory(),
          })),
        };

      default:
        throw new Error(`Unknown File action: ${action}`);
    }
  }

  private isWhitelisted(command: string): boolean {
    // Check if command is in whitelist
    const whitelist = this.config.commandWhitelist || [];
    return whitelist.some((pattern: string) => {
      const regex = new RegExp(pattern);
      return regex.test(command);
    });
  }

  getType(): string {
    return 'windowsControl';
  }

  getIcon(): string {
    return 'Monitor';
  }
}
