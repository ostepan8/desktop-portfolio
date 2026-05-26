import type { FileType } from "./types";

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

const EXTENSION_ICONS: Record<string, string> = {
  txt: "📄",
  md: "📄",
  markdown: "📄",
  pdf: "📋",
  jpg: "🖼️",
  jpeg: "🖼️",
  png: "🖼️",
  gif: "🖼️",
  webp: "🖼️",
  js: "📜",
  ts: "📜",
  jsx: "📜",
  tsx: "📜",
  json: "📦",
  html: "🌐",
  css: "🌐",
};

export function getIconForFileType(name: string, type: FileType): string {
  if (type === "folder") return "📁";
  if (type === "link") return "🔗";
  if (type === "app") return "📱";
  if (type === "image") return "🖼️";

  const ext = name.split(".").pop()?.toLowerCase();
  return (ext && EXTENSION_ICONS[ext]) || "📄";
}
