 "use client";

import Link from "next/link";

export function RegisterCard() {
  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-600">
          Draw Together
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Register</h1>
      </div>

      <form
        className="mt-10 space-y-5"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Create a password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-teal-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Create account
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-500">
          Login
        </Link>
      </p>
    </div>
  );
}

