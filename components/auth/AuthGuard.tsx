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
   * For protected pages (redirectIfAuthenticated=false), this is where unauthenticated users go
   * For auth pages (redirectIfAuthenticated=true), this is where authenticated users go
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
  redirectTo,
  loadingComponent,
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Set default redirect path based on redirectIfAuthenticated flag
  const defaultRedirectTo = redirectIfAuthenticated 
    ? "/DrawTogether/dashboard" 
    : "/DrawTogether/auth/login";
  const finalRedirectTo = redirectTo || defaultRedirectTo;

  useEffect(() => {
    // Wait for auth check to complete
    if (isLoading) {
      return;
    }

    // If redirectIfAuthenticated is true and user is authenticated, redirect
    if (redirectIfAuthenticated && isAuthenticated) {
      router.replace(finalRedirectTo);
      return;
    }

    // If redirectIfAuthenticated is false and user is NOT authenticated, redirect to login
    if (!redirectIfAuthenticated && !isAuthenticated) {
      router.replace(finalRedirectTo);
      return;
    }
  }, [isAuthenticated, isLoading, redirectIfAuthenticated, finalRedirectTo, router]);

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

  // If redirectIfAuthenticated is false and user is NOT authenticated, don't render children
  // (redirect will happen in useEffect)
  if (!redirectIfAuthenticated && !isAuthenticated) {
    return null;
  }

  // Render children if guard passes
  return <>{children}</>;
}

