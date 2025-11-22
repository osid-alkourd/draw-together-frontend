import type { Board } from "@/types/board";

interface RecentActivityProps {
  boards: Board[];
}

export function RecentActivity({ boards }: RecentActivityProps) {
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

  if (boards.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <p className="text-slate-500">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6">
      <ul className="space-y-3">
        {boards.map((board) => (
          <li
            key={board.id}
            className="flex items-center justify-between rounded-md border border-slate-100 p-4 transition hover:bg-slate-50"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-teal-100">
                <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">{board.title}</h4>
                <p className="text-sm text-slate-500">
                  {board.createdBy === "You" ? "Created by you" : `Shared by ${board.createdBy}`}
                </p>
              </div>
            </div>
            <span className="text-sm text-slate-500">{formatDate(board.lastModified)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

