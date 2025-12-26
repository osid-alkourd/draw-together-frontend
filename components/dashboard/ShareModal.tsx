"use client";

import { useState } from "react";
import { whiteboardService } from "@/lib/api/whiteboard.service";
import { ApiError } from "@/lib/api/client";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (email: string) => void;
  onRemoveUser: (email: string) => void;
  sharedUsers?: string[];
  whiteboardId: string;
}

export function ShareModal({
  isOpen,
  onClose,
  onAddUser,
  onRemoveUser,
  sharedUsers = [],
  whiteboardId,
}: ShareModalProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [removingEmail, setRemovingEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim()) {
      setError("Please enter an email address");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (sharedUsers.includes(email)) {
      setError("This user is already added to the board");
      setIsLoading(false);
      return;
    }

    try {
      // Call backend API to add collaborator
      const response = await whiteboardService.addCollaborator(whiteboardId, {
        email: email.trim(),
      });

      if (response.success) {
        // Successfully added collaborator
        onAddUser(email.trim());
    setEmail("");
      } else {
        setError(response.message || "Failed to add collaborator");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          setError("Whiteboard not found");
        } else if (error.statusCode === 403) {
          setError("You don't have permission to add collaborators");
        } else if (error.statusCode === 400) {
          setError(error.message || "Invalid email address or user not found");
        } else if (error.statusCode === 409) {
          setError("This user is already a collaborator");
        } else {
          setError(error.message || "Failed to add collaborator");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle removing a collaborator from the whiteboard
   * Calls the backend API to remove the collaborator
   */
  const handleRemoveUser = async (email: string) => {
    setRemovingEmail(email);
    setError("");

    try {
      // Call backend API to remove collaborator
      const response = await whiteboardService.removeCollaborator(whiteboardId, {
        email: email.trim(),
      });

      if (response.success) {
        // Successfully removed collaborator - update parent component state
        onRemoveUser(email.trim());
      } else {
        setError(response.message || "Failed to remove collaborator");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 404) {
          setError("Whiteboard not found");
        } else if (error.statusCode === 403) {
          setError("You don't have permission to remove collaborators");
        } else if (error.statusCode === 400) {
          setError(error.message || "Invalid email address");
        } else {
          setError(error.message || "Failed to remove collaborator");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setRemovingEmail(null);
    }
  };

  const handleClose = () => {
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">Share Board</h2>
          <p className="mt-2 text-sm text-slate-500">
            Add users to collaborate on this board by entering their email address.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="share-email"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="share-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="user@example.com"
              className={`w-full rounded-2xl border px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 ${
                error
                  ? "border-rose-300 focus:ring-rose-500"
                  : "border-slate-200 focus:ring-teal-500"
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-rose-600">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-2xl bg-teal-500 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                "Add User"
              )}
            </button>
          </div>
        </form>

        {/* Shared Users List */}
        {sharedUsers.length > 0 && (
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Shared with ({sharedUsers.length})
            </h3>
            <div className="space-y-2">
              {sharedUsers.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{user}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(user)}
                    disabled={removingEmail === user}
                    className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Remove collaborator"
                  >
                    {removingEmail === user ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

