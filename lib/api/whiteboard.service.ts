/**
 * Whiteboard Service
 * Handles whiteboard-related API calls
 */

import { apiClient, ApiError } from "@/lib/api/client";
import type {
  CreateWhiteboardRequest,
  CreateWhiteboardResponse,
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
}

// Export a singleton instance
export const whiteboardService = new WhiteboardService();

