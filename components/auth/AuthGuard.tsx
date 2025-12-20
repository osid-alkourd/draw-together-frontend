/**
 * Authentication Guard Component
 * Prevents authenticated users from accessing certain pages (e.g., register, login)
 * Redirects authenticated users to the dashboard
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

interface AuthGuardProps {
  /**
   * If true, redirects authenticated users (for register/login pages)
   * If false, redirects unauthenticated users (for protected pages)
   */
  redirectIfAuthenticated?: boolean;
  /**
   * Path to redirect to if condition is met
   */
  redirectTo?: string;
  /**
   * Content to render while checking authentication
   */
  loadingComponent?: React.ReactNode;
  /**
   * Children to render if guard passes
   */
  children: React.ReactNode;
}

/**
 * AuthGuard Component
 * Protects routes based on authentication status
 */
export function AuthGuard({
  redirectIfAuthenticated = false,
  redirectTo = "/DrawTogether/dashboard",
  loadingComponent,
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // If redirectIfAuthenticated is true and user is authenticated, redirect
    if (redirectIfAuthenticated && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectIfAuthenticated, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // If redirectIfAuthenticated is true and user is authenticated, don't render children
  // (redirect will happen in useEffect)
  if (redirectIfAuthenticated && isAuthenticated) {
    return null;
  }

  // Render children if guard passes
  return <>{children}</>;
}

