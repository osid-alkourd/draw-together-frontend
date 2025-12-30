import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { AuthGuard } from "@/components/auth/AuthGuard";

export const metadata: Metadata = {
  title: "Dashboard | DrawTogether",
  description: "Manage your whiteboards and collaborate with your team.",
};

export default function DashboardPage() {
  return (
    <AuthGuard redirectTo="/DrawTogether/auth/login">
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <DashboardHeader />
        <DashboardContent />
      </div>
    </AuthGuard>
  );
}
