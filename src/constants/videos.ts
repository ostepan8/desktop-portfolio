/**
 * Playlist for the Videos app. Files live in /public/videos. To add a video
 * (e.g. a basketball highlight reel), drop the .mp4 in public/videos and add
 * an entry here — the player picks it up automatically.
 */
export interface VideoEntry {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly src: string;
  readonly category: string;
  /** Rough duration label shown in the playlist. */
  readonly duration: string;
}

export const VIDEOS: readonly VideoEntry[] = [
  {
    id: "agent-roi",
    title: "The ROI of AI Agents",
    description: "Motion-graphics explainer on when agents actually pay for themselves.",
    src: "/videos/agent-roi.mp4",
    category: "Explainers",
    duration: "0:50",
  },
  {
    id: "local-compute",
    title: "Local Compute",
    description: "Why on-device inference is having a moment — animated breakdown.",
    src: "/videos/local-compute.mp4",
    category: "Explainers",
    duration: "0:56",
  },
  // To add basketball highlights: drop the file at public/videos/hoops.mp4,
  // then uncomment and adjust:
  // {
  //   id: "hoops-highlights",
  //   title: "Basketball Highlights",
  //   description: "Senior season highlights — Francis W. Parker varsity, #0.",
  //   src: "/videos/hoops.mp4",
  //   category: "Basketball",
  //   duration: "2:00",
  // },
];
