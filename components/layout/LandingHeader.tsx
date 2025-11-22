import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="w-full bg-white font-sans shadow-sm">
      <div className="flex w-full items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold text-slate-900">Draw Together</span>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors">
            Home
          </Link>
          <Link href="/#features" className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors">
            Feature
          </Link>
          <Link href="/#how-it-work" className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors">
            How it work
          </Link>
          <Link href="/DrawTogether/auth/login" className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors">
            login
          </Link>
          <Link href="/DrawTogether/auth/register" className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors">
            register
          </Link>
        </nav>
      </div>
    </header>
  );
}

