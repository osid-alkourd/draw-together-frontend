import type { Board } from "@/types/board";

const now = new Date("2025-01-15T10:00:00");

const hoursAgo = (hours: number) =>
  new Date(now.getTime() - hours * 60 * 60 * 1000);

export const STATIC_MY_BOARDS: Board[] = [
  {
    id: "1",
    title: "Project Planning",
    description: "Milestones and goals for Q1.",
    lastModified: hoursAgo(2),
    createdBy: "You",
    ownerEmail: "you@example.com",
    access: "private",
    invitedEmails: [],
    thumbnail: null,
  },
  {
    id: "2",
    title: "Team Brainstorming",
    description: "Ideas from our last retrospective.",
    lastModified: hoursAgo(5),
    createdBy: "You",
    ownerEmail: "you@example.com",
    access: "invite",
    invitedEmails: ["teammate@example.com"],
    thumbnail: null,
  },
  {
    id: "3",
    title: "Design Mockups",
    description: "Wireframes for the upcoming release.",
    lastModified: hoursAgo(12),
    createdBy: "You",
    ownerEmail: "you@example.com",
    access: "public",
    invitedEmails: [],
    thumbnail: null,
  },
  {
    id: "4",
    title: "Meeting Notes",
    description: "Notes captured during weekly sync.",
    lastModified: hoursAgo(24),
    createdBy: "You",
    ownerEmail: "you@example.com",
    access: "private",
    invitedEmails: [],
    thumbnail: null,
  },
  {
    id: "5",
    title: "Sprint Retrospective",
    description: "What went well and what to improve.",
    lastModified: hoursAgo(36),
    createdBy: "You",
    ownerEmail: "you@example.com",
    access: "invite",
    invitedEmails: ["coach@example.com"],
    thumbnail: null,
  },
  {
    id: "6",
    title: "User Stories",
    description: "Stories awaiting grooming.",
    lastModified: hoursAgo(48),
    createdBy: "You",
    ownerEmail: "you@example.com",
    access: "private",
    invitedEmails: [],
    thumbnail: null,
  },
];

export const STATIC_SHARED_BOARDS: Board[] = [
  {
    id: "shared-1",
    title: "Marketing Strategy",
    description: "Campaign ideas for product launch.",
    lastModified: hoursAgo(3),
    createdBy: "John Doe",
    ownerEmail: "john@example.com",
    access: "invite",
    invitedEmails: ["you@example.com"],
    thumbnail: null,
  },
  {
    id: "shared-2",
    title: "Product Roadmap",
    description: "Timeline for the next six months.",
    lastModified: hoursAgo(8),
    createdBy: "Jane Smith",
    ownerEmail: "jane@example.com",
    access: "private",
    invitedEmails: ["you@example.com"],
    thumbnail: null,
  },
  {
    id: "shared-3",
    title: "Sprint Planning",
    description: "Sprint goals and tasks.",
    lastModified: hoursAgo(20),
    createdBy: "Mike Johnson",
    ownerEmail: "mike@example.com",
    access: "invite",
    invitedEmails: ["you@example.com"],
    thumbnail: null,
  },
  {
    id: "shared-4",
    title: "Design System",
    description: "Asset guidelines and components.",
    lastModified: hoursAgo(30),
    createdBy: "Sarah Williams",
    ownerEmail: "sarah@example.com",
    access: "public",
    invitedEmails: [],
    thumbnail: null,
  },
  {
    id: "shared-5",
    title: "Q4 Goals",
    description: "Objectives for the quarter.",
    lastModified: hoursAgo(50),
    createdBy: "David Brown",
    ownerEmail: "david@example.com",
    access: "invite",
    invitedEmails: ["you@example.com"],
    thumbnail: null,
  },
];

export const STATIC_ALL_BOARDS: Board[] = [
  ...STATIC_MY_BOARDS,
  ...STATIC_SHARED_BOARDS,
];

