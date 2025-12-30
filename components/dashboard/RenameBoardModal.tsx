"use client";

import { useState, useEffect } from "react";
import { whiteboardService } from "@/lib/api/whiteboard.service";
import { ApiError } from "@/lib/api/client";

interface RenameBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  whiteboardId: string;
  onSave: (newName: string) => void;
}

export function RenameBoardModal({
  isOpen,
  onClose,
  currentName,
  whiteboardId,
  onSave,
}: RenameBoardModalProps) {
  const [boardName, setBoardName] = useState(currentName);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Update board name when currentName changes (e.g., when modal opens with different board)
  useEffect(() => {
    if (isOpen) {
      setBoardName(currentName);
      setError("");
      setIsLoading(false);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const trimmedName = boardName.trim();

    if (!trimmedName) {
      setError("Board name cannot be empty");
      setIsLoading(false);
      return;
    }

    if (trimmedName.length > 255) {
      setError("Board name must be 255 characters or less");
      setIsLoading(false);
      return;
    }

    // Don't make API call if name hasn't changed
    if (trimmedName === currentName.trim()) {
      onClose();
      setIsLoading(false);
      return;
    }

    try {
      const response = await whiteboardService.renameWhiteboard(whiteboardId, {
        title: trimmedName,
      });

      if (response.success && response.data) {
        // Call the parent's onSave callback with the new name
        onSave(trimmedName);
        onClose();
      } else {
        setError(response.message || "Failed to rename whiteboard");
      }
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        if (err.statusCode === 404) {
          setError("Whiteboard not found");
        } else if (err.statusCode === 403) {
          setError("You don't have permission to rename this whiteboard");
        } else if (err.statusCode === 400) {
          setError(err.message || "Invalid request");
        } else {
          setError(err.message || "Failed to rename whiteboard");
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      setBoardName(currentName);
      setError("");
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">Rename Board</h2>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label
              htmlFor="board-name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Board Name
            </label>
            <input
              id="board-name"
              type="text"
              value={boardName}
              onChange={(e) => {
                setBoardName(e.target.value);
                setError("");
              }}
              placeholder="Enter board name"
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

