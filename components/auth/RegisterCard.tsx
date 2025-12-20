"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/auth.service";
import { ApiError } from "@/lib/api/client";

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export function RegisterCard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call registration API
      const response = await authService.register({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
      });

      // Registration successful
      if (response.success) {
        // Redirect to dashboard or login page
        router.push("/DrawTogether/dashboard");
      }
    } catch (error) {
      // Handle API errors
      if (error instanceof ApiError) {
        // Handle specific error status codes
        if (error.statusCode === 409) {
          // Conflict - user already exists
          setErrors({
            email: "An account with this email already exists",
          });
        } else if (error.statusCode === 400) {
          // Validation error from backend
          const errorData = error.data as { message?: string; errors?: Record<string, string[]> };
          if (errorData?.errors) {
            // Map backend validation errors to form errors
            const validationErrors: FormErrors = {};
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                validationErrors[field as keyof FormErrors] = messages[0];
              }
            });
            setErrors(validationErrors);
          } else {
            setErrors({
              general: errorData?.message || error.message || "Registration failed",
            });
          }
        } else {
          setErrors({
            general: error.message || "Registration failed. Please try again.",
          });
        }
      } else {
        setErrors({
          general: "An unexpected error occurred. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Register To Draw Together
        </h1>
      </div>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit} noValidate>
        {/* General error message */}
        {errors.general && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 ${
              errors.fullName
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-200 focus:ring-teal-500"
            }`}
            disabled={isLoading}
          />
          {errors.fullName && (
            <p className="text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-200 focus:ring-teal-500"
            }`}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-200 focus:ring-teal-500"
            }`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-slate-700"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 ${
              errors.confirmPassword
                ? "border-red-300 focus:ring-red-500"
                : "border-slate-200 focus:ring-teal-500"
            }`}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-teal-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/DrawTogether/auth/login"
          className="font-semibold text-teal-600 hover:text-teal-500"
        >
          Login
        </Link>
      </p>
    </div>
  );
}

