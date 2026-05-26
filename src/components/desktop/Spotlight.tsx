"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppIcon } from "@/components/icons";
import { SEARCHABLE_APPS } from "@/constants/apps";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Z_INDEX } from "@/constants/layout";
import { modalBackdropVariants } from "@/constants/motion";
import { useKeyDown } from "@/hooks/useKeyDown";
import { useFileSystem } from "@/lib/filesystem";

interface SpotlightResult {
  id: string;
  type: "app" | "file" | "folder" | "action";
  name: string;
  subtitle?: string;
  icon?: string;
  appId?: string;
  action?: () => void;
}

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onOpenFile: (fileId: string) => void;
}

export function Spotlight({ isOpen, onClose, onOpenApp, onOpenFile }: SpotlightProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { items } = useFileSystem();

  const allItems = useMemo<SpotlightResult[]>(
    () => [
      ...SEARCHABLE_APPS.map((app) => ({
        id: app.id,
        type: "app" as const,
        name: app.label,
        subtitle: "Application",
        appId: app.id,
      })),
      ...items
        .filter(
          (item) =>
            item.id !== "macintosh-hd" &&
            (item.type === "folder" || item.type === "file"),
        )
        .map((item) => ({
          id: item.id,
          type: item.type as "folder" | "file",
          name: item.name,
          subtitle: item.type === "folder" ? "Folder" : "File",
        })),
    ],
    [items],
  );

  const results = query.trim()
    ? allItems
        .filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.subtitle?.toLowerCase().includes(query.toLowerCase()),
        )
        .slice(0, 8)
    : allItems.slice(0, 6);

  const handleSelect = useCallback((result: SpotlightResult) => {
    if (result.type === "app" && result.appId) {
      onOpenApp(result.appId);
    } else if (result.type === "file" || result.type === "folder") {
      onOpenFile(result.id);
    } else if (result.action) {
      result.action();
    }
    onClose();
    setQuery("");
    setSelectedIndex(0);
  }, [onOpenApp, onOpenFile, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useKeyDown(
    ["Escape", "ArrowDown", "ArrowUp", "Enter"],
    useCallback(
      (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        } else if (e.key === "Enter" && results.length > 0) {
          e.preventDefault();
          handleSelect(results[selectedIndex]);
        }
      },
      [onClose, results, selectedIndex, handleSelect],
    ),
    isOpen,
  );

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const getResultIcon = (result: SpotlightResult) => {
    if (result.type === "app" && result.appId) {
      return <AppIcon appId={result.appId} size={32} />;
    }
    if (result.type === "folder") {
      return (
        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
      );
    }
    if (result.type === "file") {
      return (
        <div className="w-8 h-8 rounded-lg bg-gray-500/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30"
            style={{ zIndex: Z_INDEX.spotlight }}
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          {/* Spotlight Dialog */}
          <motion.div
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-[680px] max-w-[90vw]"
            style={{ zIndex: Z_INDEX.spotlight + 1 }}
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <GlassPanel
              variant="sheet"
              className="rounded-xl overflow-hidden"
            >
            {/* Search Input */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-white/10">
              <svg className="w-6 h-6 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-xl text-white placeholder-white/30 outline-none"
                placeholder="Spotlight Search"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white/60"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Results */}
            <div className="max-h-[400px] overflow-auto">
              {results.length > 0 ? (
                <div className="py-2">
                  {!query && (
                    <div className="px-4 py-1.5 text-xs text-white/40 font-medium uppercase tracking-wider">
                      Top Results
                    </div>
                  )}
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      className={
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors " +
                        (index === selectedIndex
                          ? "bg-[var(--macos-accent-bright)]"
                          : "hover:bg-white/5")
                      }
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      {getResultIcon(result)}
                      <div className="flex-1 min-w-0">
                        <div className={"text-sm font-medium truncate " + (index === selectedIndex ? "text-white" : "text-white/90")}>
                          {result.name}
                        </div>
                        {result.subtitle && (
                          <div className={"text-xs truncate " + (index === selectedIndex ? "text-white/70" : "text-white/40")}>
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      {index === selectedIndex && (
                        <span className="text-xs text-white/60 bg-white/20 px-2 py-0.5 rounded">
                          ↵
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : query ? (
                <div className="py-8 text-center text-white/40">
                  No results for "{query}"
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between text-xs text-white/30">
              <span>Spotlight</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">↵</kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">esc</kbd>
                  to close
                </span>
              </div>
            </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
