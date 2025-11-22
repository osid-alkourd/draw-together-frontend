import type { Metadata } from "next";
import { RegisterCard } from "@/components/auth/RegisterCard";
import { LandingHeader } from "@/components/layout/LandingHeader";

export const metadata: Metadata = {
  title: "Register | DrawTogether",
  description: "Create your DrawTogether account to collaborate on whiteboards in real time.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />
      <div className="flex items-center justify-center px-4 py-12">
        <RegisterCard />
      </div>
    </div>
  );
}

