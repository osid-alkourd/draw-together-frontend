"use client";

import type { Board } from "@/types/board";

interface SharedBoardCardProps {
  board: Board;
  onOpen: () => void;
  onLeave: () => void;
}

export function SharedBoardCard({ board, onOpen, onLeave }: SharedBoardCardProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? "Just now" : `${minutes} minutes ago`;
      }
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="group rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md">
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-gradient-to-br from-teal-100 to-blue-100">
        <div className="flex h-full w-full items-center justify-center">
          <svg className="h-16 w-16 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        {/* Board Title */}
        <h3 className="mb-3 text-lg font-semibold text-slate-900 line-clamp-2">
          {board.title}
        </h3>

        {/* Shared By */}
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">Shared by:</span>
          <span className="text-slate-900">{board.createdBy}</span>
        </div>

        {/* Last Updated */}
        <p className="mb-4 text-sm text-slate-500">
          Updated {formatDate(board.lastModified)}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onOpen}
            className="flex-1 rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            Open
          </button>
          <button
            onClick={onLeave}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
          >
            Leave Board
          </button>
        </div>
      </div>
    </div>
  );
}

