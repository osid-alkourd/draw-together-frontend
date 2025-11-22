"use client";

import { useState } from "react";
import Link from "next/link";

export function DashboardHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="w-full bg-white font-sans shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* App Name */}
        <Link href="/DrawTogether/dashboard" className="text-lg font-semibold text-slate-900 hover:text-teal-600 transition-colors">
          Draw Together
        </Link>

        {/* Navigation Menu */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/DrawTogether/dashboard/shared-boards"
            className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
          >
            Shared With Me
          </Link>
          <Link
            href="/DrawTogether/dashboard/my-boards"
            className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
          >
            My Boards
          </Link>
        </nav>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="hidden flex-1 max-w-md mx-6 lg:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search your boards by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-slate-100 transition-colors"
            aria-label="User menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-sm font-semibold text-white">
              U
            </div>
            <svg
              className={`h-4 w-4 text-slate-600 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-2 shadow-lg">
                <Link
                  href="/DrawTogether/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/DrawTogether/settings"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  Settings
                </Link>
                <hr className="my-1 border-slate-200" />
                <button
                  onClick={() => {
                    // TODO: Implement logout functionality
                    console.log("Logout");
                    setShowUserMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="border-t border-slate-200 px-6 py-3 lg:hidden">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search your boards by name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
            <svg
              className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>
      </div>

      {/* Mobile Navigation */}
      <div className="border-t border-slate-200 px-6 py-3 md:hidden">
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/DrawTogether/dashboard/shared-boards"
            className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
          >
            Shared With Me
          </Link>
          <Link
            href="/DrawTogether/dashboard/my-boards"
            className="text-sm font-medium text-slate-700 hover:text-teal-600 transition-colors"
          >
            My Boards
          </Link>
        </nav>
      </div>
    </header>
  );
}

