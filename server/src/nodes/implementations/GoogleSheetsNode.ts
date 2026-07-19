import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Google Sheets Node - Interact with Google Sheets API
 * n8n-compatible: Read, write, append, update, delete spreadsheet data
 *
 * Configuration:
 * - operation: 'read' | 'write' | 'append' | 'update' | 'delete' | 'create' | 'list'
 * - credentials: OAuth2 credentials or Service Account key
 * - spreadsheetId: Spreadsheet ID (from URL)
 * - sheetName: Sheet name (optional, uses first sheet by default)
 * - range: Cell range (e.g., 'A1:D10' or 'Sheet1!A1:D10')
 * - values: Array of arrays (rows) or array of objects
 * - options: { valueInputMode, majorDimension, includeGridData }
 */
export class GoogleSheetsNode extends BaseNode {
  private oauth2Client?: OAuth2Client;
  private sheets?: any;
  private serviceAccount?: any;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializeClient();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'read';

    if (!['read', 'write', 'append', 'update', 'delete', 'create', 'clear', 'list'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (this.config.operation !== 'list' && !this.config.spreadsheetId) {
      throw new Error('spreadsheetId is required');
    }
  }

  /**
   * Initialize Google Sheets client
   */
  private initializeClient(): void {
    if (this.config.credentials?.type === 'service_account') {
      // Service account authentication
      this.serviceAccount = this.config.credentials;
    } else {
      // OAuth2 authentication
      const { clientId, clientSecret, refreshToken } = this.config.credentials || {};

      if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Invalid OAuth2 credentials');
      }

      this.oauth2Client = new OAuth2Client(
        clientId,
        clientSecret
      );

      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
    }

    this.sheets = google.sheets({ version: 'v4', auth: this.oauth2Client || undefined });
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'read';

      switch (operation) {
        case 'read':
          return await this.readSheet(context);
        case 'write':
          return await this.writeSheet(context);
        case 'append':
          return await this.appendSheet(context);
        case 'update':
          return await this.updateSheet(context);
        case 'delete':
          return await this.deleteSheet(context);
        case 'clear':
          return await this.clearSheet(context);
        case 'create':
          return await this.createSpreadsheet(context);
        case 'list':
          return await this.listSpreadsheets();
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
   * Read sheet data
   */
  private async readSheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const spreadsheetId = this.resolveValue(this.config.spreadsheetId, context);
    const range = this.resolveValue(this.config.range, context) || 'A1:Z1000';
    const options = this.config.options || {};

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: options.valueRenderOption || 'UNFORMATTED_VALUE',
      dateTimeRenderOption: options.dateTimeRenderOption || 'FORMATTED_STRING',
    });

    const values = response.data.values || [];

    // Convert to array of objects if header row exists
    let data = values;
    if (options.headerRow !== false && values.length > 0) {
      const headers = values[0];
      data = values.slice(1).map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header: string, i: number) => {
          obj[header] = row[i];
        });
        return obj;
      });
    }

    return {
      success: true,
      data: {
        range: response.data.range,
        majorDimension: response.data.majorDimension,
        values: data,
        rowCount: values.length,
        columnCount: values[0]?.length || 0,
      },
    };
  }

  /**
   * Write data to sheet
   */
  private async writeSheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const spreadsheetId = this.resolveValue(this.config.spreadsheetId, context);
    const range = this.resolveValue(this.config.range, context);
    const values = this.resolveValue(this.config.values, context);
    const options = this.config.options || {};

    if (!values || !Array.isArray(values)) {
      throw new Error('values must be an array');
    }

    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: options.valueInputMode || 'RAW',
      requestBody: {
        values: this.formatValues(values),
      },
    });

    return {
      success: true,
      data: {
        updatedRows: response.data.updates.updatedRows,
        updatedColumns: response.data.updates.updatedColumns,
        updatedCells: response.data.updates.updatedCells,
      },
    };
  }

  /**
   * Append data to sheet
   */
  private async appendSheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const spreadsheetId = this.resolveValue(this.config.spreadsheetId, context);
    const range = this.resolveValue(this.config.range, context);
    const values = this.resolveValue(this.config.values, context);
    const options = this.config.options || {};

    if (!values || !Array.isArray(values)) {
      throw new Error('values must be an array');
    }

    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: options.valueInputMode || 'RAW',
      insertDataOption: options.insertDataOption || 'INSERT_ROWS',
      requestBody: {
        values: this.formatValues(values),
      },
    });

    return {
      success: true,
      data: {
        updatedRows: response.data.updates.updatedRows,
        tableRange: response.data.updates.tableRange,
      },
    };
  }

  /**
   * Update specific cells
   */
  private async updateSheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const spreadsheetId = this.resolveValue(this.config.spreadsheetId, context);
    const range = this.resolveValue(this.config.range, context);
    const values = this.resolveValue(this.config.values, context);

    if (!values) {
      throw new Error('values are required');
    }

    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: this.formatValues(values),
      },
    });

    return {
      success: true,
      data: {
        updatedRows: response.data.updates.updatedRows,
        updatedColumns: response.data.updates.updatedColumns,
        updatedCells: response.data.updates.updatedCells,
      },
    };
  }

  /**
   * Delete rows/columns
   */
  private async deleteSheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const spreadsheetId = this.resolveValue(this.config.spreadsheetId, context);
    const sheetId = this.config.sheetId;
    const dimension = this.config.dimension || 'ROWS'; // ROWS or COLUMNS
    const startIndex = this.config.startIndex || 0;
    const endIndex = this.config.endIndex || 1;

    const response = await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId || 0,
                dimension,
                startIndex,
                endIndex,
              },
            },
          },
        ],
      },
    });

    return {
      success: true,
      data: {
        deleted: true,
      },
    };
  }

  /**
   * Clear sheet data
   */
  private async clearSheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const spreadsheetId = this.resolveValue(this.config.spreadsheetId, context);
    const range = this.resolveValue(this.config.range, context);

    const response = await this.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range,
    });

    return {
      success: true,
      data: {
        clearedRows: response.data.updates.clearedRows,
        clearedColumns: response.data.updates.clearedColumns,
      },
    };
  }

  /**
   * Create new spreadsheet
   */
  private async createSpreadsheet(context: ExecutionContext): Promise<NodeExecutionResult> {
    const title = this.resolveValue(this.config.title, context) || 'New Spreadsheet';
    const sheets = this.config.sheets || [{ title: 'Sheet1' }];

    const response = await this.sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
        sheets: sheets.map((sheet: any) => ({
          properties: {
            title: sheet.title,
            index: sheet.index,
            sheetType: 'GRID',
            hidden: sheet.hidden || false,
          },
        })),
      },
    });

    return {
      success: true,
      data: {
        spreadsheetId: response.data.spreadsheetId,
        spreadsheetUrl: response.data.spreadsheetUrl,
        title: response.data.properties.title,
      },
    };
  }

  /**
   * List user's spreadsheets
   */
  private async listSpreadsheets(): Promise<NodeExecutionResult> {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.config.spreadsheetId,
    });

    const sheets = (response.data.sheets || []).map((sheet: any) => ({
      sheetId: sheet.properties.sheetId,
      title: sheet.properties.title,
      index: sheet.properties.index,
      sheetType: sheet.properties.sheetType,
      hidden: sheet.properties.hidden || false,
    }));

    return {
      success: true,
      data: {
        spreadsheetId: response.data.spreadsheetId,
        spreadsheetUrl: response.data.spreadsheetUrl,
        title: response.data.properties.title,
        sheets,
      },
    };
  }

  /**
   * Format values for API
   */
  private formatValues(values: any): any[][] {
    // If array of objects, convert to array of arrays
    if (values.length > 0 && typeof values[0] === 'object' && !Array.isArray(values[0])) {
      const headers = Object.keys(values[0]);
      const rows = values.map((obj: any) => headers.map((header: any) => obj[header]));
      return [headers, ...rows];
    }

    return values;
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
    if (error.code === 400) {
      return 'Invalid request. Check the spreadsheet ID and range.';
    }
    if (error.code === 403) {
      return 'Access denied. Check your permissions.';
    }
    if (error.code === 404) {
      return 'Spreadsheet not found.';
    }
    return `Google Sheets API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'googleSheets';
  }

  getIcon(): string {
    return 'Table';
  }

  /**
   * Extract spreadsheet ID from URL
   */
  static extractSpreadsheetId(url: string): string | null {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  }

  /**
   * Get A1 notation from row/column indices
   */
  static getA1Notation(row: number, col: number): string {
    const columnLetter = String.fromCharCode(65 + (col % 26));
    return `${columnLetter}${row + 1}`;
  }

  /**
   * Parse A1 notation to row/column indices
   */
  static parseA1Notation(a1: string): { row: number; col: number } | null {
    const match = a1.match(/^([A-Z]+)(\d+)$/);
    if (!match) return null;

    const col = match[1].split('').reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 64), 0) - 1;
    const row = parseInt(match[2]) - 1;

    return { row, col };
  }
}
