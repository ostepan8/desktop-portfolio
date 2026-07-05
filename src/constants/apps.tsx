import type { ReactNode } from "react";
import {
  AboutIcon,
  BasketballAppIcon,
  FinderIcon,
  GitHubIcon,
  PreviewIcon,
  ProjectsIcon,
  SafariIcon,
  SettingsIcon,
  TerminalIcon,
  TextEditIcon,
  VideosIcon,
} from "@/components/icons/AppIcons";
import {
  AboutMe,
  Basketball,
  Finder,
  GitHubApp,
  PdfViewer,
  Projects,
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
  | "projects"
  | "github"
  | "videos"
  | "basketball"
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
  projects: {
    id: "projects",
    label: "Projects",
    Icon: ProjectsIcon,
    subtitle: "Portfolio showcase",
    defaultWidth: 700,
    defaultHeight: 500,
    minWidth: 400,
    minHeight: 300,
    inDock: true,
    searchable: true,
    render: () => <Projects />,
  },
  github: {
    id: "github",
    label: "GitHub",
    Icon: GitHubIcon,
    subtitle: "Live repositories",
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
    render: () => <Basketball />,
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
  APPS.projects,
  APPS.github,
  APPS.videos,
  APPS.basketball,
  APPS.pdfviewer,
  APPS.terminal,
  APPS.textedit,
  APPS.settings,
];

export const DOCK_APPS: readonly AppDefinition[] = APP_LIST.filter((a) => a.inDock);
export const SEARCHABLE_APPS: readonly AppDefinition[] = APP_LIST.filter((a) => a.searchable);
