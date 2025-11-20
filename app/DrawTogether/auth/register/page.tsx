import type { Metadata } from "next";
import { RegisterCard } from "@/components/auth/RegisterCard";

export const metadata: Metadata = {
  title: "Register | DrawTogether",
  description: "Create your DrawTogether account to collaborate on whiteboards in real time.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <RegisterCard />
    </div>
  );
}

