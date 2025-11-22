"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type BoardAccess = "private" | "invite" | "public";

export function CreateBoardForm() {
  const router = useRouter();
  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [boardAccess, setBoardAccess] = useState<BoardAccess>("private");
  const [emails, setEmails] = useState<string[]>([""]);
  const [errors, setErrors] = useState<{ boardName?: string }>({});

  const handleAddEmail = () => {
    setEmails([...emails, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!boardName.trim()) {
      setErrors({ boardName: "Board name is required" });
      return;
    }

    setErrors({});

    // TODO: Implement board creation API call
    const boardData = {
      name: boardName,
      description: description.trim() || null,
      access: boardAccess,
      invitedEmails: boardAccess === "invite" ? emails.filter(email => email.trim()) : [],
    };

    console.log("Creating board:", boardData);
    
    // Navigate to dashboard after creation
    // router.push("/DrawTogether/dashboard");
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Create New Board</h1>
        <p className="mt-2 text-slate-600">Set up your whiteboard and start collaborating</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Board Name */}
        <div className="mb-6">
          <label htmlFor="boardName" className="mb-2 block text-sm font-semibold text-slate-700">
            Board Name <span className="text-red-500">*</span>
          </label>
          <input
            id="boardName"
            type="text"
            value={boardName}
            onChange={(e) => {
              setBoardName(e.target.value);
              if (errors.boardName) {
                setErrors({});
              }
            }}
            placeholder="Enter board name"
            className={`w-full rounded-lg border px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              errors.boardName
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-slate-300 focus:border-teal-500 focus:ring-teal-500/20"
            }`}
            required
          />
          {errors.boardName && (
            <p className="mt-1 text-sm text-red-600">{errors.boardName}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label htmlFor="description" className="mb-2 block text-sm font-semibold text-slate-700">
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for your board"
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Board Access */}
        <div className="mb-6">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Board Access
          </label>
          <div className="space-y-3">
            {/* Private */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="boardAccess"
                value="private"
                checked={boardAccess === "private"}
                onChange={(e) => setBoardAccess(e.target.value as BoardAccess)}
                className="mt-1 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Private (only you)</div>
                <div className="mt-1 text-sm text-slate-500">Only you can access this board</div>
              </div>
            </label>

            {/* Invite specific users */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="boardAccess"
                value="invite"
                checked={boardAccess === "invite"}
                onChange={(e) => setBoardAccess(e.target.value as BoardAccess)}
                className="mt-1 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Invite specific users</div>
                <div className="mt-1 text-sm text-slate-500">Share with selected team members</div>
              </div>
            </label>

            {/* Anyone with the link */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="boardAccess"
                value="public"
                checked={boardAccess === "public"}
                onChange={(e) => setBoardAccess(e.target.value as BoardAccess)}
                className="mt-1 h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div className="flex-1">
                <div className="font-medium text-slate-900">
                  Anyone with the link <span className="text-slate-400">(optional)</span>
                </div>
                <div className="mt-1 text-sm text-slate-500">Anyone with the link can access</div>
              </div>
            </label>
          </div>

          {/* Email Input Fields (shown when "Invite specific users" is selected) */}
          {boardAccess === "invite" && (
            <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Invite by Email</label>
                <button
                  type="button"
                  onClick={handleAddEmail}
                  className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                >
                  + Add Email
                </button>
              </div>
              {emails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                  {emails.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(index)}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors"
                      aria-label="Remove email"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Button */}
        <button
          type="submit"
          className="w-full rounded-lg bg-teal-500 px-6 py-3 text-base font-semibold text-white shadow-md transition hover:bg-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          Create Board
        </button>
      </form>
    </div>
  );
}

