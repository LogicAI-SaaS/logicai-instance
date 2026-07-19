import axios from 'axios';
import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Figma Node - Design Operations
 * n8n-compatible: Extract components, export assets, auto-comment on frames, read style variables
 * WARNING: Large design files can generate extremely heavy JSON payloads.
 * May saturate memory of the Workflow Runner.
 */
export class FigmaNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const { action, resource, parameters } = this.config;
      const { accessToken, fileKey, nodeId } = parameters;

      const headers = {
        'X-Figma-Token': accessToken,
      };

      let result: any;

      switch (resource) {
        case 'file':
          result = await this.handleFile(action, fileKey, headers);
          break;
        case 'components':
          result = await this.handleComponents(action, fileKey, nodeId, headers);
          break;
        case 'assets':
          result = await this.handleAssets(action, fileKey, nodeId, parameters, headers);
          break;
        case 'comments':
          result = await this.handleComments(action, fileKey, nodeId, parameters, headers);
          break;
        case 'variables':
          result = await this.handleVariables(action, fileKey, headers);
          break;
        default:
          throw new Error(`Unknown Figma resource: ${resource}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Figma operation failed',
      };
    }
  }

  private async handleFile(action: string, fileKey: string, headers: any): Promise<any> {
    const baseUrl = 'https://api.figma.com/v1';

    switch (action) {
      case 'get':
        const getResponse = await axios.get(`${baseUrl}/files/${fileKey}`, { headers });
        const data = getResponse.data;

        // WARNING: Check file size to prevent memory issues
        const fileSize = JSON.stringify(data).length;
        const fileSizeMB = fileSize / (1024 * 1024);

        return {
          file: data,
          fileSizeBytes: fileSize,
          fileSizeMB: fileSizeMB.toFixed(2),
          warning: fileSizeMB > 10 ? 'Large file detected - may impact performance' : undefined,
        };

      case 'getNodes':
        const nodesResponse = await axios.get(`${baseUrl}/files/${fileKey}/nodes`, {
          headers,
          params: { ids: this.config.parameters.nodeIds },
        });
        return nodesResponse.data;

      default:
        throw new Error(`Unknown File action: ${action}`);
    }
  }

  private async handleComponents(action: string, fileKey: string, nodeId: string, headers: any): Promise<any> {
    const baseUrl = 'https://api.figma.com/v1';

    switch (action) {
      case 'extract':
        const extractResponse = await axios.get(`${baseUrl}/files/${fileKey}/nodes`, {
          headers,
          params: { ids: nodeId || '' },
        });
        const node = extractResponse.data.nodes[nodeId];

        return {
          component: {
            id: node.id,
            name: node.document.name,
            type: node.document.type,
            properties: {
              width: node.document.absoluteBoundingBox?.width,
              height: node.document.absoluteBoundingBox?.height,
              fills: node.document.fills,
              strokes: node.document.strokes,
              effects: node.document.effects,
            },
          },
        };

      case 'list':
        const fileResponse = await axios.get(`${baseUrl}/files/${fileKey}`, { headers });
        const components = this.findComponents(fileResponse.data.document);

        return {
          components,
          count: components.length,
        };

      case 'getComponentSets':
        const compSetsResponse = await axios.get(`${baseUrl}/files/${fileKey}/component_sets`, { headers });
        return compSetsResponse.data;

      default:
        throw new Error(`Unknown Components action: ${action}`);
    }
  }

  private async handleAssets(action: string, fileKey: string, nodeId: string, params: any, headers: any): Promise<any> {
    const baseUrl = 'https://api.figma.com/v1';

    switch (action) {
      case 'export':
        const exportResponse = await axios.get(
          `${baseUrl}/images/${fileKey}`,
          {
            headers,
            params: {
              ids: nodeId,
              format: params.format || 'PNG',
              scale: params.scale || 1,
            },
          }
        );

        return {
          imageUrl: exportResponse.data.images[nodeId],
          format: params.format || 'PNG',
          scale: params.scale || 1,
        };

      case 'exportMultiple':
        const multiExportResponse = await axios.get(
          `${baseUrl}/images/${fileKey}`,
          {
            headers,
            params: {
              ids: params.nodeIds.join(','),
              format: params.format || 'PNG',
              scale: params.scale || 1,
            },
          }
        );

        return {
          images: multiExportResponse.data.images,
          count: Object.keys(multiExportResponse.data.images).length,
        };

      case 'getExportSettings':
        const settingsResponse = await axios.get(`${baseUrl}/files/${fileKey}/nodes`, {
          headers,
          params: { ids: nodeId },
        });

        const node = settingsResponse.data.nodes[nodeId];
        return {
          exportSettings: node.document.exportSettings,
        };

      default:
        throw new Error(`Unknown Assets action: ${action}`);
    }
  }

  private async handleComments(action: string, fileKey: string, nodeId: string, params: any, headers: any): Promise<any> {
    const baseUrl = 'https://api.figma.com/v1';

    switch (action) {
      case 'post':
        const postResponse = await axios.post(
          `${baseUrl}/files/${fileKey}/comments`,
          {
            message: params.message,
            client_meta: {
              node_id: nodeId,
              node_offset: params.offset || { x: 0, y: 0 },
            },
          },
          { headers }
        );

        return postResponse.data;

      case 'list':
        const listResponse = await axios.get(`${baseUrl}/files/${fileKey}/comments`, { headers });
        return {
          comments: listResponse.data.comments,
          count: listResponse.data.comments.length,
        };

      case 'delete':
        const deleteResponse = await axios.delete(
          `${baseUrl}/files/${fileKey}/comments/${params.commentId}`,
          { headers }
        );

        return { deleted: true };

      default:
        throw new Error(`Unknown Comments action: ${action}`);
    }
  }

  private async handleVariables(action: string, fileKey: string, headers: any): Promise<any> {
    const baseUrl = 'https://api.figma.com/v1';

    switch (action) {
      case 'getLocalVariables':
        const variablesResponse = await axios.get(`${baseUrl}/files/${fileKey}/variables/local`, { headers });

        return {
          variables: variablesResponse.data.meta.variables,
          count: variablesResponse.data.meta.variables.length,
        };

      case 'getVariableModes':
        const modesResponse = await axios.get(`${baseUrl}/files/${fileKey}/variables/modes`, { headers });

        return {
          modes: modesResponse.data.meta.variableModes,
        };

      case 'getVariableCollections':
        const collectionsResponse = await axios.get(`${baseUrl}/files/${fileKey}/libraries`, { headers });

        return {
          collections: collectionsResponse.data.meta.variableCollections,
        };

      default:
        throw new Error(`Unknown Variables action: ${action}`);
    }
  }

  private findComponents(node: any, components: any[] = []): any[] {
    if (node.type === 'COMPONENT' || node.type === 'COMPONENT_SET') {
      components.push({
        id: node.id,
        name: node.name,
        type: node.type,
      });
    }

    if (node.children) {
      for (const child of node.children) {
        this.findComponents(child, components);
      }
    }

    return components;
  }

  getType(): string {
    return 'figma';
  }

  getIcon(): string {
    return 'PenTool';
  }
}
