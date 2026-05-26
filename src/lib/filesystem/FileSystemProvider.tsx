"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { FileSystemContextType, FileSystemItem } from "./types";
import { generateId, getIconForFileType } from "./filesystem-utils";
import { STORAGE_KEY, createDefaultFileSystem } from "./filesystem-seed";

const FileSystemContext = createContext<FileSystemContextType | null>(null);

export function useFileSystem(): FileSystemContextType {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error("useFileSystem must be used within FileSystemProvider");
  }
  return context;
}

interface FileSystemProviderProps {
  children: ReactNode;
}

export function FileSystemProvider({ children }: FileSystemProviderProps) {
  const [rawItems, setRawItems] = useLocalStorage<FileSystemItem[] | null>(
    STORAGE_KEY,
    null,
  );

  // Hydrate Date objects from JSON strings on read; fall back to the seed file
  // system when nothing was stored. Cheap enough to do on every render.
  const items: FileSystemItem[] =
    rawItems === null
      ? createDefaultFileSystem()
      : rawItems.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          modifiedAt: new Date(item.modifiedAt),
        }));

  const setItems = useCallback(
    (next: FileSystemItem[] | ((prev: FileSystemItem[]) => FileSystemItem[])) => {
      setRawItems((prev) => {
        const base =
          prev === null
            ? createDefaultFileSystem()
            : prev.map((item) => ({
                ...item,
                createdAt: new Date(item.createdAt),
                modifiedAt: new Date(item.modifiedAt),
              }));
        return typeof next === "function" ? next(base) : next;
      });
    },
    [setRawItems],
  );

  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  );

  const getChildren = useCallback(
    (parentId: string | null) => items.filter((item) => item.parentId === parentId),
    [items],
  );

  const getPath = useCallback(
    (id: string): FileSystemItem[] => {
      const path: FileSystemItem[] = [];
      let current = items.find((item) => item.id === id);

      while (current) {
        path.unshift(current);
        if (current.parentId === null) break;
        current = items.find((item) => item.id === current!.parentId);
      }

      return path;
    },
    [items],
  );

  const createFolder = useCallback(
    (name: string, parentId: string | null): FileSystemItem => {
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
    },
    [setItems],
  );

  const createFile = useCallback(
    (
      name: string,
      parentId: string | null,
      content: string = "",
    ): FileSystemItem => {
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
    },
    [setItems],
  );

  const createLink = useCallback(
    (name: string, parentId: string | null, url: string): FileSystemItem => {
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
    },
    [setItems],
  );

  const updateItem = useCallback(
    (
      id: string,
      updates: Partial<Pick<FileSystemItem, "name" | "content" | "url">>,
    ) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                icon: updates.name
                  ? getIconForFileType(updates.name, item.type)
                  : item.icon,
                modifiedAt: new Date(),
              }
            : item,
        ),
      );
    },
    [setItems],
  );

  const deleteItem = useCallback(
    (id: string) => {
      // Delete item plus every descendant. Folders cascade; files leaf-delete.
      const toDelete = new Set<string>([id]);
      const collect = (parentId: string) => {
        items.forEach((item) => {
          if (item.parentId === parentId) {
            toDelete.add(item.id);
            if (item.type === "folder") collect(item.id);
          }
        });
      };
      collect(id);
      setItems((prev) => prev.filter((item) => !toDelete.has(item.id)));
    },
    [items, setItems],
  );

  const moveItem = useCallback(
    (id: string, newParentId: string | null) => {
      // Refuse to move into self or any descendant — would create a cycle.
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
            : item,
        ),
      );
    },
    [items, setItems],
  );

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
