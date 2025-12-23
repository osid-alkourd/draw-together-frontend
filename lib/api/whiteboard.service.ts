/**
 * Whiteboard Service
 * Handles whiteboard-related API calls
 */

import { apiClient, ApiError } from "@/lib/api/client";
import type {
  AddCollaboratorRequest,
  AddCollaboratorResponse,
  CreateWhiteboardRequest,
  CreateWhiteboardResponse,
  GetMyWhiteboardsResponse,
  GetWhiteboardResponse,
  RemoveCollaboratorRequest,
  RemoveCollaboratorResponse,
  SaveSnapshotRequest,
  SaveSnapshotResponse,
} from "@/lib/types/whiteboard";

/**
 * Whiteboard Service
 * Provides methods for whiteboard operations
 */
export class WhiteboardService {
  /**
   * Create a new whiteboard
   * @param data - Whiteboard creation data (title, description, boardAccess, invitedEmails)
   * @returns Created whiteboard information
   * @throws {ApiError} If creation fails
   */
  async create(data: CreateWhiteboardRequest): Promise<CreateWhiteboardResponse> {
    try {
      const response = await apiClient.post<CreateWhiteboardResponse>(
        "/whiteboards",
        data
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to create whiteboard: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Get all whiteboards owned by the current authenticated user
   * @returns List of whiteboards owned by the user
   * @throws {ApiError} If fetch fails
   */
  async getMyWhiteboards(): Promise<GetMyWhiteboardsResponse> {
    try {
      const response = await apiClient.get<GetMyWhiteboardsResponse>(
        "/whiteboards/my-whiteboards"
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to fetch whiteboards: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Get whiteboard by ID with snapshots
   * @param whiteboardId - Whiteboard ID
   * @returns Whiteboard with all snapshots and shapes
   * @throws {ApiError} If fetch fails
   */
  async getWhiteboardById(
    whiteboardId: string
  ): Promise<GetWhiteboardResponse> {
    try {
      const response = await apiClient.get<GetWhiteboardResponse>(
        `/whiteboards/${whiteboardId}`
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to fetch whiteboard: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Save or update snapshot for a whiteboard
   * @param whiteboardId - Whiteboard ID
   * @param data - Snapshot data containing all shapes and drawings
   * @returns Saved snapshot information
   * @throws {ApiError} If save fails
   */
  async saveSnapshot(
    whiteboardId: string,
    data: SaveSnapshotRequest
  ): Promise<SaveSnapshotResponse> {
    try {
      const response = await apiClient.post<SaveSnapshotResponse>(
        `/whiteboards/${whiteboardId}/snapshots`,
        data
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to save snapshot: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Add a collaborator to a whiteboard
   * @param whiteboardId - Whiteboard ID
   * @param data - Collaborator data (email)
   * @returns Added collaborator information
   * @throws {ApiError} If add fails
   */
  async addCollaborator(
    whiteboardId: string,
    data: AddCollaboratorRequest
  ): Promise<AddCollaboratorResponse> {
    try {
      const response = await apiClient.post<AddCollaboratorResponse>(
        `/whiteboards/${whiteboardId}/collaborators`,
        data
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to add collaborator: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Remove a collaborator from a whiteboard
   * @param whiteboardId - Whiteboard ID
   * @param data - Collaborator data (email)
   * @returns Removal confirmation
   * @throws {ApiError} If removal fails
   */
  async removeCollaborator(
    whiteboardId: string,
    data: RemoveCollaboratorRequest
  ): Promise<RemoveCollaboratorResponse> {
    try {
      const response = await apiClient.delete<RemoveCollaboratorResponse>(
        `/whiteboards/${whiteboardId}/collaborators`,
        data
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to remove collaborator: Unknown error occurred",
        0,
        error
      );
    }
  }
}

// Export a singleton instance
export const whiteboardService = new WhiteboardService();

