import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { CreateBoardForm } from "@/components/dashboard/CreateBoardForm";

export const metadata: Metadata = {
  title: "Create Board | DrawTogether",
  description: "Create a new whiteboard to collaborate with your team.",
};

export default function CreateBoardPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <DashboardHeader />
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <CreateBoardForm />
      </div>
    </div>
  );
}

