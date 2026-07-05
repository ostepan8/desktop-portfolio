import type { DesktopIconData } from "@/components/desktop/DesktopIcons";

/**
 * Default icons that render on the desktop. The page-level shell wires each
 * id to an action via DESKTOP_ICON_TARGETS in app/page.tsx — keep the ids in
 * sync with that map.
 *
 * Emoji `icon` field is unused (the renderer maps `type` to a squircle SVG
 * component from AppIcons), but kept for parity with other icon-bearing
 * shapes in the project.
 */
export const DEFAULT_DESKTOP_ICONS: DesktopIconData[] = [
  { id: "macintosh-hd", label: "Macintosh HD", icon: "💻", type: "drive" },
  { id: "documents", label: "Documents", icon: "📁", type: "folder" },
  { id: "projects", label: "Projects", icon: "📂", type: "folder" },
  { id: "resume", label: "Resume.pdf", icon: "📋", type: "file" },
  { id: "basketball", label: "Basketball", icon: "🏀", type: "app", appId: "basketball" },
  { id: "videos", label: "Videos", icon: "🎬", type: "app", appId: "videos" },
  { id: "rematch", label: "Rematch!", icon: "🥊", type: "app", appId: "rematch" },
  { id: "arbhunter", label: "Arb Hunter", icon: "📈", type: "app", appId: "arbhunter" },
  { id: "readme", label: "README.txt", icon: "📄", type: "file" },
];
