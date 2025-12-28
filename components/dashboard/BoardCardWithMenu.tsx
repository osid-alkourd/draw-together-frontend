"use client";

import { useEffect, useRef, useState } from "react";
import type { Board } from "@/types/board";

interface BoardCardWithMenuProps {
  board: Board;
  onOpen: () => void;
  onMenuAction: (action: string) => void;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  isDuplicating?: boolean;
}

export function BoardCardWithMenu({
  board,
  onOpen,
  onMenuAction,
  isMenuOpen,
  onMenuToggle,
  isDuplicating = false,
}: BoardCardWithMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);

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

  /**
   * Handle copying the whiteboard link to clipboard
   */
  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      // Construct the whiteboard URL
      const whiteboardUrl = `${window.location.origin}/DrawTogether/dashboard/boards/${board.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(whiteboardUrl);
      
      // Show feedback
      setLinkCopied(true);
      onMenuToggle(); // Close the menu
      
      // Reset feedback after 2 seconds
      setTimeout(() => {
        setLinkCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      // Fallback for older browsers
      const whiteboardUrl = `${window.location.origin}/DrawTogether/dashboard/boards/${board.id}`;
      const textArea = document.createElement("textarea");
      textArea.value = whiteboardUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setLinkCopied(true);
        onMenuToggle();
        setTimeout(() => {
          setLinkCopied(false);
        }, 2000);
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md">
      {/* Toast notification for copied link */}
      {linkCopied && (
        <div className="absolute top-4 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Link copied!
          </div>
        </div>
      )}
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
                  onClick={handleCopyLink}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuAction("duplicate");
                  }}
                  disabled={isDuplicating}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isDuplicating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                      Duplicating...
                    </>
                  ) : (
                    "Duplicate"
                  )}
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

