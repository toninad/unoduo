import type { RankedApp } from "@/lib/apps";

// Sample listings shown by `npm run dev` when Supabase isn't configured, so the
// pages can be previewed without a database. Never used in production.
const samples: Array<[string, string, string, number, string]> = [
  ["Splitscreen Notes", "Northpaw", "Two notes side by side, one per screen", 48200, "#e2445c"],
  ["DuoCam", "Lumen Labs", "Preview on the outside, controls on the inside", 31000, "#f2a93b"],
  ["Fold Reader", "Paperback Co", "Books that open like books", 12000, "#3fb950"],
  ["Twin Chat", "Hello Studio", "Chat on one screen, the call on the other", 5000, "#2bb5c9"],
  ["Pocket DJ", "Two Decks", "Two decks, two screens", 500, "#5b4bdb"],
];

function icon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" fill="${color}"/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const DEMO_APPS: RankedApp[] = samples.map(([name, developer, tagline, totalCents, color], i) => ({
  id: `demo-${i}`,
  appStoreId: 1000000 + i,
  name,
  developer,
  tagline,
  iconUrl: icon(color),
  appStoreUrl: "https://apps.apple.com/",
  totalCents,
  rank: i + 1,
}));

export const isDemoMode = () => process.env.NODE_ENV === "development";
