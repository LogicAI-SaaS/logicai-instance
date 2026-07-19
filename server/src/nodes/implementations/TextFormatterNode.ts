import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * TextFormatter Node - Text manipulation and formatting
 * 
 * Supported operations:
 * - uppercase: Convert to uppercase
 * - lowercase: Convert to lowercase
 * - capitalize: Capitalize first letter
 * - trim: Remove whitespace
 * - replace: Replace text
 * - split: Split text into array
 * - join: Join array into text
 * - substring: Extract substring
 * - regex: Apply regex pattern
 */
export class TextFormatterNode extends BaseNode {
  getType(): string {
    return 'textFormatter';
  }

  getIcon(): string {
    return 'type';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'trim';
      
      switch (operation) {
        case 'uppercase':
          return await this.uppercase(context);
        case 'lowercase':
          return await this.lowercase(context);
        case 'capitalize':
          return await this.capitalize(context);
        case 'trim':
          return await this.trim(context);
        case 'replace':
          return await this.replace(context);
        case 'split':
          return await this.split(context);
        case 'join':
          return await this.join(context);
        case 'substring':
          return await this.substring(context);
        case 'regex':
          return await this.regex(context);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  private async uppercase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    
    return {
      success: true,
      data: {
        result: text.toUpperCase(),
        original: text,
      },
      error: null,
    };
  }

  private async lowercase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    
    return {
      success: true,
      data: {
        result: text.toLowerCase(),
        original: text,
      },
      error: null,
    };
  }

  private async capitalize(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    const mode = this.config.mode || 'first'; // first, words, sentences
    
    let result: string;
    
    switch (mode) {
      case 'first':
        result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        break;
      case 'words':
        result = text.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        break;
      case 'sentences':
        result = text.split('. ').map(sentence => 
          sentence.charAt(0).toUpperCase() + sentence.slice(1)
        ).join('. ');
        break;
      default:
        result = text;
    }
    
    return {
      success: true,
      data: {
        result,
        original: text,
        mode,
      },
      error: null,
    };
  }

  private async trim(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    const mode = this.config.mode || 'all'; // all, start, end
    
    let result: string;
    
    switch (mode) {
      case 'start':
        result = text.trimStart();
        break;
      case 'end':
        result = text.trimEnd();
        break;
      default:
        result = text.trim();
    }
    
    return {
      success: true,
      data: {
        result,
        original: text,
        removed: text.length - result.length,
      },
      error: null,
    };
  }

  private async replace(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    const search = this.config.search || context.$json.search || '';
    const replaceWith = this.config.replaceWith || context.$json.replaceWith || '';
    const replaceAll = this.config.replaceAll !== false;
    
    if (!search) {
      throw new Error('Search text is required');
    }
    
    const result = replaceAll 
      ? text.split(search).join(replaceWith)
      : text.replace(search, replaceWith);
    
    return {
      success: true,
      data: {
        result,
        original: text,
        replacements: (text.match(new RegExp(search, 'g')) || []).length,
      },
      error: null,
    };
  }

  private async split(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    const separator = this.config.separator || context.$json.separator || ',';
    const limit = this.config.limit;
    
    const result = limit ? text.split(separator, limit) : text.split(separator);
    
    return {
      success: true,
      data: {
        result,
        original: text,
        count: result.length,
      },
      error: null,
    };
  }

  private async join(context: ExecutionContext): Promise<NodeExecutionResult> {
    const items = this.config.items || context.$json.items || [];
    const separator = this.config.separator || context.$json.separator || ',';
    
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }
    
    const result = items.join(separator);
    
    return {
      success: true,
      data: {
        result,
        original: items,
        count: items.length,
      },
      error: null,
    };
  }

  private async substring(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    const start = this.config.start || context.$json.start || 0;
    const end = this.config.end || context.$json.end;
    
    const result = end !== undefined ? text.substring(start, end) : text.substring(start);
    
    return {
      success: true,
      data: {
        result,
        original: text,
        start,
        end: end || text.length,
      },
      error: null,
    };
  }

  private async regex(context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.getText(context);
    const pattern = this.config.pattern || context.$json.pattern || '';
    const flags = this.config.flags || 'g';
    const operation = this.config.regexOperation || 'match'; // match, test, replace
    
    if (!pattern) {
      throw new Error('Regex pattern is required');
    }
    
    const regex = new RegExp(pattern, flags);
    
    let result: any;
    
    switch (operation) {
      case 'match':
        result = text.match(regex) || [];
        break;
      case 'test':
        result = regex.test(text);
        break;
      case 'replace':
        const replaceWith = this.config.replaceWith || '';
        result = text.replace(regex, replaceWith);
        break;
      default:
        throw new Error(`Unknown regex operation: ${operation}`);
    }
    
    return {
      success: true,
      data: {
        result,
        original: text,
        pattern,
        flags,
        operation,
      },
      error: null,
    };
  }

  private getText(context: ExecutionContext): string {
    const text = this.config.text || context.$json.text || context.$json.input || '';
    return String(text);
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (this.config.operation === 'replace' && !this.config.search) {
      errors.push('Search text is required for replace operation');
    }

    if (this.config.operation === 'regex' && !this.config.pattern) {
      errors.push('Regex pattern is required for regex operation');
    }

    return errors;
  }
}
