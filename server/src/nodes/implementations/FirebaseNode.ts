import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Firebase Node - Google Firebase integration
 * 
 * Supported operations:
 * - firestore: Firestore database operations (get, set, update, delete, query)
 * - realtime: Realtime Database operations (get, set, update, delete)
 * - auth: Authentication operations (create, delete, verify)
 */
export class FirebaseNode extends BaseNode {
  private projectId?: string;
  private apiKey?: string;
  private databaseURL?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.projectId = this.config.credentials?.projectId || this.config.projectId || process.env.FIREBASE_PROJECT_ID;
    this.apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.FIREBASE_API_KEY;
    this.databaseURL = this.config.databaseURL || process.env.FIREBASE_DATABASE_URL;
  }

  getType(): string {
    return 'firebase';
  }

  getIcon(): string {
    return 'flame';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.projectId || !this.apiKey) {
        throw new Error('Firebase credentials not configured');
      }

      const operation = this.config.operation || 'firestore';
      
      switch (operation) {
        case 'firestore':
          return await this.firestoreOperation(context);
        case 'realtime':
          return await this.realtimeOperation(context);
        case 'auth':
          return await this.authOperation(context);
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

  private async firestoreOperation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const action = this.config.action || 'get';
    const collection = this.config.collection || context.$json.collection || '';
    const documentId = this.config.documentId || context.$json.documentId || '';
    const data = this.config.data || context.$json.data || {};

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents`;
    const docPath = `${collection}/${documentId}`;

    let url = '';
    let method = 'GET';
    let body: any = null;

    switch (action) {
      case 'get':
        url = `${baseUrl}/${docPath}?key=${this.apiKey}`;
        method = 'GET';
        break;
      case 'set':
      case 'update':
        url = `${baseUrl}/${docPath}?key=${this.apiKey}`;
        method = 'PATCH';
        body = JSON.stringify({
          fields: this.convertToFirestoreFormat(data)
        });
        break;
      case 'delete':
        url = `${baseUrl}/${docPath}?key=${this.apiKey}`;
        method = 'DELETE';
        break;
      case 'query':
        url = `${baseUrl}:runQuery?key=${this.apiKey}`;
        method = 'POST';
        body = JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: collection }],
            where: this.config.where || {},
            limit: this.config.limit || 100,
          }
        });
        break;
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firebase Firestore error: ${error}`);
    }

    const result = await response.json() as any;
    
    return {
      success: true,
      data: {
        result: action === 'query' ? result : this.convertFromFirestoreFormat(result.fields || {}),
        action,
        collection,
        documentId: action !== 'query' ? documentId : undefined,
      },
      error: null,
    };
  }

  private async realtimeOperation(context: ExecutionContext): Promise<NodeExecutionResult> {
    if (!this.databaseURL) {
      throw new Error('Firebase Realtime Database URL not configured');
    }

    const action = this.config.action || 'get';
    const path = this.config.path || context.$json.path || '/';
    const data = this.config.data || context.$json.data || {};

    const url = `${this.databaseURL}${path}.json?auth=${this.apiKey}`;
    let method = 'GET';
    let body: any = null;

    switch (action) {
      case 'get':
        method = 'GET';
        break;
      case 'set':
        method = 'PUT';
        body = JSON.stringify(data);
        break;
      case 'update':
        method = 'PATCH';
        body = JSON.stringify(data);
        break;
      case 'delete':
        method = 'DELETE';
        break;
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firebase Realtime Database error: ${error}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: {
        result,
        action,
        path,
      },
      error: null,
    };
  }

  private async authOperation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const action = this.config.action || 'verify';
    const idToken = this.config.idToken || context.$json.idToken || '';

    let url = '';
    let method = 'POST';
    let body: any = null;

    switch (action) {
      case 'verify':
        url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${this.apiKey}`;
        body = JSON.stringify({ idToken });
        break;
      case 'create':
        url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${this.apiKey}`;
        body = JSON.stringify({
          email: this.config.email || context.$json.email,
          password: this.config.password || context.$json.password,
          returnSecureToken: true,
        });
        break;
      case 'delete':
        url = `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${this.apiKey}`;
        body = JSON.stringify({ idToken });
        break;
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Firebase Auth error: ${error}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      data: {
        result,
        action,
      },
      error: null,
    };
  }

  private convertToFirestoreFormat(data: Record<string, any>): Record<string, any> {
    const formatted: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      formatted[key] = this.getFirestoreValue(value);
    }
    return formatted;
  }

  private getFirestoreValue(value: any): any {
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'number') return { doubleValue: value };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (value === null) return { nullValue: null };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(v => this.getFirestoreValue(v)) } };
    if (typeof value === 'object') return { mapValue: { fields: this.convertToFirestoreFormat(value) } };
    return { stringValue: String(value) };
  }

  private convertFromFirestoreFormat(fields: Record<string, any>): Record<string, any> {
    const data: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      data[key] = this.getPlainValue(value);
    }
    return data;
  }

  private getPlainValue(value: any): any {
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.doubleValue !== undefined) return value.doubleValue;
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.nullValue !== undefined) return null;
    if (value.arrayValue) return value.arrayValue.values.map((v: any) => this.getPlainValue(v));
    if (value.mapValue) return this.convertFromFirestoreFormat(value.mapValue.fields);
    return value;
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.projectId) {
      errors.push('Firebase Project ID is required');
    }

    if (!this.apiKey) {
      errors.push('Firebase API key is required');
    }

    if (this.config.operation === 'realtime' && !this.databaseURL) {
      errors.push('Firebase Database URL is required for Realtime operations');
    }

    return errors;
  }
}
