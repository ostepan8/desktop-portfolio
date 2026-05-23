"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: string;
}

const BOOKMARKS: Bookmark[] = [
  // Social
  { id: "github", title: "GitHub", url: "https://github.com/ostepan", icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z", category: "Social" },
  { id: "linkedin", title: "LinkedIn", url: "https://linkedin.com/in/ostepan", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", category: "Social" },
  { id: "twitter", title: "Twitter / X", url: "https://x.com", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", category: "Social" },

  // Development
  { id: "stackoverflow", title: "Stack Overflow", url: "https://stackoverflow.com", icon: "M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 16.203l10.438 2.18.444-2.131-10.437-2.18-.445 2.131zm1.38-5.062l9.66 4.5.924-2.02-9.66-4.5-.923 2.02zm2.677-4.823l8.188 6.81 1.38-1.657-8.188-6.81-1.38 1.657zm5.293-5.048L13.16 3.032l6.36 8.545 2.3-1.71-6.36-8.546z", category: "Development" },
  { id: "vercel", title: "Vercel", url: "https://vercel.com", icon: "M24 22.525H0l12-21.05 12 21.05z", category: "Development" },
  { id: "nextjs", title: "Next.js Docs", url: "https://nextjs.org/docs", icon: "M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z", category: "Development" },

  // Learning
  { id: "mdn", title: "MDN Web Docs", url: "https://developer.mozilla.org", icon: "M24 11.441c0-.906-.09-1.795-.27-2.66h-6.418v5.034h3.672a3.141 3.141 0 01-1.364 2.063v1.714h2.208c1.292-1.19 2.172-2.945 2.172-6.151zm-12 8.559c3.24 0 5.955-1.075 7.94-2.912l-2.21-1.714c-.88.59-2.005.938-3.73.938-2.87 0-5.3-1.938-6.168-4.542H1.62v1.77A12 12 0 0012 20zm-6.168-7.23a7.188 7.188 0 010-4.54V6.46H1.62A12.01 12.01 0 000 12c0 1.936.464 3.77 1.29 5.39l4.542-3.62z", category: "Learning" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", category: "Learning" },

  // Sites that work well in iframes
  { id: "wikipedia", title: "Wikipedia", url: "https://en.wikipedia.org", icon: "M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.436 0 .135.053.33.166.601 1.082 2.646 4.818 10.521 4.818 10.521l2.681-5.476-2.607-5.36c-.166-.41-.265-.651-.265-.799 0-.229.18-.396.554-.436l.659-.06c.166 0 .255-.06.255-.18v-.435l-.044-.045-4.33-.011-.52.011-.067.045v.456c0 .135.06.189.181.189l.473.029c.39.015.659.135.809.361.165.24.359.66.584 1.26l2.16 4.711 2.249-4.711c.15-.3.27-.57.359-.811.09-.24.135-.42.135-.54 0-.27-.18-.42-.539-.451l-.42-.045c-.135 0-.21-.06-.21-.181v-.434l.054-.045 4.049.011.359-.011.06.045v.449c0 .12-.075.181-.226.181-.81.03-1.273.27-1.396.72-.09.285-.27.705-.539 1.26l-2.366 4.924 2.851 5.679s3.639-7.459 4.918-10.227c.166-.36.24-.615.24-.765 0-.181-.18-.301-.539-.361l-.615-.074c-.165 0-.24-.061-.24-.181v-.434l.045-.045 4.244-.011.359.011.061.045v.449c0 .075-.061.135-.181.181-.495.061-.855.196-1.082.4-.24.21-.494.6-.764 1.156L16.871 13.12l-3.032 6.149c-.405.894-.723.876-1.125-.029-.754-1.7-1.66-3.75-2.624-6.121z", category: "Learning" },
  { id: "hn", title: "Hacker News", url: "https://news.ycombinator.com", icon: "M0 24V0h24v24H0zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896H6.951z", category: "News" },
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
                            <path d={bookmark.icon} />
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
