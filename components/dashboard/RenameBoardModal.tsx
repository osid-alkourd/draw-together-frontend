"use client";

import { useState, useEffect } from "react";

interface RenameBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onSave: (newName: string) => void;
}

export function RenameBoardModal({
  isOpen,
  onClose,
  currentName,
  onSave,
}: RenameBoardModalProps) {
  const [boardName, setBoardName] = useState(currentName);
  const [error, setError] = useState("");

  // Update board name when currentName changes (e.g., when modal opens with different board)
  useEffect(() => {
    if (isOpen) {
      setBoardName(currentName);
      setError("");
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedName = boardName.trim();

    if (!trimmedName) {
      setError("Board name cannot be empty");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Board name must be 100 characters or less");
      return;
    }

    // For now, just close the modal (backend endpoint will be added later)
    onSave(trimmedName);
    onClose();
  };

  const handleCancel = () => {
    setBoardName(currentName);
    setError("");
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
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
              className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-0"
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
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

