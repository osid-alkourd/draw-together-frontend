"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { whiteboardService } from "@/lib/api/whiteboard.service";
import { ApiError } from "@/lib/api/client";
import { BoardAccessType } from "@/lib/types/whiteboard";

type BoardAccess = "private" | "invite" | "public";

export function CreateBoardForm() {
  const router = useRouter();
  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [boardAccess, setBoardAccess] = useState<BoardAccess>("private");
  const [emails, setEmails] = useState<string[]>([""]);
  const [errors, setErrors] = useState<{ 
    boardName?: string;
    emails?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  /**
   * Map frontend board access to backend board access type
   */
  const mapBoardAccess = (access: BoardAccess): BoardAccessType => {
    switch (access) {
      case "private":
        return BoardAccessType.PRIVATE;
      case "invite":
        return BoardAccessType.INVITE_SPECIFIC_USERS;
      case "public":
        // Backend doesn't support public, default to private
        return BoardAccessType.PRIVATE;
      default:
        return BoardAccessType.PRIVATE;
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: { boardName?: string; emails?: string } = {};

    // Validate board name
    if (!boardName.trim()) {
      newErrors.boardName = "Board name is required";
    }

    // Validate emails if invite access is selected
    if (boardAccess === "invite") {
      const validEmails = emails.filter((email) => email.trim());
      if (validEmails.length === 0) {
        newErrors.emails = "At least one email is required when inviting users";
      } else {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = validEmails.filter((email) => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          newErrors.emails = "Please enter valid email addresses";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare board data
      const validEmails = boardAccess === "invite" 
        ? emails.filter((email) => email.trim())
        : undefined;

      const boardData = {
        title: boardName.trim(),
        description: description.trim() || undefined,
        boardAccess: mapBoardAccess(boardAccess),
        invitedEmails: validEmails,
      };

      // Call create whiteboard API
      const response = await whiteboardService.create(boardData);

      // Success - navigate to the created board
      if (response.data?.id) {
        router.push(`/DrawTogether/dashboard/boards/${response.data.id}`);
      } else {
        // Fallback to dashboard if no board ID
        router.push("/DrawTogether/dashboard");
      }
    } catch (error) {
      // Handle API errors
      if (error instanceof ApiError) {
        // Handle specific error status codes
        if (error.statusCode === 400) {
          // Validation error from backend
          const errorData = error.data as { message?: string; errors?: Record<string, string[]> };
          if (errorData?.errors) {
            // Map backend validation errors to form errors
            const validationErrors: { boardName?: string; emails?: string; general?: string } = {};
            Object.entries(errorData.errors).forEach(([field, messages]) => {
              if (messages && messages.length > 0) {
                if (field === "title") {
                  validationErrors.boardName = messages[0];
                } else if (field === "invitedEmails") {
                  validationErrors.emails = messages[0];
                } else {
                  validationErrors.general = messages[0];
                }
              }
            });
            setErrors(validationErrors);
          } else {
            setErrors({
              general: errorData?.message || error.message || "Failed to create board",
            });
          }
        } else {
          setErrors({
            general: error.message || "Failed to create board. Please try again.",
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
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Create New Board</h1>
        <p className="mt-2 text-slate-600">Set up your whiteboard and start collaborating</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* General error message */}
        {errors.general && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        {/* Board Name */}
        <div className="mb-6">
          <label htmlFor="boardName" className="mb-2 block text-sm font-semibold text-slate-700">
            Board Name <span className="text-red-500">*</span>
          </label>
          <input
            id="boardName"
            type="text"
            value={boardName}
            onChange={(e) => {
              setBoardName(e.target.value);
              if (errors.boardName) {
                setErrors({});
              }
            }}
            placeholder="Enter board name"
            className={`w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              errors.boardName
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
            }`}
            required
            disabled={isLoading}
          />
          {errors.boardName && (
            <p className="mt-1 text-sm text-red-600">{errors.boardName}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for your board"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            disabled={isLoading}
          />
        </div>

        {/* Board Access */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Board Access
          </label>
          <div className="space-y-3">
            {/* Private */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="boardAccess"
                value="private"
                checked={boardAccess === "private"}
                onChange={(e) => setBoardAccess(e.target.value as BoardAccess)}
                className="mt-1 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Private (only you)</div>
                <div className="mt-1 text-sm text-slate-500">Only you can access this board</div>
              </div>
            </label>

            {/* Invite specific users */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="boardAccess"
                value="invite"
                checked={boardAccess === "invite"}
                onChange={(e) => setBoardAccess(e.target.value as BoardAccess)}
                className="mt-1 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Invite specific users</div>
                <div className="mt-1 text-sm text-slate-500">Share with selected team members</div>
              </div>
            </label>

            {/* Anyone with the link */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="boardAccess"
                value="public"
                checked={boardAccess === "public"}
                onChange={(e) => setBoardAccess(e.target.value as BoardAccess)}
                className="mt-1 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  Anyone with the link <span className="text-slate-400">(optional)</span>
                </div>
                <div className="mt-1 text-sm text-slate-500">Anyone with the link can access</div>
              </div>
            </label>
          </div>

          {/* Email Input Fields (shown when "Invite specific users" is selected) */}
          {boardAccess === "invite" && (
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Invite by Email</label>
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  + Add Email
                </button>
              </div>
              {errors.emails && (
                <p className="text-sm text-red-600">{errors.emails}</p>
              )}
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      handleEmailChange(index, e.target.value);
                      if (errors.emails) {
                        setErrors((prev) => ({ ...prev, emails: undefined }));
                      }
                    }}
                    placeholder="user@example.com"
                    className={`flex-1 rounded-lg border bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      errors.emails
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
                    }`}
                    disabled={isLoading}
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(index)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                      aria-label="Remove email"
                      disabled={isLoading}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating Board..." : "Create Board"}
        </button>
      </form>
    </div>
  );
}

