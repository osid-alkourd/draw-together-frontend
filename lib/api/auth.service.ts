/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient, ApiError } from "@/lib/api/client";
import type {
  RegisterRequest,
  RegisterResponse,
  GetCurrentUserResponse,
  ApiErrorResponse,
} from "@/lib/types/auth";

/**
 * Authentication Service
 * Provides methods for user authentication operations
 */
export class AuthService {
  /**
   * Register a new user
   * @param data - Registration data (email, password, fullName)
   * @returns Registration response with user data
   * @throws {ApiError} If registration fails
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>(
        "/auth/register",
        data
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        // Re-throw with more context if needed
        throw error;
      }
      throw new ApiError(
        "Registration failed: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Get current authenticated user
   * @returns Current user information
   * @throws {ApiError} If user is not authenticated
   */
  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    try {
      const response = await apiClient.get<GetCurrentUserResponse>("/auth/me");
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Failed to get current user: Unknown error occurred",
        0,
        error
      );
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();

