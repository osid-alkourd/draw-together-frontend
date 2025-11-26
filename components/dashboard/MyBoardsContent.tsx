"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoardCardWithMenu } from "./BoardCardWithMenu";
import { CreateBoardButton } from "./CreateBoardButton";
import type { Board } from "@/types/board";

// Dummy data - in real app, this would come from an API
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
  const [boards] = useState<Board[]>(dummyBoards);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

