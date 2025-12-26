"use client";

import { useState, useEffect, useCallback } from "react";
import { BoardCard } from "./BoardCard";
import { CreateBoardButton } from "./CreateBoardButton";
import { RecentActivity } from "./RecentActivity";
import { whiteboardService } from "@/lib/api/whiteboard.service";
import { ApiError } from "@/lib/api/client";
import type { Board } from "@/types/board";

// Dummy data - kept for reference but not used (data comes from API)
const dummyYourBoards: Board[] = [
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
];

const dummySharedBoards: Board[] = [
  {
    id: "5",
    title: "Marketing Strategy",
    lastModified: new Date("2025-01-15T11:00:00"),
    createdBy: "John Doe",
    thumbnail: null,
  },
  {
    id: "6",
    title: "Product Roadmap",
    lastModified: new Date("2025-01-14T16:30:00"),
    createdBy: "Jane Smith",
    thumbnail: null,
  },
  {
    id: "7",
    title: "Sprint Planning",
    lastModified: new Date("2025-01-13T10:15:00"),
    createdBy: "Mike Johnson",
    thumbnail: null,
  },
];

export function DashboardContent() {
  const [yourBoards, setYourBoards] = useState<Board[]>([]);
  const [sharedBoards, setSharedBoards] = useState<Board[]>([]);
  const [isLoadingYourBoards, setIsLoadingYourBoards] = useState(true);
  const [isLoadingSharedBoards, setIsLoadingSharedBoards] = useState(true);
  const [errorYourBoards, setErrorYourBoards] = useState<string | null>(null);
  const [errorSharedBoards, setErrorSharedBoards] = useState<string | null>(null);

  /**
   * Fetch user's whiteboards from API
   */
  const fetchMyWhiteboards = useCallback(async () => {
    setIsLoadingYourBoards(true);
    setErrorYourBoards(null);

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

        setYourBoards(mappedBoards);
      } else {
        setErrorYourBoards("Failed to load whiteboards");
        setYourBoards([]);
      }
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setErrorYourBoards("Please log in to view your whiteboards");
        } else {
          setErrorYourBoards(err.message || "Failed to load whiteboards");
        }
      } else {
        setErrorYourBoards("An unexpected error occurred");
      }
      setYourBoards([]);
    } finally {
      setIsLoadingYourBoards(false);
    }
  }, []);

  /**
   * Fetch shared whiteboards from API
   */
  const fetchSharedBoards = useCallback(async () => {
    setIsLoadingSharedBoards(true);
    setErrorSharedBoards(null);

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

        setSharedBoards(mappedBoards);
      } else {
        setErrorSharedBoards("Failed to load shared whiteboards");
        setSharedBoards([]);
      }
    } catch (err) {
      // Handle API errors
      if (err instanceof ApiError) {
        if (err.statusCode === 401) {
          setErrorSharedBoards("Please log in to view shared whiteboards");
        } else {
          setErrorSharedBoards(err.message || "Failed to load shared whiteboards");
        }
      } else {
        setErrorSharedBoards("An unexpected error occurred");
      }
      setSharedBoards([]);
    } finally {
      setIsLoadingSharedBoards(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchMyWhiteboards();
    fetchSharedBoards();
  }, [fetchMyWhiteboards, fetchSharedBoards]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header with Create Button */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <CreateBoardButton />
      </div>

      {/* Your Boards Section */}
      <section id="my-boards" className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">Your Boards</h2>
        {isLoadingYourBoards ? (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
              <p className="text-sm text-slate-600">Loading your boards...</p>
            </div>
          </div>
        ) : errorYourBoards ? (
          <div className="rounded-lg border-2 border-dashed border-red-300 bg-white p-12 text-center">
            <p className="mb-4 text-red-600">{errorYourBoards}</p>
            <button
              onClick={fetchMyWhiteboards}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              Try Again
            </button>
          </div>
        ) : yourBoards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {yourBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">You haven't created any boards yet.</p>
            <CreateBoardButton className="mt-4" />
          </div>
        )}
      </section>

      {/* Shared With You Section */}
      <section id="shared" className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">Shared With You</h2>
        {isLoadingSharedBoards ? (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-12">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
              <p className="text-sm text-slate-600">Loading shared boards...</p>
            </div>
          </div>
        ) : errorSharedBoards ? (
          <div className="rounded-lg border-2 border-dashed border-red-300 bg-white p-12 text-center">
            <p className="mb-4 text-red-600">{errorSharedBoards}</p>
            <button
              onClick={fetchSharedBoards}
              className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-600"
            >
              Try Again
            </button>
          </div>
        ) : sharedBoards.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sharedBoards.map((board) => (
              <BoardCard key={board.id} board={board} isShared />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-white p-12 text-center">
            <p className="text-slate-500">No boards have been shared with you yet.</p>
          </div>
        )}
      </section>

      {/* Recent Activity Section */}
      <section>
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">Recent Activity</h2>
        <RecentActivity boards={[...yourBoards, ...sharedBoards].sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime()).slice(0, 5)} />
      </section>
    </div>
  );
}

