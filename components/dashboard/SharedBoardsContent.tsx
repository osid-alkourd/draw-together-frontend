"use client";

import { useState } from "react";
import { SharedBoardCard } from "./SharedBoardCard";
import type { Board } from "@/types/board";

// Dummy data - in real app, this would come from an API
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
  {
    id: "8",
    title: "Design System",
    lastModified: new Date("2025-01-12T14:20:00"),
    createdBy: "Sarah Williams",
    thumbnail: null,
  },
  {
    id: "9",
    title: "Q4 Goals",
    lastModified: new Date("2025-01-11T09:30:00"),
    createdBy: "David Brown",
    thumbnail: null,
  },
];

export function SharedBoardsContent() {
  const [boards] = useState<Board[]>(dummySharedBoards);

  const handleOpenBoard = (boardId: string) => {
    // TODO: Navigate to board editor
    console.log("Opening board:", boardId);
    // router.push(`/DrawTogether/board/${boardId}`);
  };

  const handleLeaveBoard = (boardId: string) => {
    // TODO: Implement leave board functionality
    console.log("Leaving board:", boardId);
    // Show confirmation dialog and remove from shared boards
  };

  if (boards.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
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
    );
  }

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

