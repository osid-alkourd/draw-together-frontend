import Link from "next/link";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Draw Together",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <LandingHeader />
        <section className="flex flex-col items-center justify-center px-6 py-16">
        <h1 className="text-4xl font-semibold text-slate-900">Draw together</h1>
        <p className="mt-6 max-w-2xl text-center text-lg text-slate-600">
          Bring your ideas to life on a shared canvas as you draw, sketch, and brainstorm together. Collaboration feels natural and instant with live updates as everyone joins in
        </p>
        <Link
          href="/DrawTogether/auth/register"
          className="mt-8 rounded-2xl bg-blue-500 px-8 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Get started
        </Link>
      </section>
      <section id="features" className="px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold text-slate-900">Feature</h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Real-Time Collaboration Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Real-Time Collaboration</h3>
            <p className="text-center text-sm text-slate-600">Work simultaneously with team members at the same whiteboard</p>
          </div>

          {/* Drawing Tools Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Drawing Tools</h3>
            <p className="text-center text-sm text-slate-600">Use A variety of drawing tools to create shapes,lines,and more</p>
          </div>

          {/* Snapshot History Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Snapshot History</h3>
            <p className="text-center text-sm text-slate-600">Save and restore snapshots of the whiteboard at any time</p>
          </div>

          {/* Easy Sharing Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">easy sharing</h3>
            <p className="text-center text-sm text-slate-600">Share your whiteboards with simple link</p>
          </div>
        </div>
      </section>
      <section id="how-it-work" className="px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-semibold text-slate-900">How it work</h2>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Create your account Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Create your account</h3>
          </div>

          {/* Open or start a new board Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Open or start a new board</h3>
          </div>

          {/* Draw and collaborate in real time Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Draw and collaborate in real time</h3>
          </div>

          {/* Save and share your ideas Card */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex justify-center">
              <svg className="h-12 w-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-slate-900">Save and share your ideas</h3>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
