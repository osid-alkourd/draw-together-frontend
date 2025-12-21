/**
 * Whiteboard Service
 * Handles whiteboard-related API calls
 */

import { apiClient, ApiError } from "@/lib/api/client";
import type {
  CreateWhiteboardRequest,
  CreateWhiteboardResponse,
  GetMyWhiteboardsResponse,
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
}

// Export a singleton instance
export const whiteboardService = new WhiteboardService();

