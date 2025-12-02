import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardContent } from "@/components/dashboard/DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard | DrawTogether",
  description: "Manage your whiteboards and collaborate with your team.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader />
      <DashboardContent />
    </div>
  );
}
