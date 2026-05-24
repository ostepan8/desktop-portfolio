import type { MenuItem } from "./MenuDropdown";

interface WindowInfo {
  id: string;
  title: string;
  appId: string;
}

/** Callbacks the menu items need to wire actions to. */
export interface MenuContext {
  onAbout?: () => void;
  onCloseWindow?: () => void;
  onMinimizeAll?: () => void;
  onFocusWindow?: (id: string) => void;
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

/**
 * Top-of-screen menu bar definitions. Was previously 130 lines of JSX in
 * MenuBar.tsx — moved here so MenuBar can map over data instead of writing
 * each dropdown by hand. The items are functions of context (open windows,
 * handlers) so we can rebuild dynamic menus like "Window" cheaply on every
 * render.
 */
export const MENU_BAR_MENUS: readonly MenuBarMenu[] = [
  {
    id: "apple",
    label: "Apple",
    isAppleLogo: true,
    buildItems: ({ onAbout }) => [
      { label: "About This Mac", action: onAbout },
      { divider: true, label: "" },
      { label: "System Preferences...", disabled: true },
      { label: "App Store...", disabled: true },
      { divider: true, label: "" },
      { label: "Sleep", disabled: true },
      { label: "Restart...", disabled: true },
      { label: "Shut Down...", disabled: true },
    ],
  },
  {
    id: "file",
    label: "File",
    buildItems: ({ onCloseWindow, activeWindowId }) => [
      { label: "New Window", shortcut: "⌘N", disabled: true },
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
    buildItems: () => [
      { label: "Back", shortcut: "⌘[", disabled: true },
      { label: "Forward", shortcut: "⌘]", disabled: true },
      { divider: true, label: "" },
      { label: "Computer", disabled: true },
      { label: "Home", shortcut: "⇧⌘H", disabled: true },
      { label: "Desktop", shortcut: "⇧⌘D", disabled: true },
      { label: "Documents", disabled: true },
      { label: "Downloads", disabled: true },
    ],
  },
  {
    id: "window",
    label: "Window",
    buildItems: ({ windows, activeWindowId, onMinimizeAll, onFocusWindow }) => [
      { label: "Minimize", shortcut: "⌘M", disabled: !activeWindowId },
      {
        label: "Minimize All",
        action: onMinimizeAll,
        disabled: windows.length === 0,
      },
      { divider: true, label: "" },
      { label: "Bring All to Front", disabled: true },
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
    buildItems: () => [
      { label: "Search", disabled: true },
      { divider: true, label: "" },
      { label: "macOS Help", disabled: true },
    ],
  },
];
