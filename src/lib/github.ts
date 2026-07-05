import { PROFILE } from "@/constants/profile";

/** Subset of the GitHub REST API repo shape the UI actually renders. */
export interface GitHubRepo {
  readonly id: number;
  readonly name: string;
  readonly description: string | null;
  readonly htmlUrl: string;
  readonly language: string | null;
  readonly stargazersCount: number;
  readonly forksCount: number;
  readonly pushedAt: string;
  readonly fork: boolean;
  readonly homepage: string | null;
}

export interface GitHubProfile {
  readonly login: string;
  readonly name: string | null;
  readonly bio: string | null;
  readonly avatarUrl: string;
  readonly htmlUrl: string;
  readonly publicRepos: number;
  readonly followers: number;
}

export interface GitHubData {
  readonly profile: GitHubProfile;
  readonly repos: readonly GitHubRepo[];
}

const CACHE_KEY = "github-data-v1";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — stays well under the 60 req/hr unauthenticated limit

/** Language accent colors, matching GitHub's own palette. */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Kotlin: "#A97BFF",
  Java: "#b07219",
  Shell: "#89e051",
  QML: "#44a51c",
  Vue: "#41b883",
  Makefile: "#427819",
  HTML: "#e34c26",
  CSS: "#663399",
};

interface RawRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
  homepage: string | null;
}

interface RawProfile {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
}

function isRawRepoArray(value: unknown): value is RawRepo[] {
  return (
    Array.isArray(value) &&
    value.every(
      (r) => typeof r === "object" && r !== null && "name" in r && "html_url" in r,
    )
  );
}

function isRawProfile(value: unknown): value is RawProfile {
  return (
    typeof value === "object" &&
    value !== null &&
    "login" in value &&
    "avatar_url" in value
  );
}

function readCache(): GitHubData | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; data: GitHubData };
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data: GitHubData): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage full or unavailable — cache is best-effort only.
  }
}

/**
 * Fetch Owen's GitHub profile + repos, cached in sessionStorage for an hour.
 * Throws with a user-presentable message on failure.
 */
export async function fetchGitHubData(): Promise<GitHubData> {
  const cached = readCache();
  if (cached) return cached;

  const headers = { Accept: "application/vnd.github+json" };
  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${PROFILE.githubUsername}`, { headers }),
    fetch(
      `https://api.github.com/users/${PROFILE.githubUsername}/repos?sort=pushed&per_page=100`,
      { headers },
    ),
  ]);

  if (profileRes.status === 403 || reposRes.status === 403) {
    throw new Error("GitHub rate limit reached — try again in a few minutes.");
  }
  if (!profileRes.ok || !reposRes.ok) {
    throw new Error("Couldn't reach GitHub right now.");
  }

  const rawProfile: unknown = await profileRes.json();
  const rawRepos: unknown = await reposRes.json();
  if (!isRawProfile(rawProfile) || !isRawRepoArray(rawRepos)) {
    throw new Error("GitHub returned an unexpected response.");
  }

  const data: GitHubData = {
    profile: {
      login: rawProfile.login,
      name: rawProfile.name,
      bio: rawProfile.bio,
      avatarUrl: rawProfile.avatar_url,
      htmlUrl: rawProfile.html_url,
      publicRepos: rawProfile.public_repos,
      followers: rawProfile.followers,
    },
    repos: rawRepos
      .filter((r) => !r.fork)
      .map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        htmlUrl: r.html_url,
        language: r.language,
        stargazersCount: r.stargazers_count,
        forksCount: r.forks_count,
        pushedAt: r.pushed_at,
        fork: r.fork,
        homepage: r.homepage,
      })),
  };

  writeCache(data);
  return data;
}

/** "2 days ago"-style label for repo activity. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.floor(months / 12)} yr ago`;
}
