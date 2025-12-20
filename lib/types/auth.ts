/**
 * Authentication Types
 * Type definitions for authentication-related data structures
 */

/**
 * Registration request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

/**
 * User data returned from API
 */
export interface User {
  id: string;
  email: string;
  fullName: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Registration response from API
 */
export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

/**
 * Get current user response
 */
export interface GetCurrentUserResponse {
  success: boolean;
  message: string;
  user: User;
}

