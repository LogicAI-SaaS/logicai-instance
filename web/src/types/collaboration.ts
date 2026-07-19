/**
 * Types pour la collaboration en temps réel
 */

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
  | { type: 'pong' }
  | { type: 'connected'; clientId: string; color: string }
  | { type: 'members_list'; members: ConnectedMember[] };

export interface ConnectedMember {
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
