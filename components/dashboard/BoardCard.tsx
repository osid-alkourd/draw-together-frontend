import type { Board } from "@/types/board";

interface BoardCardProps {
  board: Board;
  isShared?: boolean;
}

export function BoardCard({ board, isShared = false }: BoardCardProps) {
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
    <div className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-teal-300 hover:shadow-md">
      {/* Thumbnail Placeholder */}
      <div className="mb-3 aspect-video w-full rounded-md bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
        <svg className="h-12 w-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* Board Info */}
      <div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
          {board.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>{isShared ? `Shared by ${board.createdBy}` : board.createdBy}</span>
          <span>{formatDate(board.lastModified)}</span>
        </div>
      </div>

      {/* Shared Badge */}
      {isShared && (
        <div className="mt-2 inline-block rounded-full bg-teal-100 px-2 py-1 text-xs font-medium text-teal-700">
          Shared
        </div>
      )}
    </div>
  );
}

