import type { FileSystemItem } from "./types";

export const STORAGE_KEY = "desktop-portfolio-fs";

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
      id: "readme",
      name: "README.txt",
      type: "file",
      icon: "📄",
      parentId: null,
      content: `Welcome to my Desktop Portfolio!

This is a macOS-inspired personal website built with Next.js.

Feel free to explore:
- Double-click icons to open them
- Right-click for context menus
- Drag windows to move them
- Use the dock at the bottom

Built with love using React, TypeScript, and Framer Motion.

- Oleg`,
      createdAt: now,
      modifiedAt: now,
    },
    // Documents folder contents
    {
      id: "resume",
      name: "Resume.pdf",
      type: "file",
      icon: "📋",
      parentId: "documents",
      content: "Resume content goes here...",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "notes",
      name: "Notes",
      type: "folder",
      icon: "📁",
      parentId: "documents",
      createdAt: now,
      modifiedAt: now,
    },
    // Projects folder contents
    {
      id: "project-1",
      name: "Project Alpha",
      type: "folder",
      icon: "📂",
      parentId: "projects",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "project-2",
      name: "Project Beta",
      type: "folder",
      icon: "📂",
      parentId: "projects",
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
      url: "https://github.com/ostepan",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "linkedin-link",
      name: "LinkedIn",
      type: "link",
      icon: "🔗",
      parentId: null,
      url: "https://linkedin.com/in/ostepan",
      createdAt: now,
      modifiedAt: now,
    },
    // Project files
    {
      id: "project-1-readme",
      name: "README.md",
      type: "file",
      icon: "📄",
      parentId: "project-1",
      content: `# Project Alpha

A cool project I worked on.

## Features
- Feature 1
- Feature 2
- Feature 3

## Tech Stack
- React
- TypeScript
- Node.js`,
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "project-2-readme",
      name: "README.md",
      type: "file",
      icon: "📄",
      parentId: "project-2",
      content: `# Project Beta

Another awesome project.

## Overview
This project does amazing things.`,
      createdAt: now,
      modifiedAt: now,
    },
  ];
}
