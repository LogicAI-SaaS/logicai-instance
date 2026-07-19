import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { PythonShell } from 'python-shell';

/**
 * Code Node - Execute custom JavaScript or Python code
 * n8n-compatible: Run custom code with sandboxed execution
 *
 * Supported languages:
 * - javascript: Node.js execution with async support
 * - python: Python 3 execution via python-shell
 *
 * Execution modes:
 * - runOnceForAllItems: Execute once with all input data
 * - eachItem: Execute for each item sequentially
 * - eachItemInParallel: Execute for each item in parallel
 */
export class CodeNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Validate code is provided
      const code = this.config.code || '';
      if (!code || code.trim().length === 0) {
        throw new Error('No code provided. Please add code to execute.');
      }

      const language = this.config.language || 'javascript';
      const mode = this.config.mode || 'runOnceForAllItems';
      const input = context.$json;

      // Validate language support
      const supportedLanguages = ['javascript', 'python'];
      if (!supportedLanguages.includes(language)) {
        throw new Error(`Unsupported language: ${language}. Supported languages: ${supportedLanguages.join(', ')}`);
      }

      let result: any;

      switch (language) {
        case 'javascript':
          result = await this.executeJavaScript(code, input, mode, context);
          break;

        case 'python':
          result = await this.executePython(code, input, mode);
          break;

        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Execute JavaScript code
   */
  private async executeJavaScript(
    code: string,
    input: any,
    mode: string,
    context: ExecutionContext
  ): Promise<any> {
    // Normalize input to array for processing
    const items = Array.isArray(input) ? input : [input];

    if (mode === 'runOnceForAllItems') {
      // Execute once with all items
      return await this.runJavaScriptOnce(code, items, context);
    } else if (mode === 'eachItem') {
      // Execute for each item sequentially
      const results = [];
      for (const item of items) {
        const result = await this.runJavaScriptOnce(code, [item], context);
        results.push(result);
      }
      return results;
    } else if (mode === 'eachItemInParallel') {
      // Execute for each item in parallel
      const promises = items.map((item) => this.runJavaScriptOnce(code, [item], context));
      return await Promise.all(promises);
    } else {
      throw new Error(`Unknown execution mode: ${mode}`);
    }
  }

  /**
   * Run JavaScript code once with given input
   */
  private async runJavaScriptOnce(
    code: string,
    items: any[],
    context: ExecutionContext
  ): Promise<any> {
    // Create sandbox context with available globals
    const sandbox = {
      // Input data
      input: items.length === 1 ? items[0] : items,
      items,
      $json: items.length === 1 ? items[0] : items,
      $workflow: context.$workflow,
      $node: context.$node,

      // Built-in JavaScript globals
      console: {
        log: (...args: any[]) => console.log('[Code Node]', ...args),
        error: (...args: any[]) => console.error('[Code Node]', ...args),
        warn: (...args: any[]) => console.warn('[Code Node]', ...args),
        info: (...args: any[]) => console.info('[Code Node]', ...args),
      },
      JSON,
      Math,
      Date,
      parseInt,
      parseFloat,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Error,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Promise,

      // Utility helpers
      fetch: require('node-fetch'),
      Buffer,
      URL,
      URLSearchParams,

      // Return helper (explicit return)
      return: (data: any) => data,
    };

    try {
      // Create async function from code
      const paramNames = Object.keys(sandbox);
      const paramValues = Object.values(sandbox);

      const asyncFunction = new Function(
        ...paramNames,
        `
          return (async () => {
            try {
              ${code}
            } catch (error) {
              console.error('Code execution error:', error);
              throw error;
            }
          })()
        `
      );

      // Execute the function with sandbox context
      const result = await asyncFunction(...paramValues);

      // Return result or input if no return value
      return result !== undefined ? result : sandbox.input;
    } catch (error: any) {
      throw new Error(`JavaScript execution error: ${error.message}`);
    }
  }

  /**
   * Execute Python code
   */
  private async executePython(code: string, input: any, mode: string): Promise<any> {
    // Check if Python is available
    const pythonPath = this.config.pythonPath || 'python3';

    // Normalize input
    const items = Array.isArray(input) ? input : [input];

    // Prepare Python code wrapper
    const pythonWrapper = `
import json
import sys

# Input data
input_data = ${JSON.stringify(items.length === 1 ? items[0] : items)}

# User code
${code}

# Output handling
if 'result' in locals():
    print(json.dumps(result))
elif 'return' in locals():
    print(json.dumps(return))
else:
    print(json.dumps(input_data))
`;

    try {
      if (mode === 'runOnceForAllItems') {
        return await this.runPythonOnce(pythonWrapper, pythonPath);
      } else if (mode === 'eachItem') {
        const results = [];
        for (const item of items) {
          const itemCode = `
import json
input_data = ${JSON.stringify(item)}
${code}
if 'result' in locals():
    print(json.dumps(result))
else:
    print(json.dumps(input_data))
`;
          const result = await this.runPythonOnce(itemCode, pythonPath);
          results.push(result);
        }
        return results;
      } else if (mode === 'eachItemInParallel') {
        const promises = items.map((item) => {
          const itemCode = `
import json
input_data = ${JSON.stringify(item)}
${code}
if 'result' in locals():
    print(json.dumps(result))
else:
    print(json.dumps(input_data))
`;
          return this.runPythonOnce(itemCode, pythonPath);
        });
        return await Promise.all(promises);
      } else {
        throw new Error(`Unknown execution mode: ${mode}`);
      }
    } catch (error: any) {
      throw new Error(`Python execution error: ${error.message}`);
    }
  }

  /**
   * Run Python code once
   */
  private async runPythonOnce(code: string, pythonPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        mode: 'text' as const,
        pythonPath,
        pythonOptions: ['-u'], // Unbuffered output
      };

      PythonShell.runString(code, options, (err, output) => {
        if (err) {
          reject(new Error(`Python execution failed: ${err.message}`));
          return;
        }

        try {
          // Parse JSON output from Python
          const outputText = output.join('\n').trim();
          const result = JSON.parse(outputText);
          resolve(result);
        } catch (parseError) {
          // If output is not JSON, return as string
          resolve(output.join('\n'));
        }
      });
    });
  }

  /**
   * Format error messages with helpful context
   */
  private formatErrorMessage(error: any): string {
    if (error.code === 'ENOENT') {
      return 'Python not found. Please ensure Python 3 is installed and accessible.';
    }

    if (error.message.includes('Python execution failed')) {
      return error.message;
    }

    if (error.message.includes('SyntaxError')) {
      return `Syntax error in code: ${error.message}`;
    }

    if (error.message.includes('ReferenceError') || error.message.includes('TypeError')) {
      return `Runtime error: ${error.message}`;
    }

    return error.message || 'Code execution failed';
  }

  getType(): string {
    return 'code';
  }

  getIcon(): string {
    return 'Code';
  }
}
