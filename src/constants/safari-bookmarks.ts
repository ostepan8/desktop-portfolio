import type { BrandIconId } from "@/constants/brand-icons";

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  iconId: BrandIconId;
  category: string;
}

export const BOOKMARKS: Bookmark[] = [
  // Social
  { id: "github", title: "GitHub", url: "https://github.com/ostepan8", iconId: "github", category: "Social" },
  { id: "linkedin", title: "LinkedIn", url: "https://linkedin.com/in/owen-stepan", iconId: "linkedin", category: "Social" },
  { id: "twitter", title: "Twitter / X", url: "https://x.com", iconId: "twitter", category: "Social" },

  // Development
  { id: "stackoverflow", title: "Stack Overflow", url: "https://stackoverflow.com", iconId: "stackoverflow", category: "Development" },
  { id: "vercel", title: "Vercel", url: "https://vercel.com", iconId: "vercel", category: "Development" },
  { id: "nextjs", title: "Next.js Docs", url: "https://nextjs.org/docs", iconId: "nextjs", category: "Development" },

  // Learning
  { id: "mdn", title: "MDN Web Docs", url: "https://developer.mozilla.org", iconId: "mdn", category: "Learning" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com", iconId: "youtube", category: "Learning" },

  // Sites that work well in iframes
  { id: "wikipedia", title: "Wikipedia", url: "https://en.wikipedia.org", iconId: "wikipedia", category: "Learning" },
  { id: "hn", title: "Hacker News", url: "https://news.ycombinator.com", iconId: "hackernews", category: "News" },
];

// Sites known to block iframes
export const BLOCKED_SITES = [
  "github.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "google.com",
  "facebook.com",
  "instagram.com",
];

export const CATEGORIES = Array.from(new Set(BOOKMARKS.map((b) => b.category)));

export function isUrlBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return BLOCKED_SITES.some((blocked) => hostname.includes(blocked));
  } catch {
    return false;
  }
}
