import type { ReactNode } from "react";
import {
  AboutIcon,
  FinderIcon,
  ProjectsIcon,
  SafariIcon,
  SettingsIcon,
  TerminalIcon,
  TextEditIcon,
} from "@/components/icons/AppIcons";
import {
  AboutMe,
  Finder,
  Projects,
  Safari,
  Settings,
  Terminal,
  TextEdit,
} from "@/components/apps";

export type AppId =
  | "finder"
  | "safari"
  | "about"
  | "projects"
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
      // Finder is the only app that hands off opened files to another app.
      // Files open in TextEdit; folders navigate within Finder itself.
      <Finder
        initialPath={initialArg ?? null}
        onOpenFile={(item) => openApp("textedit", item.name, item.id)}
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
  APPS.terminal,
  APPS.textedit,
  APPS.settings,
];

export const DOCK_APPS: readonly AppDefinition[] = APP_LIST.filter((a) => a.inDock);
export const SEARCHABLE_APPS: readonly AppDefinition[] = APP_LIST.filter((a) => a.searchable);
