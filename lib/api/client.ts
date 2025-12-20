/**
 * API Client
 * Base HTTP client for making API requests
 */

import { env } from "@/lib/config/env";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * API client configuration
 */
interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
}

/**
 * Request options
 */
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

/**
 * API Client class
 * Handles HTTP requests to the backend API
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  /**
   * Build URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Remove trailing slash from baseURL if present
    const baseURL = this.baseURL.replace(/\/$/, '');
    
    // Remove leading slash from endpoint to ensure it's appended, not replacing the baseURL path
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    
    // Construct the full URL by combining baseURL and endpoint
    const fullURL = `${baseURL}/${normalizedEndpoint}`;
    const url = new URL(fullURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Make HTTP request
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers, ...fetchOptions } = options;

    const url = this.buildURL(endpoint, params);
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
        credentials: "include", // Include cookies for HttpOnly cookie support
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || "Request failed",
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw new ApiError(
          "Network error: Unable to connect to the server",
          0,
          error
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0,
        error
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient({
  baseURL: env.BACKEND_URL,
});

