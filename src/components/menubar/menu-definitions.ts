import type { MenuItem } from "./MenuDropdown";
// Type-only import — erased at compile time, so no runtime cycle with the app
// registry (which imports app components, not the menu bar).
import type { AppId } from "@/constants/apps";

interface WindowInfo {
  id: string;
  title: string;
  appId: string;
}

/**
 * Callbacks the menu items wire actions to. Everything is optional — an item
 * whose callback is missing renders disabled, so partial wiring degrades
 * gracefully instead of silently doing nothing.
 */
export interface MenuActions {
  onAbout?: () => void;
  /** Open an app window (Settings, TextEdit, …), optionally with an argument. */
  onOpenApp?: (appId: AppId, title?: string, arg?: string | null) => void;
  /** Open a Finder window pointed at a folder id (null = Desktop root). */
  onOpenFinderAt?: (title: string, folderId: string | null) => void;
  onNewWindow?: () => void;
  onCloseWindow?: () => void;
  onMinimizeWindow?: () => void;
  onMinimizeAll?: () => void;
  onBringAllToFront?: () => void;
  onFocusWindow?: (id: string) => void;
  onSpotlight?: () => void;
  onSleep?: () => void;
  onRestart?: () => void;
  onShutDown?: () => void;
}

export interface MenuContext extends MenuActions {
  activeWindowId?: string | null;
  windows: WindowInfo[];
}

export interface MenuBarMenu {
  id: string;
  label: string;
  /** Apple menu uses the logo, so the label is the bare icon — we mark this
   *  so the renderer knows not to render `label` as text. */
  isAppleLogo?: boolean;
  buildItems: (ctx: MenuContext) => MenuItem[];
}

/** Finder locations surfaced in the Go menu: label → seeded folder id. */
const GO_LOCATIONS: readonly { label: string; folderId: string | null }[] = [
  { label: "Computer", folderId: null },
  { label: "Documents", folderId: "documents" },
  { label: "Movies", folderId: "movies" },
  { label: "Projects", folderId: "projects" },
  { label: "Games", folderId: "games-folder" },
];

/**
 * Top-of-screen menu bar definitions. Items are functions of context (open
 * windows, handlers) so dynamic menus like "Window" rebuild cheaply on every
 * render. Items without a real implementation stay `disabled` — everything
 * else performs the action it advertises (Sleep sleeps, Restart reboots,
 * Go opens Finder at that location, etc.).
 */
export const MENU_BAR_MENUS: readonly MenuBarMenu[] = [
  {
    id: "apple",
    label: "Apple",
    isAppleLogo: true,
    buildItems: ({ onAbout, onOpenApp, onSleep, onRestart, onShutDown }) => [
      { label: "About This Mac", action: onAbout },
      { divider: true, label: "" },
      {
        label: "System Preferences...",
        action: onOpenApp && (() => onOpenApp("settings")),
        disabled: !onOpenApp,
      },
      { label: "App Store...", disabled: true },
      { divider: true, label: "" },
      { label: "Sleep", action: onSleep, disabled: !onSleep },
      { label: "Restart...", action: onRestart, disabled: !onRestart },
      { label: "Shut Down...", action: onShutDown, disabled: !onShutDown },
    ],
  },
  {
    id: "file",
    label: "File",
    buildItems: ({ onNewWindow, onCloseWindow, activeWindowId }) => [
      {
        label: "New Window",
        shortcut: "⌘N",
        action: onNewWindow,
        disabled: !onNewWindow,
      },
      {
        label: "Close Window",
        shortcut: "⌘W",
        action: onCloseWindow,
        disabled: !activeWindowId,
      },
      { divider: true, label: "" },
      { label: "Get Info", shortcut: "⌘I", disabled: true },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    // Global clipboard/undo can't be faked meaningfully in the browser, so
    // the Edit menu stays honest: present, but disabled.
    buildItems: () => [
      { label: "Undo", shortcut: "⌘Z", disabled: true },
      { label: "Redo", shortcut: "⇧⌘Z", disabled: true },
      { divider: true, label: "" },
      { label: "Cut", shortcut: "⌘X", disabled: true },
      { label: "Copy", shortcut: "⌘C", disabled: true },
      { label: "Paste", shortcut: "⌘V", disabled: true },
      { label: "Select All", shortcut: "⌘A", disabled: true },
    ],
  },
  {
    id: "view",
    label: "View",
    // Finder owns its own view controls in-window; these stay disabled.
    buildItems: () => [
      { label: "as Icons", disabled: true },
      { label: "as List", disabled: true },
      { label: "as Columns", disabled: true },
      { divider: true, label: "" },
      { label: "Show Sidebar", disabled: true },
      { label: "Hide Toolbar", disabled: true },
    ],
  },
  {
    id: "go",
    label: "Go",
    buildItems: ({ onOpenFinderAt }) => [
      { label: "Back", shortcut: "⌘[", disabled: true },
      { label: "Forward", shortcut: "⌘]", disabled: true },
      { divider: true, label: "" },
      ...GO_LOCATIONS.map(({ label, folderId }) => ({
        label,
        action: onOpenFinderAt && (() => onOpenFinderAt(label, folderId)),
        disabled: !onOpenFinderAt,
      })),
    ],
  },
  {
    id: "window",
    label: "Window",
    buildItems: ({
      windows,
      activeWindowId,
      onMinimizeWindow,
      onMinimizeAll,
      onBringAllToFront,
      onFocusWindow,
    }) => [
      {
        label: "Minimize",
        shortcut: "⌘M",
        action: onMinimizeWindow,
        disabled: !activeWindowId || !onMinimizeWindow,
      },
      {
        label: "Minimize All",
        action: onMinimizeAll,
        disabled: windows.length === 0,
      },
      { divider: true, label: "" },
      {
        label: "Bring All to Front",
        action: onBringAllToFront,
        disabled: windows.length === 0 || !onBringAllToFront,
      },
      ...(windows.length > 0
        ? [
            { divider: true, label: "" },
            ...windows.map((w) => ({
              label: (w.id === activeWindowId ? "✓ " : "   ") + w.title,
              action: () => onFocusWindow?.(w.id),
            })),
          ]
        : []),
    ],
  },
  {
    id: "help",
    label: "Help",
    buildItems: ({ onSpotlight, onOpenApp }) => [
      {
        label: "Search",
        shortcut: "⌘Space",
        action: onSpotlight,
        disabled: !onSpotlight,
      },
      { divider: true, label: "" },
      {
        label: "Portfolio README",
        action: onOpenApp && (() => onOpenApp("textedit", "README.txt", "readme")),
        disabled: !onOpenApp,
      },
    ],
  },
];
