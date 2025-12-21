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

