import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * LogicAI Trigger Node - Déclenche un workflow sur une autre instance LogicAI
 * 
 * Ce nœud permet de:
 * - Se connecter à une autre instance LogicAI via son API
 * - Déclencher un workflow sur cette instance
 * - Passer des données au workflow cible
 * - Récupérer le résultat de l'exécution
 * 
 * Configuration requise:
 * - apiUrl: URL de l'API LogicAI (ex: http://localhost:3000)
 * - token: Token JWT d'authentification
 * - instanceUuid: UUID de l'instance cible
 * - workflowId: ID du workflow à déclencher (optionnel si webhookPath est spécifié)
 * - webhookPath: Chemin du webhook (ex: "contact-form")
 * - method: Méthode HTTP (GET, POST, PUT, PATCH, DELETE) - défaut: POST
 * - data: Données à envoyer au workflow
 * - headers: En-têtes HTTP personnalisés
 */
export class LogicAITriggerNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Récupérer la configuration
      const apiUrl = this.config.apiUrl || process.env.LOGICAI_API_URL || 'http://localhost:3000';
      const token = this.config.token || process.env.LOGICAI_TOKEN;
      const instanceUuid = this.config.instanceUuid || context.$json?.instanceUuid;
      const workflowId = this.config.workflowId;
      const webhookPath = this.config.webhookPath;
      const method = (this.config.method || 'POST').toUpperCase();
      const customHeaders = this.config.headers || {};
      
      // Données à envoyer (fusionner config et context)
      const data = {
        ...(this.config.data || {}),
        ...(context.$json || {}),
      };

      // Validation
      if (!token) {
        throw new Error('Token d\'authentification manquant. Configurez "token" ou la variable d\'environnement LOGICAI_TOKEN');
      }

      if (!instanceUuid) {
        throw new Error('UUID de l\'instance manquant. Configurez "instanceUuid" ou passez-le dans les données');
      }

      if (!workflowId && !webhookPath) {
        throw new Error('Vous devez spécifier soit "workflowId" soit "webhookPath"');
      }

      // Importer le SDK dynamiquement pour éviter les problèmes de dépendances
      let LogicAIClient;
      try {
        // Essayer d'importer depuis le package installé
        const sdk = await import('logicai-sdk');
        LogicAIClient = sdk.LogicAIClient;
      } catch (error) {
        // Si le SDK n'est pas installé, utiliser une implémentation directe avec axios
        return await this.executeWithAxios(apiUrl, token, instanceUuid, workflowId, webhookPath, method, data, customHeaders, context);
      }

      // Créer le client LogicAI
      const client = new LogicAIClient({
        apiUrl,
        token,
        timeout: this.config.timeout || 30000,
      });

      let result;

      // Déclencher le workflow
      if (webhookPath) {
        // Utiliser la méthode webhook
        result = await client.workflows.webhook({
          instanceUuid,
          webhookPath,
          method: method as any,
          data,
          headers: customHeaders,
        });
      } else {
        // Utiliser la méthode trigger avec workflowId
        result = await client.workflows.trigger({
          instanceUuid,
          workflowId,
          data,
          headers: customHeaders,
        });
      }

      return {
        success: true,
        data: {
          _logicai: {
            instanceUuid,
            workflowId: workflowId || webhookPath,
            method,
            triggeredAt: new Date().toISOString(),
          },
          ...data,
          _response: result,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Erreur lors du déclenchement du workflow LogicAI',
        _details: {
          instanceUuid: this.config.instanceUuid,
          workflowId: this.config.workflowId,
          webhookPath: this.config.webhookPath,
          errorType: error.constructor?.name,
        },
      };
    }
  }

  /**
   * Implémentation de secours utilisant axios directement
   * Utilisée si le SDK n'est pas installé
   */
  private async executeWithAxios(
    apiUrl: string,
    token: string,
    instanceUuid: string,
    workflowId: string | undefined,
    webhookPath: string | undefined,
    method: string,
    data: any,
    customHeaders: Record<string, string>,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const axios = (await import('axios')).default;

    try {
      // 1. Récupérer l'instance pour obtenir son URL
      const instanceResponse = await axios.get(
        `${apiUrl}/api/instances/${instanceUuid}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const instance = instanceResponse.data.data;

      if (!instance) {
        throw new Error(`Instance ${instanceUuid} non trouvée`);
      }

      if (instance.status !== 'running') {
        throw new Error(`Instance ${instanceUuid} n'est pas en cours d'exécution (status: ${instance.status})`);
      }

      if (!instance.url) {
        throw new Error(`L'instance ${instanceUuid} n'a pas d'URL configurée`);
      }

      // 2. Déclencher le workflow sur l'instance
      const targetPath = webhookPath ? `/webhook/${webhookPath}` : `/webhook/${workflowId}`;
      const targetUrl = `${instance.url}${targetPath}`;

      const response = await axios.request({
        method,
        url: targetUrl,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...customHeaders,
        },
        timeout: this.config.timeout || 30000,
      });

      return {
        success: true,
        data: {
          _logicai: {
            instanceUuid,
            instanceUrl: instance.url,
            workflowId: workflowId || webhookPath,
            method,
            triggeredAt: new Date().toISOString(),
          },
          ...data,
          _response: response.data,
        },
      };
    } catch (error: any) {
      // Gérer les erreurs d'authentification
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Authentification échouée. Vérifiez votre token JWT',
          _details: {
            statusCode: 401,
            message: error.response?.data?.message || error.message,
          },
        };
      }

      // Gérer les erreurs 404
      if (error.response?.status === 404) {
        return {
          success: false,
          error: `Endpoint non trouvé: ${webhookPath || workflowId}`,
          _details: {
            statusCode: 404,
            instanceUuid,
            path: webhookPath || workflowId,
          },
        };
      }

      // Erreur générique
      return {
        success: false,
        error: error.message || 'Erreur lors de la requête vers l\'instance LogicAI',
        _details: {
          statusCode: error.response?.status,
          message: error.response?.data?.message || error.message,
          instanceUuid,
        },
      };
    }
  }

  getType(): string {
    return 'logicaiTrigger';
  }

  getIcon(): string {
    return 'Workflow';
  }

  /**
   * Obtenir la description du nœud pour l'interface utilisateur
   */
  getDescription(): string {
    return 'Déclenche un workflow sur une autre instance LogicAI via son API';
  }

  /**
   * Obtenir la catégorie du nœud
   */
  getCategory(): string {
    return 'Triggers';
  }

  /**
   * Obtenir les propriétés configurables du nœud
   */
  getProperties(): any[] {
    return [
      {
        displayName: 'API URL',
        name: 'apiUrl',
        type: 'string',
        default: 'http://localhost:3000',
        placeholder: 'http://localhost:3000',
        description: 'URL de l\'API LogicAI',
        required: false,
      },
      {
        displayName: 'Token',
        name: 'token',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        placeholder: 'Votre token JWT',
        description: 'Token d\'authentification JWT (peut être défini via LOGICAI_TOKEN)',
        required: true,
      },
      {
        displayName: 'Instance UUID',
        name: 'instanceUuid',
        type: 'string',
        default: '',
        placeholder: 'abc-123-def-456',
        description: 'UUID de l\'instance LogicAI cible',
        required: true,
      },
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'options',
        options: [
          {
            name: 'Webhook',
            value: 'webhook',
            description: 'Déclencher via un chemin webhook',
          },
          {
            name: 'Workflow ID',
            value: 'workflowId',
            description: 'Déclencher via l\'ID du workflow',
          },
        ],
        default: 'webhook',
        description: 'Méthode de déclenchement',
      },
      {
        displayName: 'Webhook Path',
        name: 'webhookPath',
        type: 'string',
        default: '',
        placeholder: 'contact-form',
        description: 'Chemin du webhook (sans le /webhook/ prefix)',
        displayOptions: {
          show: {
            mode: ['webhook'],
          },
        },
      },
      {
        displayName: 'Workflow ID',
        name: 'workflowId',
        type: 'string',
        default: '',
        placeholder: 'workflow-123',
        description: 'ID du workflow à déclencher',
        displayOptions: {
          show: {
            mode: ['workflowId'],
          },
        },
      },
      {
        displayName: 'Method',
        name: 'method',
        type: 'options',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'DELETE', value: 'DELETE' },
        ],
        default: 'POST',
        description: 'Méthode HTTP',
      },
      {
        displayName: 'Data',
        name: 'data',
        type: 'json',
        default: '{}',
        description: 'Données JSON à envoyer au workflow',
      },
      {
        displayName: 'Custom Headers',
        name: 'headers',
        type: 'json',
        default: '{}',
        description: 'En-têtes HTTP personnalisés (format JSON)',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Timeout de la requête en millisecondes',
      },
    ];
  }
}
