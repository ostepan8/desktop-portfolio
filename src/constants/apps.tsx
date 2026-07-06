import type { ReactNode } from "react";
import {
  AboutIcon,
  ArbHunterIcon,
  BasketballAppIcon,
  FinderIcon,
  GitHubIcon,
  PreviewIcon,
  RematchIcon,
  SafariIcon,
  SettingsIcon,
  TerminalIcon,
  TextEditIcon,
  VideosIcon,
} from "@/components/icons/AppIcons";
import {
  AboutMe,
  ArbHunter,
  Basketball,
  FightingGame,
  Finder,
  GitHubApp,
  PdfViewer,
  Safari,
  Settings,
  Terminal,
  TextEdit,
  VideoPlayer,
} from "@/components/apps";
import type { FileSystemItem } from "@/lib/filesystem";

export type AppId =
  | "finder"
  | "safari"
  | "about"
  | "github"
  | "videos"
  | "basketball"
  | "rematch"
  | "arbhunter"
  | "pdfviewer"
  | "terminal"
  | "textedit"
  | "settings";

interface IconProps {
  size?: number;
  className?: string;
}

/** Helpers the registry can reach into the page-level shell with. */
export interface AppLaunchContext {
  /** Initial argument passed to the app (file/folder id, etc.). */
  initialArg?: string | null;
  /** Open another app, optionally with a custom title and initial argument. */
  openApp: (appId: AppId, title?: string, initialArg?: string | null) => void;
}

export interface AppDefinition {
  id: AppId;
  /** Title shown in dock, menubar, Spotlight. */
  label: string;
  /** Component that renders the squircle app icon. */
  Icon: React.ComponentType<IconProps>;
  /** Description shown in Spotlight rows. */
  subtitle: string;
  /** Initial window dimensions. */
  defaultWidth: number;
  defaultHeight: number;
  minWidth: number;
  minHeight: number;
  /** Surface in the dock by default. */
  inDock: boolean;
  /** Surface in Spotlight search. */
  searchable: boolean;
  /** Instantiate the app's body. */
  render: (ctx: AppLaunchContext) => ReactNode;
}

/** Route a Finder file to the right viewer app based on its extension. */
function openFileFromFinder(
  item: FileSystemItem,
  openApp: AppLaunchContext["openApp"],
): void {
  // App shortcuts in the fake FS launch their app directly.
  if (item.type === "app" && item.appId) {
    openApp(item.appId as AppId, item.name);
    return;
  }
  const ext = item.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") {
    openApp("pdfviewer", item.name, item.url ?? null);
    return;
  }
  if (["mp4", "mov", "webm", "m4v"].includes(ext)) {
    // initialArg is the playlist entry id stored on the file's url field.
    openApp("videos", item.name, item.url ?? null);
    return;
  }
  openApp("textedit", item.name, item.id);
}

/**
 * Unified app registry. Collapses four scattered mappings that used to live in
 * page.tsx (DOCK_ITEMS + the openAppWindow if/else + AppContent placeholder),
 * Spotlight (SEARCHABLE_ITEMS), and the AppIconMap. Add a new app here and it
 * automatically becomes available in the dock, Spotlight, and the window
 * manager.
 */
export const APPS: Record<AppId, AppDefinition> = {
  finder: {
    id: "finder",
    label: "Finder",
    Icon: FinderIcon,
    subtitle: "File browser",
    defaultWidth: 800,
    defaultHeight: 500,
    minWidth: 600,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: ({ initialArg, openApp }) => (
      // Finder hands opened files off by type: PDFs → Preview, videos →
      // Videos, everything else → TextEdit. Folders navigate within Finder.
      <Finder
        initialPath={initialArg ?? null}
        onOpenFile={(item) => openFileFromFinder(item, openApp)}
      />
    ),
  },
  safari: {
    id: "safari",
    label: "Safari",
    Icon: SafariIcon,
    subtitle: "Web browser",
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: () => <Safari />,
  },
  about: {
    id: "about",
    label: "About Me",
    Icon: AboutIcon,
    subtitle: "Personal info",
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: () => <AboutMe />,
  },
  github: {
    id: "github",
    label: "Projects",
    Icon: GitHubIcon,
    subtitle: "Live from GitHub",
    defaultWidth: 780,
    defaultHeight: 560,
    minWidth: 420,
    minHeight: 320,
    inDock: true,
    searchable: true,
    render: () => <GitHubApp />,
  },
  videos: {
    id: "videos",
    label: "Videos",
    Icon: VideosIcon,
    subtitle: "Video player",
    defaultWidth: 820,
    defaultHeight: 520,
    minWidth: 480,
    minHeight: 320,
    inDock: true,
    searchable: true,
    render: ({ initialArg }) => (
      <VideoPlayer initialVideoId={initialArg ?? undefined} />
    ),
  },
  basketball: {
    id: "basketball",
    label: "Basketball",
    Icon: BasketballAppIcon,
    subtitle: "High school hoops career",
    defaultWidth: 620,
    defaultHeight: 640,
    minWidth: 400,
    minHeight: 400,
    inDock: true,
    searchable: true,
    render: ({ openApp }) => (
      <Basketball
        onWatchMixtape={() =>
          openApp("videos", "Owen's Parker Mixtape", "hoops-mixtape")
        }
      />
    ),
  },
  rematch: {
    id: "rematch",
    label: "Fighting Game",
    Icon: RematchIcon,
    subtitle: "My 2022 fighter, remastered — plus the 2026 rebuild",
    // 16:9 stage + top bar: sized so the 1024x576 game scales cleanly.
    defaultWidth: 1000,
    defaultHeight: 640,
    minWidth: 560,
    minHeight: 400,
    inDock: true,
    searchable: true,
    render: () => <FightingGame />,
  },
  arbhunter: {
    id: "arbhunter",
    label: "Arb Hunter",
    Icon: ArbHunterIcon,
    subtitle: "Spot the arbitrage before it closes",
    defaultWidth: 760,
    defaultHeight: 560,
    minWidth: 520,
    minHeight: 420,
    inDock: true,
    searchable: true,
    render: () => <ArbHunter />,
  },
  pdfviewer: {
    id: "pdfviewer",
    label: "Preview",
    Icon: PreviewIcon,
    subtitle: "Resume & documents",
    defaultWidth: 720,
    defaultHeight: 640,
    minWidth: 400,
    minHeight: 360,
    inDock: false,
    searchable: true,
    render: ({ initialArg }) => (
      <PdfViewer src={initialArg ?? undefined} />
    ),
  },
  terminal: {
    id: "terminal",
    label: "Terminal",
    Icon: TerminalIcon,
    subtitle: "Command line",
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: () => <Terminal />,
  },
  textedit: {
    id: "textedit",
    label: "TextEdit",
    Icon: TextEditIcon,
    subtitle: "Text editor",
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: ({ initialArg }) => (
      <TextEdit fileId={initialArg ?? undefined} />
    ),
  },
  settings: {
    id: "settings",
    label: "Settings",
    Icon: SettingsIcon,
    subtitle: "System preferences",
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: () => <Settings />,
  },
};

/** All apps in dock display order. */
export const APP_LIST: readonly AppDefinition[] = [
  APPS.finder,
  APPS.safari,
  APPS.about,
  APPS.github,
  APPS.videos,
  APPS.basketball,
  APPS.rematch,
  APPS.arbhunter,
  APPS.pdfviewer,
  APPS.terminal,
  APPS.textedit,
  APPS.settings,
];

export const DOCK_APPS: readonly AppDefinition[] = APP_LIST.filter((a) => a.inDock);
export const SEARCHABLE_APPS: readonly AppDefinition[] = APP_LIST.filter((a) => a.searchable);
