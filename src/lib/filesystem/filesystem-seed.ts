import type { FileSystemItem } from "./types";
import { BASKETBALL, PROFILE } from "@/constants/profile";

// v4: bumped when the seed content changes so returning visitors whose
// localStorage holds the old snapshot pick up the new files.
export const STORAGE_KEY = "desktop-portfolio-fs-v7";

/**
 * Seed data used when localStorage is empty. Root nodes appear in Finder's
 * top level and in Spotlight. Folder children appear when navigated into.
 */
export function createDefaultFileSystem(): FileSystemItem[] {
  const now = new Date();
  return [
    {
      id: "documents",
      name: "Documents",
      type: "folder",
      icon: "📁",
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "projects",
      name: "Projects",
      type: "folder",
      icon: "📂",
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "basketball-folder",
      name: "Basketball",
      type: "folder",
      icon: "🏀",
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "games-folder",
      name: "Games",
      type: "folder",
      icon: "🕹️",
      parentId: null,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "game-rematch",
      name: "Fighting Game",
      type: "app",
      icon: "🥊",
      parentId: "games-folder",
      appId: "rematch",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "game-arbhunter",
      name: "Arb Hunter",
      type: "app",
      icon: "📈",
      parentId: "games-folder",
      appId: "arbhunter",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "readme",
      name: "README.txt",
      type: "file",
      icon: "📄",
      parentId: null,
      content: `Hey, I'm Owen 👋

Welcome to my desktop. This is a macOS-inspired portfolio I built with
Next.js, React, TypeScript, and Framer Motion.

The rule around here: nothing you could read on my resume. That's what
Resume.pdf is for — one double-click away. The desktop is for the stuff
a PDF can't do.

Things to try:
- Open Projects to browse my GitHub live
- Watch my senior-year mixtape in the Basketball app
- Open Videos for demos of things I've shipped
- Play my high school Fighting Game — remastered to run right on this desktop
- Beat the books in Arb Hunter
- Type 'neofetch' in the Terminal

- Owen`,
      createdAt: now,
      modifiedAt: now,
    },
    // Root: resume opens in the Preview app via its url.
    {
      id: "resume",
      name: "Resume.pdf",
      type: "file",
      icon: "📋",
      parentId: null,
      url: PROFILE.resumePath,
      createdAt: now,
      modifiedAt: now,
    },
    // Documents folder contents
    {
      id: "notes",
      name: "Notes",
      type: "folder",
      icon: "📁",
      parentId: "documents",
      createdAt: now,
      modifiedAt: now,
    },
    // Movies folder — entries open in the Videos app (url = playlist id).
    {
      id: "movies",
      name: "Movies",
      type: "folder",
      icon: "🎬",
      parentId: "documents",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "movie-agent-roi",
      name: "agent-roi.mp4",
      type: "file",
      icon: "🎬",
      parentId: "movies",
      url: "agent-roi",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "movie-local-compute",
      name: "local-compute.mp4",
      type: "file",
      icon: "🎬",
      parentId: "movies",
      url: "local-compute",
      createdAt: now,
      modifiedAt: now,
    },
    // Basketball folder contents
    {
      id: "bball-stats",
      name: "season-stats.txt",
      type: "file",
      icon: "🏀",
      parentId: "basketball-folder",
      content: `${PROFILE.name} — #${BASKETBALL.jerseyNumber} · ${BASKETBALL.position} · ${BASKETBALL.height}
${BASKETBALL.school} ${BASKETBALL.team} (${BASKETBALL.schoolCity}), Class of ${BASKETBALL.classYear}
${BASKETBALL.role} · ${BASKETBALL.season}

${BASKETBALL.stats.map((s) => `${s.label.padEnd(4)} ${s.value}`).join("\n")}

Honors:
${BASKETBALL.achievements.map((a) => `- ${a}`).join("\n")}

Full stats: ${BASKETBALL.maxprepsUrl}`,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "bball-mixtape",
      name: "parker-mixtape.mp4",
      type: "file",
      icon: "🎬",
      parentId: "basketball-folder",
      url: "hoops-mixtape",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "bball-maxpreps",
      name: "MaxPreps Profile",
      type: "link",
      icon: "🔗",
      parentId: "basketball-folder",
      url: BASKETBALL.maxprepsUrl,
      createdAt: now,
      modifiedAt: now,
    },
    // Projects folder contents — READMEs for side projects the resume
    // doesn't cover, plus a link to the live GitHub view for everything else.
    {
      id: "project-jarvis",
      name: "jarvis",
      type: "folder",
      icon: "📂",
      parentId: "projects",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "project-jarvis-readme",
      name: "README.md",
      type: "file",
      icon: "📄",
      parentId: "project-jarvis",
      content: `# JARVIS

My personal AI assistant ecosystem: a high-performance Python
orchestrator with an NLP scheduling engine, a home server that talks to
my Roku TV, lights, and cameras, plus QML and React front-ends.

## Repos
- jarvis-server — orchestrator + scheduling engine
- home-server — Roku / lights / camera control
- jarvis-web-interface, jarvis-qml-gui, jarvis-app — front-ends

https://github.com/${PROFILE.githubUsername}/jarvis-server`,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "project-quill",
      name: "quill-compiler",
      type: "folder",
      icon: "📂",
      parentId: "projects",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "project-quill-readme",
      name: "README.md",
      type: "file",
      icon: "📄",
      parentId: "project-quill",
      content: `# Quill Compiler

A high-performance compiler for the Quill programming language, built
with C++ and LLVM. Features comprehensive optimization passes and an
extensive benchmarking suite.

https://github.com/${PROFILE.githubUsername}/quill-compiler`,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "projects-github-link",
      name: "All repos on GitHub",
      type: "link",
      icon: "🔗",
      parentId: "projects",
      url: PROFILE.githubUrl,
      createdAt: now,
      modifiedAt: now,
    },
    // Links
    {
      id: "github-link",
      name: "GitHub",
      type: "link",
      icon: "🔗",
      parentId: null,
      url: PROFILE.githubUrl,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "linkedin-link",
      name: "LinkedIn",
      type: "link",
      icon: "🔗",
      parentId: null,
      url: PROFILE.linkedinUrl,
      createdAt: now,
      modifiedAt: now,
    },
  ];
}
