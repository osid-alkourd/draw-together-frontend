import Link from "next/link";

export const metadata = {
  title: "Draw Together",
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 font-sans text-slate-900">
      <main className="w-full max-w-3xl rounded-3xl bg-white p-12 text-center shadow-xl shadow-slate-200/70">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-600">
          Real-Time Collaborative Whiteboard Application
        </p>
        <h1 className="mt-4 text-4xl font-semibold">Draw Together</h1>
        <p className="mt-6 text-lg text-slate-600">
          Create, ideate, and iterate with your team in real time on a modern whiteboard experience.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/DrawTogether/auth/register"
            className="w-full rounded-2xl bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white sm:w-auto"
          >
            Create an account
          </Link>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 px-6 py-3 text-base font-semibold text-slate-900 transition hover:border-teal-200 hover:text-teal-600 sm:w-auto"
          >
            Learn more
          </button>
        </div>
      </main>
    </div>
  );
}
