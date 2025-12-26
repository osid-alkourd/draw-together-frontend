"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SharedBoardCard } from "./SharedBoardCard";
import { whiteboardService } from "@/lib/api/whiteboard.service";
import { ApiError } from "@/lib/api/client";
import type { Board } from "@/types/board";

export function SharedBoardsContent() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch shared whiteboards from API
   */
  const fetchSharedBoards = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await whiteboardService.getSharedWithMe();

      if (response.success && response.data) {
        // Map backend response to Board type
        const mappedBoards: Board[] = response.data.map((item) => ({
          id: item.id,
          title: item.title,
          lastModified: new Date(item.updatedAt),
          createdBy: item.ownerName,
          thumbnail: null,
        }));

        setBoards(mappedBoards);
      } else {
        setError("Failed to load shared whiteboards");
        setBoards([]);
      }
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setError("Please log in to view shared whiteboards");
        } else {
          setError(err.message || "Failed to load shared whiteboards");
        }
      } else {
        setError("An unexpected error occurred");
      }
      setBoards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch shared boards on component mount
  useEffect(() => {
    fetchSharedBoards();
  }, [fetchSharedBoards]);

  const handleOpenBoard = (boardId: string) => {
    router.push(`/DrawTogether/dashboard/sharedboards/${boardId}`);
  };

  const handleLeaveBoard = (boardId: string) => {
    // TODO: Implement leave board functionality
    console.log("Leaving board:", boardId);
    // Show confirmation dialog and remove from shared boards
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Shared With Me</h1>
          <p className="mt-2 text-slate-600">Boards that have been shared with you by other users</p>
        </div>
        <div className="flex min-h-[calc(100vh-300px)] items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
            <p className="text-sm text-slate-600">Loading shared boards...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Shared With Me</h1>
          <p className="mt-2 text-slate-600">Boards that have been shared with you by other users</p>
        </div>
        <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <svg className="h-24 w-24 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">Error loading boards</h2>
            <p className="mb-6 text-slate-600">{error}</p>
            <button
              onClick={fetchSharedBoards}
              className="rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (boards.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Shared With Me</h1>
          <p className="mt-2 text-slate-600">Boards that have been shared with you by other users</p>
        </div>
        <div className="flex min-h-[calc(100vh-300px)] items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <div className="mb-6 flex justify-center">
              <svg className="h-24 w-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-semibold text-slate-900">Nothing shared with you yet</h2>
            <p className="text-slate-600">Boards shared by others will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  // Success state - display boards
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Shared With Me</h1>
        <p className="mt-2 text-slate-600">Boards that have been shared with you by other users</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boards.map((board) => (
          <SharedBoardCard
            key={board.id}
            board={board}
            onOpen={() => handleOpenBoard(board.id)}
            onLeave={() => handleLeaveBoard(board.id)}
          />
        ))}
      </div>
    </div>
  );
}

