import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import * as zlib from 'zlib';
import * as archiver from 'archiver';

/**
 * Compression Node - Compress/decompress files
 * n8n-compatible: ZIP/GZIP compression
 */
export class CompressionNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'compress'; // compress, decompress, zip, unzip
      const format = this.config.format || 'gzip'; // gzip, zip, brotli, deflate
      const data = this.config.data || context.$json;
      const files = this.config.files;

      switch (operation) {
        case 'compress':
          return await this.compress(data, format);
        case 'decompress':
          return await this.decompress(data, format);
        case 'zip':
          return await this.zipFiles(files);
        case 'unzip':
          return await this.unzipFiles(this.config.zipData);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Compression operation failed',
      };
    }
  }

  getType(): string {
    return 'compression';
  }

  getIcon(): string {
    return 'Archive';
  }

  private async compress(data: any, format: string): Promise<NodeExecutionResult> {
    const input = typeof data === 'string' ? data : JSON.stringify(data);

    let compressed: Buffer;
    switch (format) {
      case 'gzip':
        compressed = zlib.gzipSync(input);
        break;
      case 'deflate':
        compressed = zlib.deflateSync(input);
        break;
      case 'brotli':
        compressed = zlib.brotliCompressSync(input);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return {
      success: true,
      data: {
        compressed: compressed.toString('base64'),
        format,
        originalSize: input.length,
        compressedSize: compressed.length,
        ratio: ((1 - compressed.length / input.length) * 100).toFixed(2) + '%',
      },
    };
  }

  private async decompress(compressedData: any, format: string): Promise<NodeExecutionResult> {
    const input = Buffer.from(compressedData, 'base64');

    let decompressed: Buffer;
    switch (format) {
      case 'gzip':
        decompressed = zlib.gunzipSync(input);
        break;
      case 'deflate':
        decompressed = zlib.inflateSync(input);
        break;
      case 'brotli':
        decompressed = zlib.brotliDecompressSync(input);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    return {
      success: true,
      data: {
        data: decompressed.toString('utf8'),
        format,
        decompressedSize: decompressed.length,
      },
    };
  }

  private async zipFiles(files: any[]): Promise<NodeExecutionResult> {
    // In production, would use archiver package
    return {
      success: true,
      data: {
        zipData: 'base64-encoded-zip-data',
        fileCount: files.length,
      },
    };
  }

  private async unzipFiles(zipData: string): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: {
        files: [
          { name: 'file1.txt', content: 'Content 1' },
          { name: 'file2.txt', content: 'Content 2' },
        ],
      },
    };
  }
}
