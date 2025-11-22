"use client";

import { useEffect, useRef } from "react";
import type { Board } from "@/types/board";

interface BoardCardWithMenuProps {
  board: Board;
  onOpen: () => void;
  onMenuAction: (action: string) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
}

export function BoardCardWithMenu({
  board,
  onOpen,
  onMenuAction,
  isMenuOpen,
  onMenuToggle,
}: BoardCardWithMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (isMenuOpen) {
          onMenuToggle();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen, onMenuToggle]);

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
    <div className="group relative rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md">
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
        <div className="mb-3 flex items-start justify-between">
          <h3 className="flex-1 text-lg font-semibold text-slate-900 line-clamp-2">
            {board.title}
          </h3>
          
          {/* Dot Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle();
              }}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              aria-label="Board options"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuAction("rename");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuAction("share");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuAction("duplicate");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Duplicate
                </button>
                <hr className="my-1 border-slate-200" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuAction("delete");
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Last Updated */}
        <p className="mb-4 text-sm text-slate-500">
          Updated {formatDate(board.lastModified)}
        </p>

        {/* Open Button */}
        <button
          onClick={onOpen}
          className="w-full rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          Open
        </button>
      </div>
    </div>
  );
}

