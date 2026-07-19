import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { Pool, PoolClient, QueryResult } from 'pg';

/**
 * PostgreSQL Node - PostgreSQL Database operations
 * n8n-compatible: Execute SQL queries with connection pooling
 *
 * Configuration:
 * - operation: 'query' | 'insert' | 'update' | 'delete' | 'executeBatch' | 'beginTransaction' | 'commit' | 'rollback'
 * - connection: { host, port, user, password, database, ssl, maxConnections }
 * - query: SQL query string
 * - params: Array of parameters for prepared statements
 * - options: { timeout, statementTimeout, parseInputDatesAsUTC }
 * - transactionId: Transaction identifier for multi-step operations
 */
export class PostgreSQLNode extends BaseNode {
  private pool?: Pool;
  private transactions: Map<string, PoolClient> = new Map();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializePool();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'query';

    if (!['query', 'insert', 'update', 'delete', 'executeBatch', 'beginTransaction', 'commit', 'rollback'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (!this.config.connection) {
      throw new Error('connection configuration is required');
    }

    if (!this.config.connection.host) {
      throw new Error('connection.host is required');
    }

    if (!this.config.database) {
      throw new Error('database name is required');
    }
  }

  /**
   * Initialize connection pool
   */
  private initializePool(): void {
    const conn = this.config.connection;

    this.pool = new Pool({
      host: conn.host,
      port: conn.port || 5432,
      user: conn.user,
      password: conn.password,
      database: this.config.database,
      max: conn.maxConnections || 20,
      idleTimeoutMillis: conn.idleTimeout || 30000,
      connectionTimeoutMillis: conn.connectionTimeout || 2000,
      ssl: conn.ssl ? this.getSSLConfig(conn.ssl) : undefined,
      statement_timeout: this.config.options?.statementTimeout,
      parseInputDatesAsUTC: this.config.options?.parseInputDatesAsUTC !== false,
    });

    this.pool.on('error', (err) => {
      console.error('PostgreSQL Pool Error:', err);
    });
  }

  /**
   * Get SSL configuration
   */
  private getSSLConfig(sslConfig: any): any {
    if (sslConfig === true) {
      return { rejectUnauthorized: true };
    }
    if (typeof sslConfig === 'object') {
      return {
        rejectUnauthorized: sslConfig.rejectUnauthorized !== false,
        ca: sslConfig.ca,
        cert: sslConfig.cert,
        key: sslConfig.key,
      };
    }
    return undefined;
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'query';

      switch (operation) {
        case 'query':
          return await this.executeQuery(context);
        case 'insert':
          return await this.executeInsert(context);
        case 'update':
          return await this.executeUpdate(context);
        case 'delete':
          return await this.executeDelete(context);
        case 'executeBatch':
          return await this.executeBatch(context);
        case 'beginTransaction':
          return await this.beginTransaction(context);
        case 'commit':
          return await this.commitTransaction(context);
        case 'rollback':
          return await this.rollbackTransaction(context);
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
   * Execute SELECT query
   */
  private async executeQuery(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const params = this.resolveValue(this.config.params, context) || [];
    const options = this.config.options || {};

    if (!query) {
      throw new Error('query is required');
    }

    const pool = this.getPool();
    const result: QueryResult = await pool.query({
      text: query,
      values: params,
      rowMode: options.rowMode || 'array', // 'array' or 'object'
      timeout: options.timeout || this.config.options?.timeout,
    });

    return {
      success: true,
      data: {
        results: result.rows,
        rowCount: result.rowCount || 0,
        fields: result.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })),
        command: result.command,
      },
    };
  }

  /**
   * Execute INSERT query
   */
  private async executeInsert(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const params = this.resolveValue(this.config.params, context) || [];
    const options = this.config.options || {};

    if (!query) {
      throw new Error('query is required for insert operation');
    }

    const pool = this.getPool();
    const result: QueryResult = await pool.query({
      text: query,
      values: params,
      timeout: options.timeout || this.config.options?.timeout,
    });

    return {
      success: true,
      data: {
        insertId: result.rows[0]?.id || null, // Check for RETURNING clause
        affectedRows: result.rowCount || 0,
        command: result.command,
      },
    };
  }

  /**
   * Execute UPDATE query
   */
  private async executeUpdate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const params = this.resolveValue(this.config.params, context) || [];
    const options = this.config.options || {};

    if (!query) {
      throw new Error('query is required for update operation');
    }

    const pool = this.getPool();
    const result: QueryResult = await pool.query({
      text: query,
      values: params,
      timeout: options.timeout || this.config.options?.timeout,
    });

    return {
      success: true,
      data: {
        affectedRows: result.rowCount || 0,
        command: result.command,
      },
    };
  }

  /**
   * Execute DELETE query
   */
  private async executeDelete(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query;
    const params = this.resolveValue(this.config.params, context) || [];
    const options = this.config.options || {};

    if (!query) {
      throw new Error('query is required for delete operation');
    }

    const pool = this.getPool();
    const result: QueryResult = await pool.query({
      text: query,
      values: params,
      timeout: options.timeout || this.config.options?.timeout,
    });

    return {
      success: true,
      data: {
        affectedRows: result.rowCount || 0,
        command: result.command,
      },
    };
  }

  /**
   * Execute multiple queries in batch
   */
  private async executeBatch(context: ExecutionContext): Promise<NodeExecutionResult> {
    const queries = this.config.queries || [];
    const useTransaction = this.config.useTransaction !== false;

    if (!Array.isArray(queries) || queries.length === 0) {
      throw new Error('queries array is required for executeBatch');
    }

    const pool = this.getPool();
    let client: PoolClient | undefined;
    let transactionId: string | undefined;

    try {
      if (useTransaction) {
        // Start transaction
        client = await pool.connect();
        transactionId = this.generateTransactionId();
        this.transactions.set(transactionId, client);
        await client.query('BEGIN');

        const results: any[] = [];
        for (const q of queries) {
          const params = q.params || [];
          const result = await client.query({
            text: q.query,
            values: params,
          });
          results.push({
            query: q.query,
            rowCount: result.rowCount,
            command: result.command,
          });
        }

        await client.query('COMMIT');

        return {
          success: true,
          data: {
            executed: queries.length,
            results,
            transactionId,
            committed: true,
          },
        };
      } else {
        // Execute without transaction
        const results: any[] = [];
        for (const q of queries) {
          const params = q.params || [];
          const result = await pool.query({
            text: q.query,
            values: params,
          });
          results.push({
            query: q.query,
            rowCount: result.rowCount,
            command: result.command,
          });
        }

        return {
          success: true,
          data: {
            executed: queries.length,
            results,
          },
        };
      }
    } catch (error: any) {
      if (client && transactionId) {
        await client.query('ROLLBACK');
        this.transactions.delete(transactionId);
      }
      throw error;
    } finally {
      if (client && !transactionId) {
        client.release();
      }
    }
  }

  /**
   * Begin transaction
   */
  private async beginTransaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const pool = this.getPool();
    const client = await pool.connect();

    await client.query('BEGIN');

    const transactionId = this.generateTransactionId();
    this.transactions.set(transactionId, client);

    return {
      success: true,
      data: {
        transactionId,
        started: true,
      },
    };
  }

  /**
   * Commit transaction
   */
  private async commitTransaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const transactionId = this.config.transactionId || this.resolveValue(this.config.transactionIdReference, context);

    if (!transactionId) {
      throw new Error('transactionId is required for commit operation');
    }

    const client = this.transactions.get(transactionId);
    if (!client) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    await client.query('COMMIT');
    client.release();
    this.transactions.delete(transactionId);

    return {
      success: true,
      data: {
        transactionId,
        committed: true,
      },
    };
  }

  /**
   * Rollback transaction
   */
  private async rollbackTransaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const transactionId = this.config.transactionId || this.resolveValue(this.config.transactionIdReference, context);

    if (!transactionId) {
      throw new Error('transactionId is required for rollback operation');
    }

    const client = this.transactions.get(transactionId);
    if (!client) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    await client.query('ROLLBACK');
    client.release();
    this.transactions.delete(transactionId);

    return {
      success: true,
      data: {
        transactionId,
        rolledBack: true,
      },
    };
  }

  /**
   * Get connection pool
   */
  private getPool(): Pool {
    if (!this.pool) {
      throw new Error('PostgreSQL pool not initialized');
    }
    return this.pool;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused. Check the database host and port.';
    }
    if (error.code === '3D000') {
      return 'Database does not exist.';
    }
    if (error.code === '28000') {
      return 'Invalid authentication credentials.';
    }
    if (error.code === '3D000') {
      return 'Invalid catalog name.';
    }
    if (error.code === '42P01') {
      return 'Table does not exist.';
    }
    if (error.code === '42703') {
      return 'Column does not exist.';
    }
    if (error.code === '23505') {
      return 'Duplicate key violation.';
    }
    if (error.code === '23503') {
      return 'Foreign key violation.';
    }
    if (error.code === '23502') {
      return 'NOT NULL violation.';
    }
    if (error.code === '22001') {
      return 'String data too long.';
    }
    if (error.code === '08001') {
      return 'Connection does not exist.';
    }
    if (error.code === '53000') {
      return 'Insufficient resources (disk space, memory, etc.).';
    }
    if (error.code === '54000') {
      return 'Program limit exceeded (statement too complex, etc.).';
    }
    if (error.code === '55000') {
      return 'Object not in prerequisite state.';
    }
    return `PostgreSQL error: ${error.message || error.code || 'Unknown error'}`;
  }

  /**
   * Close all connections
   */
  async disconnect(): Promise<void> {
    // Rollback any open transactions
    for (const [txId, client] of Array.from(this.transactions.entries())) {
      try {
        await client.query('ROLLBACK');
        client.release();
      } catch (e) {
        // Ignore errors during cleanup
      }
    }
    this.transactions.clear();

    // Close pool
    if (this.pool) {
      await this.pool.end();
      this.pool = undefined;
    }
  }

  getType(): string {
    return 'postgreSQL';
  }

  getIcon(): string {
    return 'Database';
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const pool = this.getPool();
      const result = await pool.query('SELECT NOW()');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get database info
   */
  async getDatabaseInfo(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const pool = this.getPool();

      // Get version
      const versionResult = await pool.query('SELECT version()');
      // Get current database
      const dbResult = await pool.query('SELECT current_database()');
      // Get current user
      const userResult = await pool.query('SELECT current_user');
      // Get all tables
      const tablesResult = await pool.query(`
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
        ORDER BY table_name
      `);

      return {
        success: true,
        data: {
          version: versionResult.rows[0].version,
          database: dbResult.rows[0].current_database,
          user: userResult.rows[0].current_user,
          tables: tablesResult.rows,
          tableCount: tablesResult.rowCount,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List all tables
   */
  async listTables(options?: { schema?: string; includeSystemTables?: boolean }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const pool = this.getPool();
      const schema = options?.schema || 'public';
      const includeSystem = options?.includeSystemTables || false;

      let query = `
        SELECT table_name, table_type
        FROM information_schema.tables
        WHERE table_schema = $1
      `;

      if (!includeSystem) {
        query += ` AND table_schema NOT IN ('pg_catalog', 'information_schema')`;
      }

      query += ` ORDER BY table_name`;

      const result = await pool.query(query, [schema]);

      return {
        success: true,
        data: {
          tables: result.rows,
          count: result.rowCount,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get table structure
   */
  async getTableStructure(tableName: string, schema?: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const pool = this.getPool();
      const tableSchema = schema || 'public';

      // Get columns
      const columnsResult = await pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `, [tableSchema, tableName]);

      // Get constraints
      const constraintsResult = await pool.query(`
        SELECT
          constraint_name,
          constraint_type
        FROM information_schema.table_constraints
        WHERE table_schema = $1 AND table_name = $2
      `, [tableSchema, tableName]);

      // Get indexes
      const indexesResult = await pool.query(`
        SELECT
          indexname,
          indexdef
        FROM pg_indexes
        WHERE schemaname = $1 AND tablename = $2
      `, [tableSchema, tableName]);

      return {
        success: true,
        data: {
          table: tableName,
          schema: tableSchema,
          columns: columnsResult.rows,
          constraints: constraintsResult.rows,
          indexes: indexesResult.rows,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute raw SQL file
   */
  async executeSQLFile(sqlContent: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const pool = this.getPool();

      // Split by semicolon and execute each statement
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      const results: any[] = [];
      for (const statement of statements) {
        const result = await pool.query(statement);
        results.push({
          statement,
          rowCount: result.rowCount,
          command: result.command,
        });
      }

      return {
        success: true,
        data: {
          executed: statements.length,
          results,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
