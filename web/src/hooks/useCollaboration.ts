/**
 * useCollaboration - Hook pour la collaboration en temps réel
 * Features:
 * - Connexion WebSocket automatique
 * - Gestion des curseurs distants
 * - Synchronisation des changements de nœuds/arêtes
 * - Indicateurs de présence
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { CursorPosition, NodeUpdate, EdgeUpdate, PresenceUpdate } from '../types/collaboration';

interface ConnectedMember {
  memberId: string;
  memberName: string;
  color: string;
  cursor?: { x: number; y: number };
  isOnline?: boolean;
}

export interface RemoteCursor extends CursorPosition {
  memberId: string;
  memberName: string;
  timestamp: number;
}

interface UseCollaborationOptions {
  instanceId: string;
  memberId: string;
  memberName: string;
  workflowId?: string;
  onNodeAdd?: (node: any, memberId: string) => void;
  onNodeUpdate?: (node: any, memberId: string) => void;
  onNodeRemove?: (nodeId: string, memberId: string) => void;
  onEdgeAdd?: (edge: any, memberId: string) => void;
  onEdgeUpdate?: (edge: any, memberId: string) => void;
  onEdgeRemove?: (edgeId: string, memberId: string) => void;
  onWorkflowUpdate?: (nodes: any[], edges: any[], memberId: string) => void;
}

export function useCollaboration({
  instanceId,
  memberId,
  memberName,
  workflowId,
  onNodeAdd,
  onNodeUpdate,
  onNodeRemove,
  onEdgeAdd,
  onEdgeUpdate,
  onEdgeRemove,
  onWorkflowUpdate,
}: UseCollaborationOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [members, setMembers] = useState<Map<string, ConnectedMember>>(new Map());
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map());
  const [myColor, setMyColor] = useState<string>('#4ECDC4');

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Connecter au serveur WebSocket
  const connect = useCallback(() => {
    if (!instanceId || !memberId) return;

    // Déjà connecté
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      // En dev, utiliser le port de l'instance
      const wsUrl = import.meta.env.PROD
        ? `${protocol}//${host}/ws?instanceId=${instanceId}&memberId=${memberId}&memberName=${encodeURIComponent(memberName)}`
        : `ws://localhost:3001/ws?instanceId=${instanceId}&memberId=${memberId}&memberName=${encodeURIComponent(memberName)}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 WebSocket connected');
        setIsConnected(true);

        // Démarrer le heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 15000); // 15s
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Message de connexion initiale
          if (message.type === 'connected') {
            setMyColor(message.color);
            return;
          }

          // Liste des membres connectés
          if (message.type === 'members_list') {
            const membersMap = new Map<string, ConnectedMember>();
            message.members.forEach((member: ConnectedMember) => {
              membersMap.set(member.memberId, member);
            });
            setMembers(membersMap);
            return;
          }

          // Mise à jour de présence
          if (message.type === 'presence_update') {
            const presence = message as PresenceUpdate;
            setMembers((prev) => {
              const newMap = new Map(prev);
              if (presence.isOnline) {
                newMap.set(presence.memberId, {
                  memberId: presence.memberId,
                  memberName: presence.memberName,
                  color: presence.cursor?.color || '',
                  isOnline: true,
                });
              } else {
                newMap.delete(presence.memberId);
              }
              return newMap;
            });

            // Mettre à jour le curseur
            if (presence.cursor) {
              const cursor: RemoteCursor = {
                ...presence.cursor,
                memberId: presence.memberId,
                memberName: presence.memberName,
                timestamp: Date.now(),
              };
              setRemoteCursors((prev) => {
                const newMap = new Map(prev);
                newMap.set(presence.memberId, cursor);
                return newMap;
              });

              // Supprimer le curseur après 2s d'inactivité
              if (cursorTimeoutRef.current.has(presence.memberId)) {
                clearTimeout(cursorTimeoutRef.current.get(presence.memberId));
              }
              const timeout = setTimeout(() => {
                setRemoteCursors((prev) => {
                  const newMap = new Map(prev);
                  newMap.delete(presence.memberId);
                  return newMap;
                });
              }, 2000);
              cursorTimeoutRef.current.set(presence.memberId, timeout);
            }
            return;
          }

          // Mise à jour des nœuds
          if (message.type === 'node_add') {
            onNodeAdd?.(message.node, message.memberId);
            return;
          }
          if (message.type === 'node_update') {
            onNodeUpdate?.(message.node, message.memberId);
            return;
          }
          if (message.type === 'node_remove') {
            onNodeRemove?.(message.node.id, message.memberId);
            return;
          }

          // Mise à jour des arêtes
          if (message.type === 'edge_add') {
            onEdgeAdd?.(message.edge, message.memberId);
            return;
          }
          if (message.type === 'edge_update') {
            onEdgeUpdate?.(message.edge, message.memberId);
            return;
          }
          if (message.type === 'edge_remove') {
            onEdgeRemove?.(message.edge.id, message.memberId);
            return;
          }

          // Mise à jour du workflow complet
          if (message.type === 'workflow_update') {
            onWorkflowUpdate?.(message.nodes, message.edges, message.memberId);
            return;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);

        // Nettoyer
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Tentative de reconnexion après 3s
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [instanceId, memberId, memberName, onNodeAdd, onNodeUpdate, onNodeRemove, onEdgeAdd, onEdgeUpdate, onEdgeRemove, onWorkflowUpdate]);

  // Envoyer la position du curseur
  const sendCursorPosition = useCallback((x: number, y: number) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'cursor_move',
        x,
        y,
      }));
    }
  }, [isConnected]);

  // Envoyer un ajout de nœud
  const broadcastNodeAdd = useCallback((node: any) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'node_add',
        node,
      }));
    }
  }, [isConnected]);

  // Envoyer une mise à jour de nœud
  const broadcastNodeUpdate = useCallback((node: any) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'node_update',
        node,
      }));
    }
  }, [isConnected]);

  // Envoyer une suppression de nœud
  const broadcastNodeRemove = useCallback((nodeId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'node_remove',
        node: { id: nodeId },
      }));
    }
  }, [isConnected]);

  // Envoyer un ajout d'arête
  const broadcastEdgeAdd = useCallback((edge: any) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'edge_add',
        edge,
      }));
    }
  }, [isConnected]);

  // Envoyer une mise à jour d'arête
  const broadcastEdgeUpdate = useCallback((edge: any) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'edge_update',
        edge,
      }));
    }
  }, [isConnected]);

  // Envoyer une suppression d'arête
  const broadcastEdgeRemove = useCallback((edgeId: string) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'edge_remove',
        edge: { id: edgeId },
      }));
    }
  }, [isConnected]);

  // Envoyer une mise à jour complète du workflow
  const broadcastWorkflowUpdate = useCallback((nodes: any[], edges: any[]) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN && isConnected) {
      ws.send(JSON.stringify({
        type: 'workflow_update',
        workflowId,
        nodes,
        edges,
      }));
    }
  }, [isConnected, workflowId]);

  // Connecter automatiquement quand les dépendances changent
  useEffect(() => {
    connect();

    return () => {
      // Cleanup
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      // Nettoyer les curseurs timeouts
      cursorTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [connect]);

  return {
    isConnected,
    members: Array.from(members.values()),
    remoteCursors: Array.from(remoteCursors.values()),
    myColor,
    sendCursorPosition,
    broadcastNodeAdd,
    broadcastNodeUpdate,
    broadcastNodeRemove,
    broadcastEdgeAdd,
    broadcastEdgeUpdate,
    broadcastEdgeRemove,
    broadcastWorkflowUpdate,
  };
}
