/**
 * Authentication Service
 * Handles authentication-related API calls
 */

import { apiClient, ApiError } from "@/lib/api/client";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
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
   * Login user
   * @param data - Login credentials (email, password)
   * @returns Login response with user data
   * @throws {ApiError} If login fails
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>(
        "/auth/login",
        data
      );
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Login failed: Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * Logout user
   * Clears the authentication cookie on the server
   * @returns Logout response
   * @throws {ApiError} If logout fails
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post<LogoutResponse>("/auth/logout");
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        "Logout failed: Unknown error occurred",
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

