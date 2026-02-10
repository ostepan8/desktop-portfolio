// Window types
export interface WindowState {
  id: string;
  title: string;
  appId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

// File system types
export interface FileSystemItem {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'app' | 'link';
  icon?: string;
  content?: string;
  url?: string;
  children?: string[]; // IDs of child items for folders
  parentId?: string;
  createdAt: Date;
  modifiedAt: Date;
}

// Desktop icon types
export interface DesktopIcon {
  id: string;
  itemId: string; // Reference to FileSystemItem
  x: number;
  y: number;
  isSelected: boolean;
}

// Dock item types
export interface DockItem {
  id: string;
  appId: string;
  icon: string;
  label: string;
  isRunning: boolean;
}

// App types
export type AppId = 
  | 'finder'
  | 'terminal'
  | 'textedit'
  | 'safari'
  | 'about'
  | 'projects'
  | 'settings';

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  minWidth?: number;
  minHeight?: number;
  resizable?: boolean;
}

// Context menu types
export interface ContextMenuItem {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
  divider?: boolean;
  disabled?: boolean;
}

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
}
