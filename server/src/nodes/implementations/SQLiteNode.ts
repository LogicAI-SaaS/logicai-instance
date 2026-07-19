import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
// import Database from 'better-sqlite3';
import * as path from 'path';

/**
 * SQLite Node - Local SQLite database operations
 * 
 * Supported operations:
 * - query: Execute SELECT query
 * - execute: Execute INSERT/UPDATE/DELETE
 * - transaction: Execute multiple statements in a transaction
 * - backup: Create database backup
 * 
 * NOTE: better-sqlite3 package needs to be installed
 */
export class SQLiteNode extends BaseNode {
  private db?: any; // Database.Database when better-sqlite3 is installed
  private dbPath: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.dbPath = this.config.database || this.config.dbPath || process.env.SQLITE_DB_PATH || ':memory:';
    // better-sqlite3 not installed - database initialization skipped
  }

  getType(): string {
    return 'sqlite';
  }

  getIcon(): string {
    return 'database';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    // TODO: Install better-sqlite3 package and implement
    return {
      success: false,
      data: null,
      error: 'better-sqlite3 package not installed. Run: npm install better-sqlite3',
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.dbPath) {
      errors.push('Database path is required');
    }

    if (this.config.operation === 'backup' && !this.config.backupPath) {
      errors.push('Backup path is required for backup operation');
    }

    return errors;
  }

  // Cleanup database connection when node is destroyed
  destroy(): void {
    if (this.db) {
      try {
        this.db.close();
      } catch (error) {
        console.error('Error closing SQLite database:', error);
      }
    }
  }
}
