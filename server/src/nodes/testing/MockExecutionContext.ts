/**
 * MockExecutionContext - Générateur de contexte d'exécution pour tests
 *
 * Facilite la création de contextes réalistes pour tester les nœuds
 */

import { ExecutionContext } from '../../types';

export interface ContextOptions {
  jsonData?: any;
  workflowId?: string;
  workflowName?: string;
  nodeId?: string;
  nodeName?: string;
  nodeType?: string;
  additionalData?: Record<string, any>;
}

/**
 * Créer un contexte d'exécution mock de base
 */
export function createMockExecutionContext(options: ContextOptions = {}): ExecutionContext {
  return {
    $json: options.jsonData || {},
    $workflow: {
      id: options.workflowId || 'test-workflow-id',
      name: options.workflowName || 'Test Workflow',
      active: true,
      ...options.additionalData,
    },
    $node: {
      id: options.nodeId || 'test-node-id',
      name: options.nodeName || 'Test Node',
      type: options.nodeType || 'test',
    },
  };
}

/**
 * Créer un contexte avec des données JSON spécifiques
 */
export function createJsonDataContext(jsonData: any): ExecutionContext {
  return createMockExecutionContext({ jsonData });
}

/**
 * Créer un contexte pour un nœud webhook
 */
export function createWebhookContext(
  webhookData: Record<string, any>
): ExecutionContext {
  return createMockExecutionContext({
    jsonData: {
      body: webhookData,
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Test-Agent',
      },
      query: {},
      method: 'POST',
    },
    nodeType: 'webhook',
  });
}

/**
 * Créer un contexte pour un nœud HTTP
 */
export function createHttpContext(response: any): ExecutionContext {
  return createMockExecutionContext({
    jsonData: response,
    nodeType: 'httpRequest',
  });
}

/**
 * Créer un contexte avec données de workflow précédent
 */
export function createPreviousNodeContext(
  previousNodeType: string,
  previousNodeData: any
): ExecutionContext {
  return createMockExecutionContext({
    jsonData: {
      _previousNodeType: previousNodeType,
      ...previousNodeData,
    },
  });
}

/**
 * Builders pour créer des contextes complexes
 */
export class ContextBuilder {
  private options: ContextOptions = {};

  withJsonData(data: any): this {
    this.options.jsonData = data;
    return this;
  }

  withWorkflow(id: string, name: string): this {
    this.options.workflowId = id;
    this.options.workflowName = name;
    return this;
  }

  withNode(id: string, name: string, type: string): this {
    this.options.nodeId = id;
    this.options.nodeName = name;
    this.options.nodeType = type;
    return this;
  }

  withAdditionalData(data: Record<string, any>): this {
    this.options.additionalData = data;
    return this;
  }

  build(): ExecutionContext {
    return createMockExecutionContext(this.options);
  }
}

/**
 * Contextes prédéfinis pour des scénarios courants
 */
export const CommonContexts = {
  // Contexte vide
  empty: createMockExecutionContext(),

  // Contexte avec données utilisateur
  userData: createJsonDataContext({
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
  }),

  // Contexte avec tableau de données
  arrayData: createJsonDataContext([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ]),

  // Contexte pour transformation de données
  transformData: createJsonDataContext({
    input: 'hello world',
    count: 42,
    flag: true,
    nested: {
      value: 'test',
    },
  }),

  // Contexte pour filtrage
  filterData: createJsonDataContext([
    { status: 'active', value: 100 },
    { status: 'inactive', value: 200 },
    { status: 'active', value: 300 },
  ]),
};

/**
 * Factory pour créer des contextes de test API
 */
export class APIContextFactory {
  static createSuccessResponse(data: any): ExecutionContext {
    return createJsonDataContext({
      success: true,
      data,
      status: 200,
    });
  }

  static createErrorResponse(message: string, code: number = 500): ExecutionContext {
    return createJsonDataContext({
      success: false,
      error: message,
      status: code,
    });
  }

  static createPaginatedResponse(
    items: any[],
    page: number,
    pageSize: number,
    total: number
  ): ExecutionContext {
    return createJsonDataContext({
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  }
}
