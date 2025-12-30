import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MyBoardsContent } from "@/components/dashboard/MyBoardsContent";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "My Boards | DrawTogether",
  description: "View and manage all your whiteboards.",
};

export default function MyBoardsPage() {
  return (
    <AuthGuard redirectTo="/DrawTogether/auth/login">
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <DashboardHeader />
        <MyBoardsContent />
      </div>
    </AuthGuard>
  );
}

