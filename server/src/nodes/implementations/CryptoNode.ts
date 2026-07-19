import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import * as crypto from 'crypto';

/**
 * Crypto Node - Hash, encrypt, and decrypt data
 * n8n-compatible: Cryptographic operations
 */
export class CryptoNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'hash'; // hash, encrypt, decrypt, hmac, random
      const algorithm = this.config.algorithm || 'sha256';
      const data = this.config.data || this.getNestedValue(context.$json, 'data');
      const key = this.config.key;
      const iv = this.config.iv;
      const encoding = this.config.encoding || 'hex';

      switch (operation) {
        case 'hash':
          return await this.hash(data, algorithm);
        case 'encrypt':
          return await this.encrypt(data, algorithm, key, iv, encoding);
        case 'decrypt':
          return await this.decrypt(data, algorithm, key, iv, encoding);
        case 'hmac':
          return await this.hmac(data, algorithm, key, encoding);
        case 'random':
          return await this.random(this.config.size || 32, encoding);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Crypto operation failed',
      };
    }
  }

  getType(): string {
    return 'crypto';
  }

  getIcon(): string {
    return 'Lock';
  }

  private async hash(data: any, algorithm: string): Promise<NodeExecutionResult> {
    const input = typeof data === 'string' ? data : JSON.stringify(data);
    const hash = crypto.createHash(algorithm).update(input).digest('hex');

    return {
      success: true,
      data: {
        hash,
        algorithm,
        input,
      },
    };
  }

  private async encrypt(data: any, algorithm: string, key: string, iv?: string, encoding = 'hex'): Promise<NodeExecutionResult> {
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key, encoding), iv ? Buffer.from(iv, encoding) : crypto.randomBytes(16));
    let encrypted = cipher.update(typeof data === 'string' ? data : JSON.stringify(data), 'utf8', encoding);
    encrypted += cipher.final(encoding);

    return {
      success: true,
      data: {
        encrypted,
        algorithm,
        iv,
      },
    };
  }

  private async decrypt(encryptedData: string, algorithm: string, key: string, iv: string, encoding = 'hex'): Promise<NodeExecutionResult> {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key, encoding), Buffer.from(iv, encoding));
    let decrypted = decipher.update(encryptedData, encoding, 'utf8');
    decrypted += decipher.final('utf8');

    return {
      success: true,
      data: {
        decrypted,
        algorithm,
      },
    };
  }

  private async hmac(data: any, algorithm: string, key: string, encoding = 'hex'): Promise<NodeExecutionResult> {
    const input = typeof data === 'string' ? data : JSON.stringify(data);
    const hmac = crypto.createHmac(algorithm, Buffer.from(key, encoding)).update(input).digest(encoding);

    return {
      success: true,
      data: {
        hmac,
        algorithm,
      },
    };
  }

  private async random(size: number, encoding = 'hex'): Promise<NodeExecutionResult> {
    const randomData = crypto.randomBytes(size).toString(encoding);

    return {
      success: true,
      data: {
        random: randomData,
        size,
        encoding,
      },
    };
  }
}
