"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_ICONS, type BrandIconId } from "@/constants/brand-icons";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  iconId: BrandIconId;
  category: string;
}

const BOOKMARKS: Bookmark[] = [
  // Social
  { id: "github", title: "GitHub", url: "https://github.com/ostepan", iconId: "github", category: "Social" },
  { id: "linkedin", title: "LinkedIn", url: "https://linkedin.com/in/ostepan", iconId: "linkedin", category: "Social" },
  { id: "twitter", title: "Twitter / X", url: "https://x.com", iconId: "twitter", category: "Social" },

  // Development
  { id: "stackoverflow", title: "Stack Overflow", url: "https://stackoverflow.com", iconId: "stackoverflow", category: "Development" },
  { id: "vercel", title: "Vercel", url: "https://vercel.com", iconId: "vercel", category: "Development" },
  { id: "nextjs", title: "Next.js Docs", url: "https://nextjs.org/docs", iconId: "nextjs", category: "Development" },

  // Learning
  { id: "mdn", title: "MDN Web Docs", url: "https://developer.mozilla.org", iconId: "mdn", category: "Learning" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com", iconId: "youtube", category: "Learning" },

  // Sites that work well in iframes
  { id: "wikipedia", title: "Wikipedia", url: "https://en.wikipedia.org", iconId: "wikipedia", category: "Learning" },
  { id: "hn", title: "Hacker News", url: "https://news.ycombinator.com", iconId: "hackernews", category: "News" },
];

// Sites known to block iframes
const BLOCKED_SITES = [
  "github.com",
  "linkedin.com",
  "twitter.com",
  "x.com",
  "google.com",
  "facebook.com",
  "instagram.com",
];

const CATEGORIES = Array.from(new Set(BOOKMARKS.map((b) => b.category)));

export function Safari() {
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

  const isUrlBlocked = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return BLOCKED_SITES.some((blocked) => hostname.includes(blocked));
    } catch {
      return false;
    }
  };

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

    setIsLoading(true);
    setCurrentUrl(normalizedUrl);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(normalizedUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

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
      {/* URL bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={"p-1.5 rounded transition-colors " +
              (historyIndex > 0 ? "hover:bg-white/10 text-white/70" : "text-white/30 cursor-default")}
            onClick={goBack}
            disabled={historyIndex <= 0}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            className={"p-1.5 rounded transition-colors " +
              (historyIndex < history.length - 1 ? "hover:bg-white/10 text-white/70" : "text-white/30 cursor-default")}
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 focus-within:border-blue-500/50 focus-within:bg-white/8 transition-colors">
          {isLoading ? (
            <motion.div
              className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : currentUrl ? (
            <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 bg-transparent text-white/90 text-sm outline-none placeholder-white/40"
            placeholder="Search or enter website address"
          />
          {inputUrl && (
            <button
              type="button"
              onClick={() => setInputUrl("")}
              className="p-0.5 rounded hover:bg-white/10 text-white/40 hover:text-white/60"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="button"
          className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
          onClick={currentUrl ? refresh : undefined}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {currentUrl && (
          <button
            type="button"
            className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
            onClick={goHome}
            title="Start Page"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        )}
      </form>

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

              {/* Iframe */}
              <iframe
                ref={iframeRef}
                src={currentUrl}
                className="w-full h-full border-0 bg-white"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                title="Safari Browser"
              />
            </motion.div>
          ) : (
            <motion.div
              key="start"
              className="absolute inset-0 overflow-auto p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="max-w-3xl mx-auto">
                {/* Category tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  <button
                    className={
                      "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
                      (!activeCategory
                        ? "bg-blue-500 text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20")
                    }
                    onClick={() => setActiveCategory(null)}
                  >
                    All
                  </button>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      className={
                        "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors " +
                        (activeCategory === category
                          ? "bg-blue-500 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20")
                      }
                      onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Favorites grid */}
                <h2 className="text-lg font-semibold text-white mb-4">Favorites</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
                  {filteredBookmarks.map((bookmark, index) => {
                    const blocked = isUrlBlocked(bookmark.url);
                    return (
                      <motion.button
                        key={bookmark.id}
                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group relative"
                        onClick={() => handleBookmarkClick(bookmark)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d={BRAND_ICONS[bookmark.iconId]} />
                          </svg>
                        </div>
                        <span className="text-sm text-white/80 text-center line-clamp-1">{bookmark.title}</span>
                        {blocked && (
                          <span className="absolute top-2 right-2 text-[10px] text-white/40">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quick help */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-white/50 text-center">
                    Some sites block embedding. Sites marked with <span className="inline-block align-middle"><svg className="w-3 h-3 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></span> will open in a new tab.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
