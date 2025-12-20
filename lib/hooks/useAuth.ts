/**
 * Authentication Hook
 * Custom React hook for managing authentication state
 */

import { useState, useEffect } from "react";
import { authService } from "@/lib/api/auth.service";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/lib/types/auth";

/**
 * Authentication state
 */
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * useAuth Hook
 * Provides authentication state and methods
 * 
 * @returns Authentication state and methods
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Check authentication status
   */
  const checkAuth = async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authService.getCurrentUser();
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      // User is not authenticated
      if (error instanceof ApiError && error.statusCode === 401) {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        return false;
      }

      // Other errors
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return false;
    }
  };

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  };

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return {
    ...state,
    checkAuth,
    clearAuth,
  };
}

