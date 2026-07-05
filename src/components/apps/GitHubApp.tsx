"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PROFILE } from "@/constants/profile";
import {
  fetchGitHubData,
  timeAgo,
  LANGUAGE_COLORS,
  type GitHubData,
} from "@/lib/github";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: GitHubData };

/**
 * Live view of Owen's GitHub — profile header plus every public (non-fork)
 * repo, fetched client-side and cached for an hour.
 */
export function GitHubApp() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchGitHubData()
      .then((data) => {
        if (!cancelled) setState({ status: "ready", data });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Something went wrong.",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="h-full bg-[var(--macos-bg)] overflow-auto">
      {state.status === "loading" && <RepoSkeleton />}
      {state.status === "error" && <ErrorState message={state.message} />}
      {state.status === "ready" && <RepoList data={state.data} />}
    </div>
  );
}

function RepoSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/10" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-white/10 rounded" />
          <div className="h-3 w-64 bg-white/10 rounded" />
        </div>
      </div>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-20 bg-white/5 rounded-xl" />
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 p-8 text-center">
      <span className="text-4xl">📡</span>
      <p className="text-white/80 font-medium">{message}</p>
      <a
        href={PROFILE.githubUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 px-4 py-2 rounded-lg bg-[var(--macos-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
      >
        Open github.com/{PROFILE.githubUsername} instead
      </a>
    </div>
  );
}

function RepoList({ data }: { data: GitHubData }) {
  const { profile, repos } = data;
  return (
    <>
      {/* Profile header */}
      <div className="sticky top-0 z-10 bg-[var(--macos-bg)]/95 backdrop-blur-sm border-b border-white/10 p-5">
        <div className="flex items-center gap-4">
          {/* GitHub avatars are remote; plain img avoids next/image remote-domain config */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt={profile.name ?? profile.login}
            className="w-16 h-16 rounded-full border border-white/20"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-white">
              {profile.name ?? profile.login}
            </h1>
            {profile.bio && (
              <p className="text-sm text-white/60 truncate">{profile.bio}</p>
            )}
            <div className="flex gap-4 mt-1 text-xs text-white/50">
              <span>{repos.length} repositories</span>
              <span>{profile.followers} followers</span>
            </div>
          </div>
          <a
            href={profile.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            View Profile ↗
          </a>
        </div>
      </div>

      {/* Repo grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {repos.map((repo, index) => (
          <motion.a
            key={repo.id}
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.4) }}
            whileHover={{ y: -2 }}
            className="block bg-white/5 rounded-xl border border-white/10 p-4 hover:border-[var(--macos-accent-bright)]/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[var(--macos-accent-bright)] font-medium text-sm truncate">
                {repo.name}
              </span>
              {repo.stargazersCount > 0 && (
                <span className="ml-auto shrink-0 text-xs text-white/50">
                  ★ {repo.stargazersCount}
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 line-clamp-2 min-h-8">
              {repo.description ?? "No description"}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
              {repo.language && (
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor: LANGUAGE_COLORS[repo.language] ?? "#8e8e93",
                    }}
                  />
                  {repo.language}
                </span>
              )}
              <span>Updated {timeAgo(repo.pushedAt)}</span>
            </div>
          </motion.a>
        ))}
      </div>
    </>
  );
}
