"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

// File system types
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

interface FileSystemContextType {
  items: FileSystemItem[];
  getItem: (id: string) => FileSystemItem | undefined;
  getChildren: (parentId: string | null) => FileSystemItem[];
  getPath: (id: string) => FileSystemItem[];
  createFolder: (name: string, parentId: string | null) => FileSystemItem;
  createFile: (name: string, parentId: string | null, content?: string) => FileSystemItem;
  createLink: (name: string, parentId: string | null, url: string) => FileSystemItem;
  updateItem: (id: string, updates: Partial<Pick<FileSystemItem, "name" | "content" | "url">>) => void;
  deleteItem: (id: string) => void;
  moveItem: (id: string, newParentId: string | null) => void;
}

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within FileSystemProvider");
  }
  return context;
}

// Default file system structure
function createDefaultFileSystem(): FileSystemItem[] {
  const now = new Date();
  return [
    // Root level items
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
      url: "https://github.com",
      createdAt: now,
      modifiedAt: now,
    },
    {
      id: "linkedin-link",
      name: "LinkedIn",
      type: "link",
      icon: "🔗",
      parentId: null,
      url: "https://linkedin.com",
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

const STORAGE_KEY = "desktop-portfolio-fs";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getIconForFileType(name: string, type: FileType): string {
  if (type === "folder") return "📁";
  if (type === "link") return "🔗";
  if (type === "app") return "📱";
  if (type === "image") return "🖼️";

  // Determine icon by file extension
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "txt":
    case "md":
    case "markdown":
      return "📄";
    case "pdf":
      return "📋";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return "🖼️";
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
      return "📜";
    case "json":
      return "📦";
    case "html":
    case "css":
      return "🌐";
    default:
      return "📄";
  }
}

interface FileSystemProviderProps {
  children: ReactNode;
}

export function FileSystemProvider({ children }: FileSystemProviderProps) {
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const restored = parsed.map((item: FileSystemItem) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          modifiedAt: new Date(item.modifiedAt),
        }));
        setItems(restored);
      } else {
        setItems(createDefaultFileSystem());
      }
    } catch (e) {
      console.error("Failed to load file system from localStorage:", e);
      setItems(createDefaultFileSystem());
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage when items change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Failed to save file system to localStorage:", e);
      }
    }
  }, [items, isLoaded]);

  const getItem = useCallback((id: string) => {
    return items.find((item) => item.id === id);
  }, [items]);

  const getChildren = useCallback((parentId: string | null) => {
    return items.filter((item) => item.parentId === parentId);
  }, [items]);

  const getPath = useCallback((id: string): FileSystemItem[] => {
    const path: FileSystemItem[] = [];
    let current = items.find((item) => item.id === id);

    while (current) {
      path.unshift(current);
      if (current.parentId === null) break;
      current = items.find((item) => item.id === current!.parentId);
    }

    return path;
  }, [items]);

  const createFolder = useCallback((name: string, parentId: string | null): FileSystemItem => {
    const now = new Date();
    const newFolder: FileSystemItem = {
      id: generateId(),
      name,
      type: "folder",
      icon: "📁",
      parentId,
      createdAt: now,
      modifiedAt: now,
    };
    setItems((prev) => [...prev, newFolder]);
    return newFolder;
  }, []);

  const createFile = useCallback((name: string, parentId: string | null, content: string = ""): FileSystemItem => {
    const now = new Date();
    const newFile: FileSystemItem = {
      id: generateId(),
      name,
      type: "file",
      icon: getIconForFileType(name, "file"),
      parentId,
      content,
      createdAt: now,
      modifiedAt: now,
    };
    setItems((prev) => [...prev, newFile]);
    return newFile;
  }, []);

  const createLink = useCallback((name: string, parentId: string | null, url: string): FileSystemItem => {
    const now = new Date();
    const newLink: FileSystemItem = {
      id: generateId(),
      name,
      type: "link",
      icon: "🔗",
      parentId,
      url,
      createdAt: now,
      modifiedAt: now,
    };
    setItems((prev) => [...prev, newLink]);
    return newLink;
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<Pick<FileSystemItem, "name" | "content" | "url">>) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              icon: updates.name ? getIconForFileType(updates.name, item.type) : item.icon,
              modifiedAt: new Date(),
            }
          : item
      )
    );
  }, []);

  const deleteItem = useCallback((id: string) => {
    // Delete item and all its descendants
    const toDelete = new Set<string>([id]);

    const findDescendants = (parentId: string) => {
      items.forEach((item) => {
        if (item.parentId === parentId) {
          toDelete.add(item.id);
          if (item.type === "folder") {
            findDescendants(item.id);
          }
        }
      });
    };

    findDescendants(id);
    setItems((prev) => prev.filter((item) => !toDelete.has(item.id)));
  }, [items]);

  const moveItem = useCallback((id: string, newParentId: string | null) => {
    // Prevent moving to self or descendant
    if (id === newParentId) return;

    const isDescendant = (parentId: string | null): boolean => {
      if (parentId === null) return false;
      if (parentId === id) return true;
      const parent = items.find((item) => item.id === parentId);
      return parent ? isDescendant(parent.parentId) : false;
    };

    if (isDescendant(newParentId)) return;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, parentId: newParentId, modifiedAt: new Date() }
          : item
      )
    );
  }, [items]);

  return (
    <FileSystemContext.Provider
      value={{
        items,
        getItem,
        getChildren,
        getPath,
        createFolder,
        createFile,
        createLink,
        updateItem,
        deleteItem,
        moveItem,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}
