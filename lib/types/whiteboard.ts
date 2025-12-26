/**
 * Whiteboard Types
 * Type definitions for whiteboard-related data structures
 */

/**
 * Board access type enum
 */
export enum BoardAccessType {
  PRIVATE = "private",
  INVITE_SPECIFIC_USERS = "invite_specific_users",
}

/**
 * Create whiteboard request payload
 */
export interface CreateWhiteboardRequest {
  title: string;
  description?: string;
  boardAccess: BoardAccessType;
  invitedEmails?: string[];
}

/**
 * User information in whiteboard response
 */
export interface WhiteboardUser {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Collaborator information
 */
export interface WhiteboardCollaborator {
  userId: string;
  user: WhiteboardUser;
  role: string;
}

/**
 * Whiteboard data returned from API
 */
export interface Whiteboard {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  owner: WhiteboardUser;
  collaborators: WhiteboardCollaborator[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Create whiteboard response from API
 */
export interface CreateWhiteboardResponse {
  statusCode: number;
  message: string;
  data: Whiteboard;
}

/**
 * My whiteboard item (simplified for list view)
 */
export interface MyWhiteboardItem {
  id: string;
  name: string;
  updated_at: string;
}

/**
 * Get my whiteboards response from API
 */
export interface GetMyWhiteboardsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MyWhiteboardItem[];
}

/**
 * Shared whiteboard item (simplified for list view)
 */
export interface SharedWhiteboardItem {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  ownerName: string;
}

/**
 * Get shared with me whiteboards response from API
 */
export interface GetSharedWithMeResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SharedWhiteboardItem[];
}

/**
 * Whiteboard snapshot data structure
 * Contains all shapes and drawings on the whiteboard
 */
export interface WhiteboardSnapshotData {
  strokes: Array<{
    color: string;
    width: number;
    points: Array<{ x: number; y: number }>;
  }>;
  rectangles: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
  }>;
  circles: Array<{
    id: string;
    x: number;
    y: number;
    radius: number;
    color: string;
  }>;
  arrows: Array<{
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
    rotation: number;
  }>;
  lines: Array<{
    id: string;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    color: string;
    rotation: number;
  }>;
  texts: Array<{
    id: string;
    x: number;
    y: number;
    text: string;
    color: string;
    fontSize: number;
  }>;
}

/**
 * Save snapshot request payload
 */
export interface SaveSnapshotRequest {
  data: WhiteboardSnapshotData;
}

/**
 * Save snapshot response from API
 */
export interface SaveSnapshotResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    id: string;
    data: WhiteboardSnapshotData;
    createdAt: string;
    updatedAt: string;
  };
}

/**
 * Snapshot information in whiteboard response
 */
export interface WhiteboardSnapshot {
  id: string;
  data: WhiteboardSnapshotData;
  createdAt: string;
  updatedAt: string;
}

/**
 * Whiteboard with snapshots (full whiteboard data)
 */
export interface WhiteboardWithSnapshots {
  id: string;
  title: string;
  description: string | null;
  isPublic: boolean;
  owner: WhiteboardUser;
  collaborators: WhiteboardCollaborator[];
  snapshots: WhiteboardSnapshot[];
  shapes?: any[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Get whiteboard by ID response from API
 */
export interface GetWhiteboardResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: WhiteboardWithSnapshots | null;
}

/**
 * Add collaborator request payload
 */
export interface AddCollaboratorRequest {
  email: string;
}

/**
 * Add collaborator response from API
 */
export interface AddCollaboratorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    collaborator: WhiteboardCollaborator;
  };
}

/**
 * Remove collaborator request payload
 */
export interface RemoveCollaboratorRequest {
  email: string;
}

/**
 * Remove collaborator response from API
 */
export interface RemoveCollaboratorResponse {
  success: boolean;
  statusCode: number;
  message: string;
}

