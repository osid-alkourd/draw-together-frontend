/**
 * Environment Configuration
 * Centralized access to environment variables
 * 
 * Note: In Next.js, only variables prefixed with NEXT_PUBLIC_ are exposed to the browser.
 * For client-side code, use NEXT_PUBLIC_BACKEND_URL in your .env file.
 */

export const env = {
  /**
   * Backend API base URL
   * Example: http://localhost:8000/api
   * 
   * This reads from NEXT_PUBLIC_BACKEND_URL environment variable.
   * Make sure to set NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api in your .env file.
   */
  get BACKEND_URL(): string {
    // In Next.js, only NEXT_PUBLIC_* variables are available in the browser
    const url = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_BACKEND_URL environment variable is not set. " +
        "Please add NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api to your .env file."
      );
    }
    // Remove trailing slash if present
    return url.replace(/\/$/, "");
  },
} as const;

