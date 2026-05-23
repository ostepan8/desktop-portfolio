"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useFileSystem, type FileSystemItem } from "@/lib/filesystem";
import { PromptDialog } from "@/components/ui/PromptDialog";

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
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  // Track which sidebar item is active for highlighting (avoids dual-highlight when both Desktop and Macintosh HD map to root)
  const [activeSidebarItem, setActiveSidebarItem] = useState<string | null>(initialPath === null ? "desktop" : null);

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
      { id: null as string | null, sidebarKey: "desktop", name: "Desktop", icon: "🖥️" },
      { id: "documents" as string | null, sidebarKey: "documents", name: "Documents", icon: "📁" },
      { id: "projects" as string | null, sidebarKey: "projects", name: "Projects", icon: "📂" },
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
      setActiveSidebarItem(null);
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
      setActiveSidebarItem(null);
      setSelectedIds(new Set());
    }
  }, [currentFolderId, getItem]);

  const handleNewFolder = useCallback(() => {
    setShowNewFolderDialog(true);
  }, []);

  const createNewFolder = useCallback(
    (rawName: string) => {
      const name = rawName.trim() || "untitled folder";
      createFolder(name, currentFolderId);
      setShowNewFolderDialog(false);
    },
    [createFolder, currentFolderId],
  );

  return (
    <div className="h-full flex bg-[#1e1e1e] text-white">
      {/* Sidebar */}
      <aside className="w-52 bg-[#1e1e1e]/50 backdrop-blur-xl border-r border-white/5 flex flex-col py-2">
        {/* Favorites Section */}
        <div className="px-4 py-1.5 text-[11px] text-white/40 uppercase tracking-wider font-semibold">
          Favorites
        </div>
        <div className="px-2">
          {favorites.map((fav) => (
            <button
              key={fav.sidebarKey}
              className={
                "w-full flex items-center gap-2.5 px-2 py-[5px] text-[13px] rounded-md transition-all " +
                (activeSidebarItem === fav.sidebarKey && !searchQuery
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/8 active:bg-white/12")
              }
              onClick={() => {
                setCurrentFolderId(fav.id);
                setActiveSidebarItem(fav.sidebarKey);
                setSearchQuery("");
                setSelectedIds(new Set());
              }}
            >
              <span className="text-[16px] w-5 text-center opacity-80">{fav.icon}</span>
              <span className="font-normal">{fav.name}</span>
            </button>
          ))}
        </div>

        {/* Locations Section */}
        <div className="mt-4 px-4 py-1.5 text-[11px] text-white/40 uppercase tracking-wider font-semibold">
          Locations
        </div>
        <div className="px-2">
          <button
            className={
              "w-full flex items-center gap-2.5 px-2 py-[5px] text-[13px] rounded-md transition-all " +
              (activeSidebarItem === "macintosh-hd" && !searchQuery
                ? "bg-white/15 text-white"
                : "text-white/80 hover:bg-white/8 active:bg-white/12")
            }
            onClick={() => {
              setCurrentFolderId(null);
              setActiveSidebarItem("macintosh-hd");
              setSearchQuery("");
            }}
          >
            <span className="text-[16px] w-5 text-center opacity-80">💻</span>
            <span className="font-normal">Macintosh HD</span>
          </button>
        </div>

        {/* Tags Section */}
        <div className="mt-4 px-4 py-1.5 text-[11px] text-white/40 uppercase tracking-wider font-semibold">
          Tags
        </div>
        <div className="px-2 space-y-0.5">
          {[
            { color: "#ff3b30", name: "Red" },
            { color: "#ff9500", name: "Orange" },
            { color: "#34c759", name: "Green" },
            { color: "#007aff", name: "Blue" },
            { color: "#af52de", name: "Purple" },
          ].map((tag) => (
            <button
              key={tag.name}
              className="w-full flex items-center gap-2.5 px-2 py-[5px] text-[13px] text-white/60 rounded-md hover:bg-white/8 transition-all"
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: tag.color }}
              />
              <span className="font-normal">{tag.name}</span>
            </button>
          ))}
        </div>
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
                setActiveSidebarItem("macintosh-hd");
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
                    setActiveSidebarItem(null);
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

      <PromptDialog
        isOpen={showNewFolderDialog}
        title="New Folder"
        placeholder="untitled folder"
        submitLabel="Create"
        onSubmit={createNewFolder}
        onCancel={() => setShowNewFolderDialog(false)}
      />
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
