import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { createClient, RedisClientType } from 'redis';

/**
 * Redis Node - Key-value store operations
 * n8n-compatible: Redis cache operations with connection pooling
 *
 * Configuration:
 * - operation: 'get' | 'set' | 'delete' | 'incr' | 'decr' | 'expire' | 'exists' | 'keys' | 'hget' | 'hset' | 'hgetall' | 'hdel' | 'sadd' | 'srem' | 'smembers' | 'lpush' | 'rpush' | 'lpop' | 'rpop' | 'lrange'
 * - connection: { host, port, password, database, username }
 * - key: Redis key
 * - value: Value to set (for string operations)
 * - field: Hash field (for hash operations)
 * - member: Set member (for set operations)
 * - ttl: Time to live in seconds
 * - increment: Increment amount (for incr/decr)
 * - index: List index (for list operations)
 * - stop: List stop index (for lrange)
 * - options: { returnBuffer, parseValues }
 */
export class RedisNode extends BaseNode {
  private client?: RedisClientType;
  private isConnected = false;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'get';

    const validOperations = [
      'get', 'set', 'delete', 'incr', 'decr', 'expire', 'exists', 'keys',
      'hget', 'hset', 'hgetall', 'hdel', 'hexists', 'hkeys', 'hvals', 'hincrby',
      'sadd', 'srem', 'smembers', 'scard', 'sismember',
      'lpush', 'rpush', 'lpop', 'rpop', 'lrange', 'llen', 'lindex',
      'zadd', 'zrem', 'zrange', 'zcard', 'zscore'
    ];

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (!this.config.connection) {
      throw new Error('connection configuration is required');
    }

    if (!this.config.connection.host) {
      throw new Error('connection.host is required');
    }
  }

  /**
   * Get or create Redis client
   */
  private async getClient(): Promise<RedisClientType> {
    if (!this.client) {
      const conn = this.config.connection;

      const url = conn.password
        ? `redis://${conn.username || 'default'}:${conn.password}@${conn.host}:${conn.port || 6379}/${conn.database || 0}`
        : `redis://${conn.host}:${conn.port || 6379}/${conn.database || 0}`;

      this.client = createClient({
        url,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              return new Error('Redis reconnection failed after 10 attempts');
            }
            return Math.min(retries * 100, 3000);
          },
          connectTimeout: this.config.options?.connectTimeout || 10000,
        },
      }) as RedisClientType;

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await this.client.connect();
      this.isConnected = true;
    }

    return this.client;
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'get';

      switch (operation) {
        // String operations
        case 'get':
          return await this.get(context);
        case 'set':
          return await this.set(context);
        case 'delete':
          return await this.delete(context);
        case 'incr':
          return await this.incr(context);
        case 'decr':
          return await this.decr(context);
        case 'expire':
          return await this.expire(context);
        case 'exists':
          return await this.exists(context);
        case 'keys':
          return await this.keys(context);

        // Hash operations
        case 'hget':
          return await this.hget(context);
        case 'hset':
          return await this.hset(context);
        case 'hgetall':
          return await this.hgetall(context);
        case 'hdel':
          return await this.hdel(context);
        case 'hexists':
          return await this.hexists(context);
        case 'hkeys':
          return await this.hkeys(context);
        case 'hvals':
          return await this.hvals(context);
        case 'hincrby':
          return await this.hincrby(context);

        // Set operations
        case 'sadd':
          return await this.sadd(context);
        case 'srem':
          return await this.srem(context);
        case 'smembers':
          return await this.smembers(context);
        case 'scard':
          return await this.scard(context);
        case 'sismember':
          return await this.sismember(context);

        // List operations
        case 'lpush':
          return await this.lpush(context);
        case 'rpush':
          return await this.rpush(context);
        case 'lpop':
          return await this.lpop(context);
        case 'rpop':
          return await this.rpop(context);
        case 'lrange':
          return await this.lrange(context);
        case 'llen':
          return await this.llen(context);
        case 'lindex':
          return await this.lindex(context);

        // Sorted set operations
        case 'zadd':
          return await this.zadd(context);
        case 'zrem':
          return await this.zrem(context);
        case 'zrange':
          return await this.zrange(context);
        case 'zcard':
          return await this.zcard(context);
        case 'zscore':
          return await this.zscore(context);

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
   * Get string value
   */
  private async get(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for get operation');
    }

    const client = await this.getClient();
    const value = await client.get(key);

    return {
      success: true,
      data: {
        key,
        value: value !== null ? this.parseValue(value as string) : null,
        exists: value !== null,
      },
    };
  }

  /**
   * Set string value
   */
  private async set(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const value = this.resolveValue(this.config.value, context);
    const ttl = this.config.ttl;
    const NX = this.config.NX; // Only set if key doesn't exist
    const XX = this.config.XX; // Only set if key exists

    if (!key) {
      throw new Error('key is required for set operation');
    }
    if (value === undefined) {
      throw new Error('value is required for set operation');
    }

    const client = await this.getClient();
    const options: any = {};

    if (ttl) options.EX = ttl;
    if (NX) options.NX = true;
    if (XX) options.XX = true;

    const result = await client.set(key, this.stringifyValue(value), options);

    return {
      success: true,
      data: {
        key,
        value,
        ttl,
        set: result === 'OK',
      },
    };
  }

  /**
   * Delete key(s)
   */
  private async delete(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const keys = this.config.keys; // Array of keys

    if (!key && !keys) {
      throw new Error('key or keys array is required for delete operation');
    }

    const client = await this.getClient();
    const keysToDelete = keys || [key];
    const deleted = await client.del(keysToDelete);

    return {
      success: true,
      data: {
        keys: keysToDelete,
        deleted,
      },
    };
  }

  /**
   * Increment value
   */
  private async incr(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const increment = this.config.increment || 1;

    if (!key) {
      throw new Error('key is required for incr operation');
    }

    const client = await this.getClient();
    const value = await client.incrBy(key, increment);

    return {
      success: true,
      data: {
        key,
        increment,
        newValue: value,
      },
    };
  }

  /**
   * Decrement value
   */
  private async decr(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const decrement = this.config.decrement || 1;

    if (!key) {
      throw new Error('key is required for decr operation');
    }

    const client = await this.getClient();
    const value = await client.decrBy(key, decrement);

    return {
      success: true,
      data: {
        key,
        decrement,
        newValue: value,
      },
    };
  }

  /**
   * Set expiration time
   */
  private async expire(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const ttl = this.config.ttl;

    if (!key) {
      throw new Error('key is required for expire operation');
    }
    if (!ttl) {
      throw new Error('ttl is required for expire operation');
    }

    const client = await this.getClient();
    const result = await client.expire(key, ttl);

    return {
      success: true,
      data: {
        key,
        ttl,
        set: result === 1,
      },
    };
  }

  /**
   * Check if key exists
   */
  private async exists(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for exists operation');
    }

    const client = await this.getClient();
    const exists = await client.exists(key);

    return {
      success: true,
      data: {
        key,
        exists: exists === 1,
      },
    };
  }

  /**
   * Find keys matching pattern
   */
  private async keys(context: ExecutionContext): Promise<NodeExecutionResult> {
    const pattern = this.config.pattern || '*';

    const client = await this.getClient();
    const keys = await client.keys(pattern);

    return {
      success: true,
      data: {
        pattern,
        keys,
        count: keys.length,
      },
    };
  }

  /**
   * Get hash field
   */
  private async hget(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const field = this.config.field;

    if (!key || !field) {
      throw new Error('key and field are required for hget operation');
    }

    const client = await this.getClient();
    const value = await client.hGet(key, field);

    return {
      success: true,
      data: {
        key,
        field,
        value: value !== null ? this.parseValue(value as string) : null,
        exists: value !== null,
      },
    };
  }

  /**
   * Set hash field
   */
  private async hset(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const field = this.config.field;
    const value = this.resolveValue(this.config.value, context);

    if (!key || !field || value === undefined) {
      throw new Error('key, field, and value are required for hset operation');
    }

    const client = await this.getClient();
    await client.hSet(key, field, this.stringifyValue(value));

    return {
      success: true,
      data: {
        key,
        field,
        value,
        set: true,
      },
    };
  }

  /**
   * Get all hash fields
   */
  private async hgetall(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for hgetall operation');
    }

    const client = await this.getClient();
    const hash = await client.hGetAll(key);

    // Parse all values
    const result: Record<string, any> = {};
    for (const [field, value] of Object.entries(hash)) {
      result[field] = this.parseValue(value);
    }

    return {
      success: true,
      data: {
        key,
        fields: result,
        count: Object.keys(result).length,
      },
    };
  }

  /**
   * Delete hash field(s)
   */
  private async hdel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const fields = this.config.fields;
    const field = this.config.field;

    if (!key || (!fields && !field)) {
      throw new Error('key and fields array (or field) are required for hdel operation');
    }

    const client = await this.getClient();
    const fieldsToDelete = Array.isArray(fields) ? fields : [field];
    const deleted = await client.hDel(key, fieldsToDelete);

    return {
      success: true,
      data: {
        key,
        fields: fieldsToDelete,
        deleted,
      },
    };
  }

  /**
   * Check if hash field exists
   */
  private async hexists(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const field = this.config.field;

    if (!key || !field) {
      throw new Error('key and field are required for hexists operation');
    }

    const client = await this.getClient();
    const exists = await client.hExists(key, field);

    return {
      success: true,
      data: {
        key,
        field,
        exists,
      },
    };
  }

  /**
   * Get all hash fields
   */
  private async hkeys(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for hkeys operation');
    }

    const client = await this.getClient();
    const keys = await client.hKeys(key);

    return {
      success: true,
      data: {
        key,
        keys,
        count: keys.length,
      },
    };
  }

  /**
   * Get all hash values
   */
  private async hvals(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for hvals operation');
    }

    const client = await this.getClient();
    const values = await client.hVals(key);

    return {
      success: true,
      data: {
        key,
        values: values.map(v => this.parseValue(v as string)),
        count: values.length,
      },
    };
  }

  /**
   * Increment hash field
   */
  private async hincrby(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const field = this.config.field;
    const increment = this.config.increment || 1;

    if (!key || !field) {
      throw new Error('key and field are required for hincrby operation');
    }

    const client = await this.getClient();
    const newValue = await client.hIncrBy(key, field, increment);

    return {
      success: true,
      data: {
        key,
        field,
        increment,
        newValue,
      },
    };
  }

  /**
   * Add to set
   */
  private async sadd(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const members = this.config.members;
    const member = this.config.member;

    if (!key || (!members && !member)) {
      throw new Error('key and members array (or member) are required for sadd operation');
    }

    const client = await this.getClient();
    const membersToAdd = Array.isArray(members) ? members : [member];
    const added = await client.sAdd(key, membersToSendable(membersToAdd));

    return {
      success: true,
      data: {
        key,
        members: membersToAdd,
        added,
      },
    };
  }

  /**
   * Remove from set
   */
  private async srem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const members = this.config.members;
    const member = this.config.member;

    if (!key || (!members && !member)) {
      throw new Error('key and members array (or member) are required for srem operation');
    }

    const client = await this.getClient();
    const membersToRemove = Array.isArray(members) ? members : [member];
    const removed = await client.sRem(key, membersToSendable(membersToRemove));

    return {
      success: true,
      data: {
        key,
        members: membersToRemove,
        removed,
      },
    };
  }

  /**
   * Get all set members
   */
  private async smembers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for smembers operation');
    }

    const client = await this.getClient();
    const members = await client.sMembers(key);

    return {
      success: true,
      data: {
        key,
        members: members.map(m => this.parseValue(m as string)),
        count: members.length,
      },
    };
  }

  /**
   * Get set cardinality
   */
  private async scard(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for scard operation');
    }

    const client = await this.getClient();
    const count = await client.sCard(key);

    return {
      success: true,
      data: {
        key,
        count,
      },
    };
  }

  /**
   * Check if member is in set
   */
  private async sismember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const member = this.config.member;

    if (!key || !member) {
      throw new Error('key and member are required for sismember operation');
    }

    const client = await this.getClient();
    const isMember = await client.sIsMember(key, member);

    return {
      success: true,
      data: {
        key,
        member,
        isMember,
      },
    };
  }

  /**
   * Push to list from left
   */
  private async lpush(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const values = this.config.values;
    const value = this.config.value;

    if (!key || (!values && !value)) {
      throw new Error('key and values array (or value) are required for lpush operation');
    }

    const client = await this.getClient();
    const valuesToPush = Array.isArray(values) ? values : [value];
    const length = await client.lPush(key, membersToSendable(valuesToPush));

    return {
      success: true,
      data: {
        key,
        values: valuesToPush,
        newLength: length,
      },
    };
  }

  /**
   * Push to list from right
   */
  private async rpush(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const values = this.config.values;
    const value = this.config.value;

    if (!key || (!values && !value)) {
      throw new Error('key and values array (or value) are required for rpush operation');
    }

    const client = await this.getClient();
    const valuesToPush = Array.isArray(values) ? values : [value];
    const length = await client.rPush(key, membersToSendable(valuesToPush));

    return {
      success: true,
      data: {
        key,
        values: valuesToPush,
        newLength: length,
      },
    };
  }

  /**
   * Pop from list from left
   */
  private async lpop(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for lpop operation');
    }

    const client = await this.getClient();
    const value = await client.lPop(key);

    return {
      success: true,
      data: {
        key,
        value: value !== null ? this.parseValue(value as string) : null,
        existed: value !== null,
      },
    };
  }

  /**
   * Pop from list from right
   */
  private async rpop(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for rpop operation');
    }

    const client = await this.getClient();
    const value = await client.rPop(key);

    return {
      success: true,
      data: {
        key,
        value: value !== null ? this.parseValue(value as string) : null,
        existed: value !== null,
      },
    };
  }

  /**
   * Get range of list elements
   */
  private async lrange(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const start = this.config.start || 0;
    const stop = this.config.stop || -1;

    if (!key) {
      throw new Error('key is required for lrange operation');
    }

    const client = await this.getClient();
    const values = await client.lRange(key, start, stop);

    return {
      success: true,
      data: {
        key,
        start,
        stop,
        values: values.map(v => this.parseValue(v as string)),
        count: values.length,
      },
    };
  }

  /**
   * Get list length
   */
  private async llen(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for llen operation');
    }

    const client = await this.getClient();
    const length = await client.lLen(key);

    return {
      success: true,
      data: {
        key,
        length,
      },
    };
  }

  /**
   * Get list element by index
   */
  private async lindex(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const index = this.config.index || 0;

    if (!key) {
      throw new Error('key is required for lindex operation');
    }

    const client = await this.getClient();
    const value = await client.lIndex(key, index);

    return {
      success: true,
      data: {
        key,
        index,
        value: value !== null ? this.parseValue(value as string) : null,
        exists: value !== null,
      },
    };
  }

  /**
   * Add to sorted set
   */
  private async zadd(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const members = this.config.members; // Array of { score, value }
    const score = this.config.score;
    const value = this.config.value;

    if (!key) {
      throw new Error('key is required for zadd operation');
    }
    if (!members && (score === undefined || !value)) {
      throw new Error('members array or (score + value) is required for zadd operation');
    }

    const client = await this.getClient();
    const membersToAdd: Array<{ score: number; value: string }> = [];

    if (members && Array.isArray(members)) {
      for (const m of members) {
        membersToAdd.push({ score: m.score, value: String(m.value) });
      }
    } else {
      membersToAdd.push({ score, value: String(value) });
    }

    const added = await client.zAdd(key, membersToAdd);

    return {
      success: true,
      data: {
        key,
        members: membersToAdd,
        added: typeof added === 'number' ? added : membersToAdd.length,
      },
    };
  }

  /**
   * Remove from sorted set
   */
  private async zrem(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const members = this.config.members;
    const member = this.config.member;

    if (!key || (!members && !member)) {
      throw new Error('key and members array (or member) are required for zrem operation');
    }

    const client = await this.getClient();
    const membersToRemove = Array.isArray(members) ? members.map(String) : [String(member)];
    const removed = await client.zRem(key, membersToSendable(membersToRemove));

    return {
      success: true,
      data: {
        key,
        members: membersToRemove,
        removed,
      },
    };
  }

  /**
   * Get range from sorted set
   */
  private async zrange(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const start = this.config.start || 0;
    const stop = this.config.stop || -1;
    const withScores = this.config.withScores || false;

    if (!key) {
      throw new Error('key is required for zrange operation');
    }

    const client = await this.getClient();
    const result = await client.zRangeWithScores(key, start, stop);

    if (withScores) {
      // zRangeWithScores returns array of {value, score} objects
      const members: Array<{ value: any; score: number }> = [];
      for (const item of result) {
        members.push({ value: this.parseValue(item.value as string), score: item.score });
      }

      return {
        success: true,
        data: {
          key,
          start,
          stop,
          members,
          count: members.length,
        },
      };
    }

    // Without scores, use regular zRange
    const values = await client.zRange(key, start, stop);
    return {
      success: true,
      data: {
        key,
        start,
        stop,
        members: values.map(v => this.parseValue(v as string)),
        count: values.length,
      },
    };
  }

  /**
   * Get sorted set cardinality
   */
  private async zcard(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);

    if (!key) {
      throw new Error('key is required for zcard operation');
    }

    const client = await this.getClient();
    const count = await client.zCard(key);

    return {
      success: true,
      data: {
        key,
        count,
      },
    };
  }

  /**
   * Get score of member in sorted set
   */
  private async zscore(context: ExecutionContext): Promise<NodeExecutionResult> {
    const key = this.resolveValue(this.config.key, context);
    const member = this.config.member;

    if (!key || !member) {
      throw new Error('key and member are required for zscore operation');
    }

    const client = await this.getClient();
    const score = await client.zScore(key, String(member));

    return {
      success: true,
      data: {
        key,
        member,
        score: score !== null ? score : null,
        exists: score !== null,
      },
    };
  }

  /**
   * Parse value from Redis string
   */
  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Stringify value for Redis storage
   */
  private stringifyValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
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
    if (error.message?.includes('ECONNREFUSED')) {
      return 'Connection refused. Check the Redis host and port.';
    }
    if (error.message?.includes('NOAUTH')) {
      return 'Authentication required. Check your password.';
    }
    if (error.message?.includes('WRONGPASS')) {
      return 'Invalid password.';
    }
    if (error.message?.includes('SELECT')) {
      return 'Invalid database index.';
    }
    if (error.message?.includes('OOM')) {
      return 'Redis out of memory.';
    }
    return `Redis error: ${error.message || 'Unknown error'}`;
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  getType(): string {
    return 'redis';
  }

  getIcon(): string {
    return 'Database';
  }

  /**
   * Test Redis connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      const client = await this.getClient();
      await client.ping();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Helper to convert values to strings for Redis
 */
function membersToSendable(values: any[]): string[] {
  return values.map(v => {
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    return JSON.stringify(v);
  });
}
