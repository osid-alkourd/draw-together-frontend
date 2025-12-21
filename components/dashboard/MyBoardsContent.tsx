"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BoardCardWithMenu } from "./BoardCardWithMenu";
import { CreateBoardButton } from "./CreateBoardButton";
import { whiteboardService } from "@/lib/api/whiteboard.service";
import { ApiError } from "@/lib/api/client";
import type { Board } from "@/types/board";

// Dummy data - kept for reference but not used (data comes from API)
const dummyBoards: Board[] = [
  {
    id: "1",
    title: "Project Planning",
    lastModified: new Date("2025-01-15T10:30:00"),
    createdBy: "You",
    thumbnail: null,
  },
  {
    id: "2",
    title: "Team Brainstorming",
    lastModified: new Date("2025-01-14T15:45:00"),
    createdBy: "You",
    thumbnail: null,
  },
  {
    id: "3",
    title: "Design Mockups",
    lastModified: new Date("2025-01-13T09:20:00"),
    createdBy: "You",
    thumbnail: null,
  },
  {
    id: "4",
    title: "Meeting Notes",
    lastModified: new Date("2025-01-12T14:10:00"),
    createdBy: "You",
    thumbnail: null,
  },
  {
    id: "5",
    title: "Sprint Retrospective",
    lastModified: new Date("2025-01-11T16:20:00"),
    createdBy: "You",
    thumbnail: null,
  },
  {
    id: "6",
    title: "User Stories",
    lastModified: new Date("2025-01-10T11:15:00"),
    createdBy: "You",
    thumbnail: null,
  },
];

export function MyBoardsContent() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  /**
   * Fetch user's whiteboards from API
   */
  const fetchMyWhiteboards = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await whiteboardService.getMyWhiteboards();

      if (response.success && response.data) {
        // Map backend response to Board type
        const mappedBoards: Board[] = response.data.map((item) => ({
          id: item.id,
          title: item.name, // Backend returns 'name' but we need 'title'
          lastModified: new Date(item.updated_at),
          createdBy: "You",
          thumbnail: null,
        }));

        setBoards(mappedBoards);
      } else {
        setError("Failed to load whiteboards");
        setBoards([]);
      }
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setError("Please log in to view your whiteboards");
        } else {
          setError(err.message || "Failed to load whiteboards");
        }
      } else {
        setError("An unexpected error occurred");
      }
      setBoards([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch whiteboards on component mount
  useEffect(() => {
    fetchMyWhiteboards();
  }, []);

  const handleOpenBoard = (boardId: string) => {
    router.push(`/DrawTogether/dashboard/boards/${boardId}`);
  };

  const handleMenuAction = (boardId: string, action: string) => {
    setOpenMenuId(null);
    // TODO: Implement actions
    console.log(`Action: ${action} for board: ${boardId}`);
    
    switch (action) {
      case "rename":
        // TODO: Open rename dialog
        break;
      case "share":
        // TODO: Open share dialog
        break;
      case "duplicate":
        // TODO: Duplicate board
        break;
      case "delete":
        // TODO: Delete board with confirmation
        break;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
          <p className="text-sm text-slate-600">Loading your boards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <svg className="h-24 w-24 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-900">Error loading boards</h2>
          <p className="mb-6 text-slate-600">{error}</p>
          <button
            onClick={fetchMyWhiteboards}
            className="rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (boards.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex justify-center">
            <svg className="h-24 w-24 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-900">No boards yet</h2>
          <p className="mb-6 text-slate-600">Start by creating your first board.</p>
          <CreateBoardButton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">My Boards</h1>
        <CreateBoardButton />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {boards.map((board) => (
          <BoardCardWithMenu
            key={board.id}
            board={board}
            onOpen={() => handleOpenBoard(board.id)}
            onMenuAction={(action) => handleMenuAction(board.id, action)}
            isMenuOpen={openMenuId === board.id}
            onMenuToggle={() => setOpenMenuId(openMenuId === board.id ? null : board.id)}
          />
        ))}
      </div>
    </div>
  );
}

