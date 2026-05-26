export type FileType = "folder" | "file" | "image" | "link" | "app";

export interface FileSystemItem {
  id: string;
  name: string;
  type: FileType;
  icon: string;
  parentId: string | null; // null = root
  content?: string; // For text files
  url?: string; // For links
  appId?: string; // For app shortcuts
  createdAt: Date;
  modifiedAt: Date;
}

export interface FileSystemContextType {
  items: FileSystemItem[];
  getItem: (id: string) => FileSystemItem | undefined;
  getChildren: (parentId: string | null) => FileSystemItem[];
  getPath: (id: string) => FileSystemItem[];
  createFolder: (name: string, parentId: string | null) => FileSystemItem;
  createFile: (name: string, parentId: string | null, content?: string) => FileSystemItem;
  createLink: (name: string, parentId: string | null, url: string) => FileSystemItem;
  updateItem: (
    id: string,
    updates: Partial<Pick<FileSystemItem, "name" | "content" | "url">>,
  ) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newParentId: string | null) => void;
}
