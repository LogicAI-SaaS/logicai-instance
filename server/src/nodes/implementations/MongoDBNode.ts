import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

/**
 * MongoDB Node - NoSQL database operations
 * n8n-compatible: MongoDB CRUD operations
 *
 * Configuration:
 * - connectionString: MongoDB connection URI
 * - database: Database name
 * - collection: Collection name
 * - operation: find, findOne, insertOne, insertMany, updateOne, updateMany, deleteOne, deleteMany, aggregate
 * - query: MongoDB query object
 * - update: MongoDB update object
 * - data: Data to insert
 * - options: MongoDB operation options
 */
export class MongoDBNode extends BaseNode {
  private client?: MongoClient;
  private db?: Db;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    let client: MongoClient | undefined;

    try {
      // Validate configuration
      this.validateConfig();

      // Connect to MongoDB
      client = await this.connect();

      const operation = this.config.operation || 'find';
      const collection = this.config.collection;
      const query = this.resolveVariables(this.config.query || {}, context);
      const update = this.resolveVariables(this.config.update || {}, context);
      const data = this.resolveVariables(this.config.data || {}, context);
      const options = this.config.options || {};

      const col = this.db!.collection(collection);

      switch (operation) {
        case 'find':
          return await this.find(col, query, options);
        case 'findOne':
          return await this.findOne(col, query, options);
        case 'insertOne':
          return await this.insertOne(col, data);
        case 'insertMany':
          return await this.insertMany(col, Array.isArray(data) ? data : [data]);
        case 'updateOne':
          return await this.updateOne(col, query, update, options);
        case 'updateMany':
          return await this.updateMany(col, query, update, options);
        case 'deleteOne':
          return await this.deleteOne(col, query);
        case 'deleteMany':
          return await this.deleteMany(col, query);
        case 'aggregate':
          return await this.aggregate(col, this.config.pipeline || [], options);
        case 'count':
          return await this.count(col, query, options);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    } finally {
      // Always close connection
      if (client) {
        await client.close();
      }
    }
  }

  /**
   * Validate MongoDB configuration
   */
  private validateConfig(): void {
    if (!this.config.connectionString && !this.config.uri) {
      throw new Error('MongoDB connection string is required. Provide connectionString or uri in config.');
    }

    if (!this.config.database) {
      throw new Error('Database name is required.');
    }

    if (!this.config.collection) {
      throw new Error('Collection name is required.');
    }
  }

  /**
   * Connect to MongoDB
   */
  private async connect(): Promise<MongoClient> {
    const connectionString = this.config.connectionString || this.config.uri;
    const dbName = this.config.database;

    const client = new MongoClient(connectionString, {
      connectTimeoutMS: this.config.timeout || 10000,
      socketTimeoutMS: this.config.socketTimeout || 30000,
    });

    await client.connect();
    this.client = client;
    this.db = client.db(dbName);

    return client;
  }

  /**
   * Find multiple documents
   */
  private async find(
    collection: Collection,
    query: any,
    options: any
  ): Promise<NodeExecutionResult> {
    const cursor = collection.find(query, options);

    // Apply limit if specified
    if (this.config.limit) {
      cursor.limit(this.config.limit);
    }

    // Apply sort if specified
    if (this.config.sort) {
      cursor.sort(this.config.sort);
    }

    // Apply skip if specified
    if (this.config.skip) {
      cursor.skip(this.config.skip);
    }

    const results = await cursor.toArray();

    return {
      success: true,
      data: {
        results,
        count: results.length,
        _operation: 'find',
      },
    };
  }

  /**
   * Find one document
   */
  private async findOne(
    collection: Collection,
    query: any,
    options: any
  ): Promise<NodeExecutionResult> {
    const result = await collection.findOne(query, options);

    return {
      success: true,
      data: result || null,
      _operation: 'findOne',
    };
  }

  /**
   * Insert one document
   */
  private async insertOne(
    collection: Collection,
    data: any
  ): Promise<NodeExecutionResult> {
    const result = await collection.insertOne(data);

    return {
      success: true,
      data: {
        insertedId: result.insertedId.toString(),
        acknowledged: result.acknowledged,
      },
      _operation: 'insertOne',
    };
  }

  /**
   * Insert many documents
   */
  private async insertMany(
    collection: Collection,
    data: any[]
  ): Promise<NodeExecutionResult> {
    const result = await collection.insertMany(data);

    return {
      success: true,
      data: {
        insertedCount: result.insertedCount,
        insertedIds: Object.values(result.insertedIds).map((id) => (id as ObjectId).toString()),
      },
      _operation: 'insertMany',
    };
  }

  /**
   * Update one document
   */
  private async updateOne(
    collection: Collection,
    query: any,
    update: any,
    options: any
  ): Promise<NodeExecutionResult> {
    const result = await collection.updateOne(query, update, options);

    return {
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged,
        upsertedId: result.upsertedId?.toString(),
      },
      _operation: 'updateOne',
    };
  }

  /**
   * Update many documents
   */
  private async updateMany(
    collection: Collection,
    query: any,
    update: any,
    options: any
  ): Promise<NodeExecutionResult> {
    const result = await collection.updateMany(query, update, options);

    return {
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged,
      },
      _operation: 'updateMany',
    };
  }

  /**
   * Delete one document
   */
  private async deleteOne(
    collection: Collection,
    query: any
  ): Promise<NodeExecutionResult> {
    const result = await collection.deleteOne(query);

    return {
      success: true,
      data: {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged,
      },
      _operation: 'deleteOne',
    };
  }

  /**
   * Delete many documents
   */
  private async deleteMany(
    collection: Collection,
    query: any
  ): Promise<NodeExecutionResult> {
    const result = await collection.deleteMany(query);

    return {
      success: true,
      data: {
        deletedCount: result.deletedCount,
        acknowledged: result.acknowledged,
      },
      _operation: 'deleteMany',
    };
  }

  /**
   * Aggregate pipeline
   */
  private async aggregate(
    collection: Collection,
    pipeline: any[],
    options: any
  ): Promise<NodeExecutionResult> {
    const cursor = collection.aggregate(pipeline, options);
    const results = await cursor.toArray();

    return {
      success: true,
      data: {
        results,
        count: results.length,
      },
      _operation: 'aggregate',
    };
  }

  /**
   * Count documents
   */
  private async count(
    collection: Collection,
    query: any,
    options: any
  ): Promise<NodeExecutionResult> {
    const count = await collection.countDocuments(query, options);

    return {
      success: true,
      data: { count },
      _operation: 'count',
    };
  }

  /**
   * Resolve variables in query/update/data
   */
  private resolveVariables(obj: any, context: ExecutionContext): any {
    if (typeof obj === 'string') {
      // Replace {{ variable }} patterns
      return obj.replace(/\{\{(\$json|\$workflow|\$node)\.([\w.]+)\}\}/g, (match, type, path) => {
        const source = type === '$json' ? context.$json : type === '$workflow' ? context.$workflow : context.$node;
        return this.getNestedValue(source, path) || match;
      });
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.resolveVariables(item, context));
    }

    if (typeof obj === 'object' && obj !== null) {
      const resolved: any = {};
      for (const [key, value] of Object.entries(obj)) {
        resolved[key] = this.resolveVariables(value, context);
      }
      return resolved;
    }

    return obj;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.name === 'MongoServerError') {
      return `MongoDB server error: ${error.message}`;
    }
    if (error.name === 'MongoNetworkError') {
      return 'MongoDB network error: Unable to connect to server. Check your connection string and network.';
    }
    if (error.name === 'MongoTimeoutError') {
      return 'MongoDB timeout error: Operation took too long.';
    }
    if (error.message.includes('ECONNREFUSED')) {
      return 'Connection refused: Unable to reach MongoDB server.';
    }
    if (error.message.includes('Authentication failed')) {
      return 'Authentication failed: Invalid username or password.';
    }
    return `MongoDB error: ${error.message}`;
  }

  getType(): string {
    return 'mongoDB';
  }

  getIcon(): string {
    return 'Database';
  }
}
