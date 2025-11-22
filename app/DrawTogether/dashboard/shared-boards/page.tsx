import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SharedBoardsContent } from "@/components/dashboard/SharedBoardsContent";

export const metadata: Metadata = {
  title: "Shared With Me | DrawTogether",
  description: "View boards that have been shared with you.",
};

export default function SharedBoardsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader />
      <SharedBoardsContent />
    </div>
  );
}

