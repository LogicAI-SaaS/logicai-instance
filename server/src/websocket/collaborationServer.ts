/**
 * Collaboration Server - WebSocket pour la collaboration en temps réel
 * Features:
 * - Gestion des connexions multiples
 * - Synchronisation des curseurs (comme Figma)
 * - Synchronisation des nœuds et arêtes
 * - Indicateurs de présence
 * - Broadcast des changements
 */

import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';

// Types pour les messages WebSocket
export interface CursorPosition {
  x: number;
  y: number;
  color: string;
  memberId: string;
  memberName: string;
}

export interface NodeUpdate {
  type: 'add' | 'update' | 'remove';
  node: any;
  memberId: string;
}

export interface EdgeUpdate {
  type: 'add' | 'update' | 'remove';
  edge: any;
  memberId: string;
}

export interface WorkflowUpdate {
  type: 'workflow_update';
  workflowId: string;
  nodes: any[];
  edges: any[];
  memberId: string;
}

export interface PresenceUpdate {
  type: 'presence_update';
  instanceId: string;
  memberId: string;
  memberName: string;
  isOnline: boolean;
  cursor?: CursorPosition;
}

export type WSMessage =
  | CursorPosition
  | NodeUpdate
  | EdgeUpdate
  | WorkflowUpdate
  | PresenceUpdate
  | { type: 'ping' }
  | { type: 'pong' };

// Client connecté
interface ConnectedClient {
  id: string;
  ws: any;
  instanceId: string;
  memberId: string;
  memberName: string;
  color: string;
  cursor?: { x: number; y: number };
  isAlive: boolean;
}

class CollaborationServer {
  wss: Server;
  private clients: Map<string, ConnectedClient> = new Map();

  constructor(port: number) {
    // Note: port is ignored when wss is passed externally
    // We use a dummy Server that will be replaced
    this.wss = new Server({ noServer: true });
  }

  public attachServer(wss: Server) {
    this.wss = wss;
    this.wss.on('connection', this.handleConnection.bind(this));
    this.wss.on('error', this.handleError.bind(this));

    // Heartbeat pour vérifier les connexions actives
    setInterval(() => this.checkHeartbeat(), 30000); // 30s
  }

  private handleConnection(ws: any, req: any) {
    const clientId = uuidv4();

    // Extraire instanceId et memberId depuis l'URL query
    const url = new URL(req.url, `http://${req.headers.host}`);
    const instanceId = url.searchParams.get('instanceId');
    const memberId = url.searchParams.get('memberId');
    const memberName = url.searchParams.get('memberName') || 'Anonymous';

    if (!instanceId || !memberId) {
      ws.close(1008, 'Missing instanceId or memberId');
      return;
    }

    // Générer une couleur unique pour le curseur
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA15E', '#9B59B6', '#E07A5F',
    ];
    const color = colors[clients.size % colors.length];

    const client: ConnectedClient = {
      id: clientId,
      ws,
      instanceId,
      memberId,
      memberName,
      color,
      isAlive: true,
    };

    this.clients.set(clientId, client);

    // Envoyer la configuration initiale
    ws.send(
      JSON.stringify({
        type: 'connected',
        clientId,
        color,
      })
    );

    // Annoncer la présence du nouveau membre
    this.broadcastToInstance(instanceId, {
      type: 'presence_update',
      instanceId,
      memberId,
      memberName,
      isOnline: true,
    }, clientId);

    // Envoyer la liste des membres connectés
    const connectedMembers = this.getConnectedMembers(instanceId);
    ws.send(
      JSON.stringify({
        type: 'members_list',
        members: connectedMembers.map((c) => ({
          memberId: c.memberId,
          memberName: c.memberName,
          color: c.color,
          cursor: c.cursor,
        })),
      })
    );

    ws.on('message', (data: string) => this.handleMessage(clientId, data));
    ws.on('close', () => this.handleDisconnection(clientId));
    ws.on('error', (error) => console.error('WebSocket error:', error));
    ws.on('pong', () => { client.isAlive = true; });

    console.log(`✅ Client connected: ${memberName} (${clientId})`);
  }

  private handleMessage(clientId: string, data: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const message: WSMessage = JSON.parse(data);

      // Gérer les pings/pongs
      if (message.type === 'ping') {
        client.ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      // Mise à jour du curseur
      if (message.type === 'cursor_move') {
        const cursor: CursorPosition = message as any;
        client.cursor = { x: cursor.x, y: cursor.y };
        this.broadcastToInstance(client.instanceId, {
          type: 'presence_update',
          instanceId: client.instanceId,
          memberId: client.memberId,
          memberName: client.memberName,
          isOnline: true,
          cursor: { x: cursor.x, y: cursor.y, color: client.color },
        }, clientId);
        return;
      }

      // Mise à jour des nœuds
      if (message.type === 'node_add' || message.type === 'node_update' || message.type === 'node_remove') {
        const nodeUpdate: NodeUpdate = message as any;
        this.broadcastToInstance(client.instanceId, {
          ...nodeUpdate,
          memberId: client.memberId,
        }, clientId);
        return;
      }

      // Mise à jour des arêtes
      if (message.type === 'edge_add' || message.type === 'edge_update' || message.type === 'edge_remove') {
        const edgeUpdate: EdgeUpdate = message as any;
        this.broadcastToInstance(client.instanceId, {
          ...edgeUpdate,
          memberId: client.memberId,
        }, clientId);
        return;
      }

      // Mise à jour du workflow complet
      if (message.type === 'workflow_update') {
        const workflowUpdate: WorkflowUpdate = message as any;
        this.broadcastToInstance(client.instanceId, workflowUpdate, clientId);
        return;
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Annoncer la déconnexion
    this.broadcastToInstance(client.instanceId, {
      type: 'presence_update',
      instanceId: client.instanceId,
      memberId: client.memberId,
      memberName: client.memberName,
      isOnline: false,
    });

    this.clients.delete(clientId);
    console.log(`❌ Client disconnected: ${client.memberName} (${clientId})`);
  }

  private handleError(error: Error) {
    console.error('WebSocket server error:', error);
  }

  private broadcastToInstance(instanceId: string, message: any, excludeClientId?: string) {
    const messageStr = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.instanceId === instanceId && client.id !== excludeClientId) {
        if (client.ws.readyState === 1) { // OPEN
          client.ws.send(messageStr);
        }
      }
    });
  }

  private getConnectedMembers(instanceId: string) {
    return Array.from(this.clients.values()).filter((c) => c.instanceId === instanceId);
  }

  private checkHeartbeat() {
    const now = Date.now();
    this.clients.forEach((client, clientId) => {
      if (!client.isAlive) {
        client.ws.close(1000, 'No heartbeat received');
        this.clients.delete(clientId);
        console.log(`💔 Client timeout: ${client.memberName} (${clientId})`);
      } else {
        client.isAlive = false;
        // Envoyer un ping
        if (client.ws.readyState === 1) {
          client.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }
    });
  }

  public getStats() {
    const stats = {
      totalClients: this.clients.size,
      instances: {} as Record<string, number>,
    };

    this.clients.forEach((client) => {
      stats.instances[client.instanceId] = (stats.instances[client.instanceId] || 0) + 1;
    });

    return stats;
  }
}

// Singleton instance
let collaborationServer: CollaborationServer | null = null;
let wssInstance: Server | null = null;

export function initCollaborationServer(server?: any) {
  if (!collaborationServer) {
    collaborationServer = new CollaborationServer(0); // Port is ignored

    if (server) {
      // Create WebSocket server with noServer mode
      wssInstance = new Server({ noServer: true });
      collaborationServer.attachServer(wssInstance);

      // Attach to existing HTTP server
      server.on('upgrade', (request: any, socket: any, head: any) => {
        if (request.url === '/ws') {
          wssInstance!.handleUpgrade(request, socket, head);
        }
      });

      console.log(`🔗 Collaboration server attached to HTTP server`);
    }
  }
  return collaborationServer;
}

export default CollaborationServer;
