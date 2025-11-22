"use client";

import { useRouter } from "next/navigation";

interface CreateBoardButtonProps {
  className?: string;
}

export function CreateBoardButton({ className = "" }: CreateBoardButtonProps) {
  const router = useRouter();

  const handleCreateBoard = () => {
    router.push("/DrawTogether/dashboard/create");
  };

  return (
    <button
      onClick={handleCreateBoard}
      className={`flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${className}`}
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create New Board
    </button>
  );
}

