import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { v1 as uuidv1, v4 as uuidv4, v5 as uuidv5 } from 'uuid';

/**
 * UUID Node - Generate UUIDs
 * 
 * Supported operations:
 * - v1: Time-based UUID
 * - v4: Random UUID (default)
 * - v5: Namespace-based UUID (SHA-1)
 */
export class UUIDNode extends BaseNode {
  getType(): string {
    return 'uuid';
  }

  getIcon(): string {
    return 'hash';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const version = this.config.version || 'v4';
      
      let uuid: string;
      
      switch (version) {
        case 'v1':
          uuid = uuidv1();
          break;
        case 'v4':
          uuid = uuidv4();
          break;
        case 'v5':
          uuid = this.generateV5(context);
          break;
        default:
          throw new Error(`Unknown UUID version: ${version}`);
      }
      
      return {
        success: true,
        data: {
          uuid,
          version,
          timestamp: new Date().toISOString(),
        },
        error: null,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  private generateV5(context: ExecutionContext): string {
    const name = this.config.name || context.$json.name || '';
    const namespace = this.config.namespace || uuidv5.DNS;
    
    if (!name) {
      throw new Error('Name is required for UUID v5');
    }
    
    return uuidv5(name, namespace);
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (this.config.version === 'v5' && !this.config.name) {
      errors.push('Name is required for UUID v5');
    }

    return errors;
  }
}
