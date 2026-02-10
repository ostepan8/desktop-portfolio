"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useFileSystem, type FileSystemItem } from "@/lib/filesystem";

interface FinderProps {
  initialPath?: string | null;
  onOpenFile?: (item: FileSystemItem) => void;
}

export function Finder({ initialPath = null, onOpenFile }: FinderProps) {
  const { items, getChildren, getPath, getItem, createFolder } = useFileSystem();
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(initialPath);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"icons" | "list">("icons");
  const [searchQuery, setSearchQuery] = useState("");

  // Get current folder's children
  const currentChildren = useMemo(() => {
    const children = getChildren(currentFolderId);
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
      );
    }
    return children.sort((a, b) => {
      // Folders first, then alphabetical
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [currentFolderId, getChildren, items, searchQuery]);

  // Get breadcrumb path
  const breadcrumbs = useMemo(() => {
    if (!currentFolderId) return [];
    return getPath(currentFolderId);
  }, [currentFolderId, getPath]);

  // Sidebar favorites
  const favorites = useMemo(() => {
    return [
      { id: null, name: "Desktop", icon: "🖥️" },
      { id: "documents", name: "Documents", icon: "📁" },
      { id: "projects", name: "Projects", icon: "📂" },
    ];
  }, []);

  const handleItemClick = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey || e.metaKey) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    } else {
      setSelectedIds(new Set([id]));
    }
  }, []);

  const handleItemDoubleClick = useCallback((item: FileSystemItem) => {
    if (item.type === "folder") {
      setCurrentFolderId(item.id);
      setSelectedIds(new Set());
      setSearchQuery("");
    } else if (item.type === "link" && item.url) {
      window.open(item.url, "_blank");
    } else {
      onOpenFile?.(item);
    }
  }, [onOpenFile]);

  const handleBackgroundClick = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const navigateUp = useCallback(() => {
    if (currentFolderId) {
      const currentFolder = getItem(currentFolderId);
      setCurrentFolderId(currentFolder?.parentId ?? null);
      setSelectedIds(new Set());
    }
  }, [currentFolderId, getItem]);

  const handleNewFolder = useCallback(() => {
    const name = prompt("Enter folder name:");
    if (name?.trim()) {
      createFolder(name.trim(), currentFolderId);
    }
  }, [createFolder, currentFolderId]);

  return (
    <div className="h-full flex bg-[#1e1e1e] text-white">
      {/* Sidebar */}
      <aside className="w-48 bg-[#252526] border-r border-white/10 flex flex-col">
        <div className="p-2 text-xs text-white/40 uppercase tracking-wider font-medium">
          Favorites
        </div>
        {favorites.map((fav) => (
          <button
            key={fav.id ?? "desktop"}
            className={
              "flex items-center gap-2 px-3 py-1.5 text-sm transition-colors " +
              (currentFolderId === fav.id && !searchQuery
                ? "bg-[#0058d1] text-white"
                : "text-white/80 hover:bg-white/5")
            }
            onClick={() => {
              setCurrentFolderId(fav.id);
              setSearchQuery("");
              setSelectedIds(new Set());
            }}
          >
            <span>{fav.icon}</span>
            <span>{fav.name}</span>
          </button>
        ))}

        <div className="mt-4 p-2 text-xs text-white/40 uppercase tracking-wider font-medium">
          Locations
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/80 hover:bg-white/5"
          onClick={() => {
            setCurrentFolderId(null);
            setSearchQuery("");
          }}
        >
          <span>💻</span>
          <span>Macintosh HD</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="h-10 bg-[#2d2d2d] border-b border-white/10 flex items-center px-2 gap-2">
          {/* Navigation */}
          <button
            className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
            onClick={navigateUp}
            disabled={currentFolderId === null}
            title="Go back"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-sm flex-1 min-w-0">
            <button
              className="text-white/60 hover:text-white shrink-0"
              onClick={() => {
                setCurrentFolderId(null);
                setSearchQuery("");
              }}
            >
              Macintosh HD
            </button>
            {breadcrumbs.map((item, index) => (
              <span key={item.id} className="flex items-center gap-1">
                <span className="text-white/30">/</span>
                <button
                  className={
                    index === breadcrumbs.length - 1
                      ? "text-white truncate"
                      : "text-white/60 hover:text-white truncate"
                  }
                  onClick={() => {
                    setCurrentFolderId(item.id);
                    setSearchQuery("");
                  }}
                >
                  {item.name}
                </button>
              </span>
            ))}
          </div>

          {/* View mode toggle */}
          <div className="flex bg-white/5 rounded overflow-hidden">
            <button
              className={
                "p-1.5 " + (viewMode === "icons" ? "bg-white/10" : "hover:bg-white/5")
              }
              onClick={() => setViewMode("icons")}
              title="Icon view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              className={
                "p-1.5 " + (viewMode === "list" ? "bg-white/10" : "hover:bg-white/5")
              }
              onClick={() => setViewMode("list")}
              title="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <rect x="1" y="2" width="14" height="2" rx="0.5" />
                <rect x="1" y="7" width="14" height="2" rx="0.5" />
                <rect x="1" y="12" width="14" height="2" rx="0.5" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 h-7 pl-7 pr-2 rounded bg-white/5 border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30"
            />
            <svg
              className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Actions */}
          <button
            className="p-1.5 rounded hover:bg-white/10"
            onClick={handleNewFolder}
            title="New Folder"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* File list */}
        <div
          className="flex-1 overflow-auto p-4"
          onClick={handleBackgroundClick}
        >
          {currentChildren.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/40">
              {searchQuery ? "No results found" : "This folder is empty"}
            </div>
          ) : viewMode === "icons" ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4">
              {currentChildren.map((item) => (
                <FileItem
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  viewMode="icons"
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-0.5">
              {/* List header */}
              <div className="flex items-center gap-4 px-2 py-1 text-xs text-white/40 border-b border-white/10">
                <span className="flex-1">Name</span>
                <span className="w-32">Date Modified</span>
                <span className="w-20">Kind</span>
              </div>
              {currentChildren.map((item) => (
                <FileItem
                  key={item.id}
                  item={item}
                  isSelected={selectedIds.has(item.id)}
                  viewMode="list"
                  onClick={(e) => handleItemClick(item.id, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="h-6 bg-[#2d2d2d] border-t border-white/10 flex items-center px-3 text-xs text-white/50">
          {currentChildren.length} item{currentChildren.length !== 1 ? "s" : ""}
          {selectedIds.size > 0 && `, ${selectedIds.size} selected`}
        </div>
      </div>
    </div>
  );
}

interface FileItemProps {
  item: FileSystemItem;
  isSelected: boolean;
  viewMode: "icons" | "list";
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

function FileItem({ item, isSelected, viewMode, onClick, onDoubleClick }: FileItemProps) {
  if (viewMode === "icons") {
    return (
      <motion.div
        className={
          "flex flex-col items-center gap-1 p-2 rounded-lg cursor-default select-none " +
          (isSelected ? "bg-white/10" : "hover:bg-white/5")
        }
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-4xl">{item.icon}</span>
        <span
          className={
            "text-xs text-center line-clamp-2 break-all max-w-[72px] px-1 rounded " +
            (isSelected ? "bg-[#0058d1]" : "")
          }
        >
          {item.name}
        </span>
      </motion.div>
    );
  }

  // List view
  const dateStr = item.modifiedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const kindLabels: Record<string, string> = {
    folder: "Folder",
    file: "Document",
    image: "Image",
    link: "Alias",
    app: "Application",
  };

  return (
    <motion.div
      className={
        "flex items-center gap-4 px-2 py-1 rounded cursor-default select-none " +
        (isSelected ? "bg-[#0058d1]" : "hover:bg-white/5")
      }
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-lg shrink-0">{item.icon}</span>
        <span className="text-sm truncate">{item.name}</span>
      </div>
      <span className="w-32 text-xs text-white/50 shrink-0">{dateStr}</span>
      <span className="w-20 text-xs text-white/50 shrink-0">{kindLabels[item.type]}</span>
    </motion.div>
  );
}
