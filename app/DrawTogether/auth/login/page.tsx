import type { Metadata } from "next";
import { LoginCard } from "@/components/auth/LoginCard";
import { LandingHeader } from "@/components/layout/LandingHeader";

export const metadata: Metadata = {
  title: "Login | DrawTogether",
  description: "Access your DrawTogether account to keep collaborating in real time.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <LandingHeader />
      <div className="flex items-center justify-center px-4 py-12">
        <LoginCard />
      </div>
    </div>
  );
}

