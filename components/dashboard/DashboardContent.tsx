"use client";

import { useState } from "react";
import { BoardCard } from "./BoardCard";
import { CreateBoardButton } from "./CreateBoardButton";
import { RecentActivity } from "./RecentActivity";
import type { Board } from "@/types/board";

// Dummy data
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
  const [yourBoards] = useState<Board[]>(dummyYourBoards);
  const [sharedBoards] = useState<Board[]>(dummySharedBoards);

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
        {yourBoards.length > 0 ? (
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
        {sharedBoards.length > 0 ? (
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

