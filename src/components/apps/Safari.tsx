"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BOOKMARKS,
  isUrlBlocked,
  type Bookmark,
} from "@/constants/safari-bookmarks";
import { SafariToolbar } from "./safari/SafariToolbar";
import { SafariStartPage } from "./safari/SafariStartPage";
import { useSystemStatus } from "@/lib/system-status";

export function Safari() {
  const { wifi } = useSystemStatus();
  const [inputUrl, setInputUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const filteredBookmarks = activeCategory
    ? BOOKMARKS.filter((b) => b.category === activeCategory)
    : BOOKMARKS;

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
      normalized = "https://" + normalized;
    }
    return normalized;
  };

  const navigateTo = useCallback((url: string) => {
    const normalizedUrl = normalizeUrl(url);
    setInputUrl(normalizedUrl);
    setError(null);

    if (isUrlBlocked(normalizedUrl)) {
      // Open blocked sites in new tab
      window.open(normalizedUrl, "_blank");
      return;
    }

    // Wi-Fi is toggleable from Control Center — while it's off, Safari is
    // genuinely offline.
    if (!wifi) {
      setCurrentUrl(normalizedUrl);
      setIsLoading(false);
      setError(
        "You are not connected to the internet. Turn on Wi-Fi in Control Center to browse.",
      );
      return;
    }

    setIsLoading(true);
    setCurrentUrl(normalizedUrl);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(normalizedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, wifi]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      navigateTo(inputUrl);
    }
  };

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setInputUrl(url);
      setCurrentUrl(url);
      setIsLoading(true);
    }
  }, [history, historyIndex]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setInputUrl(url);
      setCurrentUrl(url);
      setIsLoading(true);
    }
  }, [history, historyIndex]);

  const refresh = useCallback(() => {
    if (currentUrl) {
      setIsLoading(true);
      // Force reload by temporarily clearing the URL
      const url = currentUrl;
      setCurrentUrl(null);
      setTimeout(() => setCurrentUrl(url), 50);
    }
  }, [currentUrl]);

  const goHome = useCallback(() => {
    setCurrentUrl(null);
    setInputUrl("");
    setError(null);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError("This page cannot be displayed in Safari. Click to open in a new tab.");
  }, []);

  const handleBookmarkClick = (bookmark: Bookmark) => {
    if (isUrlBlocked(bookmark.url)) {
      window.open(bookmark.url, "_blank");
    } else {
      navigateTo(bookmark.url);
    }
  };

  // Detect iframe load errors
  useEffect(() => {
    if (!currentUrl || !iframeRef.current) return;

    const timeout = setTimeout(() => {
      // If still loading after 10s, assume it failed
      if (isLoading) {
        setIsLoading(false);
        setError("Page took too long to load or cannot be displayed.");
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [currentUrl, isLoading]);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <SafariToolbar
        inputUrl={inputUrl}
        setInputUrl={setInputUrl}
        historyIndex={historyIndex}
        historyLength={history.length}
        currentUrl={currentUrl}
        isLoading={isLoading}
        onSubmit={handleSubmit}
        onBack={goBack}
        onForward={goForward}
        onRefresh={refresh}
        onGoHome={goHome}
      />

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentUrl ? (
            <motion.div
              key="browser"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Loading overlay */}
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    className="absolute inset-0 bg-[#1e1e1e] z-10 flex items-center justify-center"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <motion.div
                        className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span className="text-sm text-white/50">Loading...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error state */}
              {error && (
                <div className="absolute inset-0 bg-[#1e1e1e] z-10 flex items-center justify-center">
                  <div className="text-center max-w-md px-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-white/60 mb-4">{error}</p>
                    <button
                      onClick={() => window.open(currentUrl, "_blank")}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      Open in New Tab
                    </button>
                  </div>
                </div>
              )}

              {/* Iframe — unmounted while an error page is shown so an
                  offline navigation never actually hits the network. */}
              {!error && (
                <iframe
                  ref={iframeRef}
                  src={currentUrl}
                  className="w-full h-full border-0 bg-white"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                  title="Safari Browser"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="start"
              className="absolute inset-0 overflow-auto p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SafariStartPage
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
                bookmarks={filteredBookmarks}
                onBookmarkClick={handleBookmarkClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
