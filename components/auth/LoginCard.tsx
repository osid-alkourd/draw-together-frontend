"use client";

import Link from "next/link";

export function LoginCard() {
  return (
    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70 sm:p-10">
      <div className="space-y-2 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Login To Draw Together</h1>
        <p className="text-sm text-slate-500">Welcome back to your collaborative workspace.</p>
      </div>

      <form
        className="mt-10 space-y-5"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-2xl bg-teal-500 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Login
        </button>
      </form>

      <div className="mt-8 space-y-3 text-center text-sm text-slate-500">
        <p>
          Don{"'"}t have an account?{" "}
          <Link href="/DrawTogether/auth/register" className="font-semibold text-teal-600 hover:text-teal-500">
            Register
          </Link>
        </p>
        <p>
          <Link
            href="#"
            onClick={(event) => event.preventDefault()}
            className="font-semibold text-teal-600 hover:text-teal-500"
          >
            Forgot password?
          </Link>
        </p>
      </div>
    </div>
  );
}

