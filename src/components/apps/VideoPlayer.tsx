"use client";

import { useMemo, useState } from "react";
import { VIDEOS, type VideoEntry } from "@/constants/videos";

interface VideoPlayerProps {
  /** id of the video to start on; defaults to the first in the playlist. */
  initialVideoId?: string;
}

/** Group the flat playlist by category, preserving first-seen order. */
function groupByCategory(
  videos: readonly VideoEntry[],
): { category: string; videos: VideoEntry[] }[] {
  return videos.reduce<{ category: string; videos: VideoEntry[] }[]>(
    (groups, video) => {
      const existing = groups.find((g) => g.category === video.category);
      if (existing) {
        return groups.map((g) =>
          g.category === video.category
            ? { ...g, videos: [...g.videos, video] }
            : g,
        );
      }
      return [...groups, { category: video.category, videos: [video] }];
    },
    [],
  );
}

/**
 * QuickTime-style video player: category-grouped playlist sidebar + native
 * <video> element. Content comes from src/constants/videos.ts.
 */
export function VideoPlayer({ initialVideoId }: VideoPlayerProps) {
  const initial = useMemo(
    () => VIDEOS.find((v) => v.id === initialVideoId) ?? VIDEOS[0] ?? null,
    [initialVideoId],
  );
  const groups = useMemo(() => groupByCategory(VIDEOS), []);
  const [current, setCurrent] = useState<VideoEntry | null>(initial);
  const [playbackError, setPlaybackError] = useState(false);

  if (VIDEOS.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 bg-black text-center p-8">
        <span className="text-5xl">🎬</span>
        <p className="text-white/80 font-medium">No videos yet</p>
        <p className="text-white/40 text-sm max-w-xs">
          Drop .mp4 files in public/videos and list them in src/constants/videos.ts.
        </p>
      </div>
    );
  }

  const selectVideo = (video: VideoEntry) => {
    setPlaybackError(false);
    setCurrent(video);
  };

  return (
    <div className="h-full flex flex-col sm:flex-row bg-black">
      {/* Playlist */}
      <div className="sm:w-60 shrink-0 max-h-48 sm:max-h-none sm:h-full overflow-auto bg-[var(--macos-bg)] border-b sm:border-b-0 sm:border-r border-white/10">
        {groups.map((group) => (
          <div key={group.category}>
            <div className="sticky top-0 bg-[var(--macos-bg)] px-3 pt-3 pb-1.5 text-[11px] uppercase tracking-wider text-white/40 font-semibold">
              {group.category}
            </div>
            {group.videos.map((video) => (
              <button
                key={video.id}
                onClick={() => selectVideo(video)}
                className={
                  "w-full text-left px-3 py-2.5 border-l-2 transition-colors " +
                  (current?.id === video.id
                    ? "border-[var(--macos-accent-bright)] bg-white/10"
                    : "border-transparent hover:bg-white/5")
                }
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-white/90 font-medium truncate">
                    {video.title}
                  </span>
                  <span className="ml-auto shrink-0 text-[10px] text-white/40">
                    {video.duration}
                  </span>
                </div>
                <p className="text-xs text-white/45 line-clamp-2 mt-0.5">
                  {video.description}
                </p>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Stage */}
      <div className="flex-1 min-h-0 flex flex-col">
        {current && !playbackError ? (
          <>
            <video
              key={current.id}
              src={current.src}
              controls
              autoPlay
              playsInline
              className="flex-1 min-h-0 w-full object-contain bg-black"
              onError={() => setPlaybackError(true)}
            />
            <div className="px-4 py-2 bg-[var(--macos-bg)] border-t border-white/10">
              <p className="text-sm text-white/90 font-medium">{current.title}</p>
              <p className="text-xs text-white/50">{current.description}</p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center p-8">
            <span className="text-4xl">⚠️</span>
            <p className="text-white/80 text-sm">
              Couldn&apos;t play {current?.title ?? "this video"}. The file may be
              missing from public/videos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
