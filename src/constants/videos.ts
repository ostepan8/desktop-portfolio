/**
 * Playlist for the Videos app. Files live in /public/videos. To add a video,
 * drop the .mp4 in public/videos and add an entry here — the player groups
 * the playlist by `category` in the order entries appear.
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
  // ── Basketball ──────────────────────────────────────────────────────
  {
    id: "hoops-mixtape",
    title: "Owen's Parker Mixtape",
    description: "Senior season mixtape — #0 for the Francis W. Parker Colonels varsity.",
    src: "/videos/hoops-mixtape.mp4",
    category: "Basketball",
    duration: "5:14",
  },
  // ── Subconscious demos ──────────────────────────────────────────────
  {
    id: "subconscious-promo",
    title: "Subconscious Promo",
    description: "30-second promo spot for the Subconscious agent platform.",
    src: "/videos/subconscious-promo.mp4",
    category: "Subconscious",
    duration: "0:30",
  },
  {
    id: "subconscious-demo",
    title: "Subconscious Platform Demo",
    description: "Walkthrough of the Subconscious agent platform.",
    src: "/videos/subconscious-demo.mp4",
    category: "Subconscious",
    duration: "1:06",
  },
  {
    id: "degree-planner-demo",
    title: "AI Degree Planner",
    description: "Agent that reads university catalogs and plans a full degree, semester by semester.",
    src: "/videos/degree-planner-demo.mp4",
    category: "Subconscious",
    duration: "1:08",
  },
  {
    id: "resume-tailor-demo",
    title: "Resume Tailor",
    description: "Generating role-specific resumes from stored experience with Subconscious agents.",
    src: "/videos/resume-tailor-demo.mp4",
    category: "Subconscious",
    duration: "1:22",
  },
  {
    id: "receipt-agent-demo",
    title: "Receipt Tracker Agent",
    description: "Reducto + Subconscious agent that categorizes spending from receipts.",
    src: "/videos/receipt-agent-demo.mp4",
    category: "Subconscious",
    duration: "0:49",
  },
  {
    id: "e2b-demo",
    title: "E2B CLI",
    description: "Subconscious agents running code in E2B sandboxes from the command line.",
    src: "/videos/e2b-demo.mp4",
    category: "Subconscious",
    duration: "1:24",
  },
  {
    id: "coop-demo",
    title: "Subconscious Co-op",
    description: "Teaser for Subconscious Co-op, one of five demo products from my co-op.",
    src: "/videos/coop-demo.mp4",
    category: "Subconscious",
    duration: "0:20",
  },
  {
    id: "trigger-demo",
    title: "Trigger Automations",
    description: "Kicking off Subconscious agent runs from external triggers.",
    src: "/videos/trigger-demo.mp4",
    category: "Subconscious",
    duration: "0:59",
  },
  {
    id: "orbit-demo",
    title: "Orbit × Subconscious",
    description: "Orbit working with Subconscious agents end to end.",
    src: "/videos/orbit-demo.mp4",
    category: "Subconscious",
    duration: "3:29",
  },
  {
    id: "n8n-demo",
    title: "n8n × Subconscious",
    description: "Wiring Subconscious agents into n8n workflow automations.",
    src: "/videos/n8n-demo.mp4",
    category: "Subconscious",
    duration: "3:46",
  },
  {
    id: "convex-demo",
    title: "Convex App Demo",
    description: "Subconscious-powered app built on Convex.",
    src: "/videos/convex-demo.mp4",
    category: "Subconscious",
    duration: "1:10",
  },
  {
    id: "elevenlabs-demo",
    title: "ElevenLabs Voice Demo",
    description: "Agent demo with ElevenLabs voice narration.",
    src: "/videos/elevenlabs-demo.mp4",
    category: "Subconscious",
    duration: "0:30",
  },
  // ── Explainers ──────────────────────────────────────────────────────
  {
    id: "agent-roi",
    title: "The ROI of AI Agents",
    description: "Motion-graphics explainer on when agents actually pay for themselves.",
    src: "/videos/agent-roi.mp4",
    category: "Explainers",
    duration: "0:50",
  },
  {
    id: "coding-agents",
    title: "Coding Agents",
    description: "How autonomous coding agents plan, implement, and ship.",
    src: "/videos/coding-agents.mp4",
    category: "Explainers",
    duration: "1:20",
  },
  {
    id: "gpu-fleet",
    title: "GPU Fleet",
    description: "Animated breakdown of running inference across a GPU fleet.",
    src: "/videos/gpu-fleet.mp4",
    category: "Explainers",
    duration: "1:37",
  },
  {
    id: "local-compute",
    title: "Local Compute",
    description: "Why on-device inference is having a moment — animated breakdown.",
    src: "/videos/local-compute.mp4",
    category: "Explainers",
    duration: "0:56",
  },
];
