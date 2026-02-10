"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon: string;
  category: string;
}

const BOOKMARKS: Bookmark[] = [
  // Social
  { id: "github", title: "GitHub", url: "https://github.com", icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z", category: "Social" },
  { id: "linkedin", title: "LinkedIn", url: "https://linkedin.com", icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z", category: "Social" },
  { id: "twitter", title: "Twitter / X", url: "https://twitter.com", icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z", category: "Social" },

  // Development
  { id: "stackoverflow", title: "Stack Overflow", url: "https://stackoverflow.com", icon: "M18.986 21.865v-6.404h2.134V24H1.844v-8.539h2.13v6.404h15.012zM6.111 16.203l10.438 2.18.444-2.131-10.437-2.18-.445 2.131zm1.38-5.062l9.66 4.5.924-2.02-9.66-4.5-.923 2.02zm2.677-4.823l8.188 6.81 1.38-1.657-8.188-6.81-1.38 1.657zm5.293-5.048L13.16 3.032l6.36 8.545 2.3-1.71-6.36-8.546z", category: "Development" },
  { id: "vercel", title: "Vercel", url: "https://vercel.com", icon: "M24 22.525H0l12-21.05 12 21.05z", category: "Development" },
  { id: "nextjs", title: "Next.js Docs", url: "https://nextjs.org/docs", icon: "M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.251 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.5-.054z", category: "Development" },

  // Learning
  { id: "mdn", title: "MDN Web Docs", url: "https://developer.mozilla.org", icon: "M24 11.441c0-.906-.09-1.795-.27-2.66h-6.418v5.034h3.672a3.141 3.141 0 01-1.364 2.063v1.714h2.208c1.292-1.19 2.172-2.945 2.172-6.151zm-12 8.559c3.24 0 5.955-1.075 7.94-2.912l-2.21-1.714c-.88.59-2.005.938-3.73.938-2.87 0-5.3-1.938-6.168-4.542H1.62v1.77A12 12 0 0012 20zm-6.168-7.23a7.188 7.188 0 010-4.54V6.46H1.62A12.01 12.01 0 000 12c0 1.936.464 3.77 1.29 5.39l4.542-3.62z", category: "Learning" },
  { id: "youtube", title: "YouTube", url: "https://youtube.com", icon: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z", category: "Learning" },
];

const CATEGORIES = Array.from(new Set(BOOKMARKS.map((b) => b.category)));

export function Safari() {
  const [currentUrl, setCurrentUrl] = useState("https://google.com");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredBookmarks = activeCategory
    ? BOOKMARKS.filter((b) => b.category === activeCategory)
    : BOOKMARKS;

  const handleBookmarkClick = (bookmark: Bookmark) => {
    setCurrentUrl(bookmark.url);
    window.open(bookmark.url, "_blank");
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* URL bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
          <svg className="w-3.5 h-3.5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <input
            type="text"
            value={currentUrl}
            onChange={(e) => setCurrentUrl(e.target.value)}
            className="flex-1 bg-transparent text-white/80 text-sm outline-none"
            placeholder="Search or enter website name"
          />
        </div>

        <button className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content - Favorites page */}
      <div className="flex-1 overflow-auto p-6">
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
          <div className="grid grid-cols-4 gap-4">
            {filteredBookmarks.map((bookmark, index) => (
              <motion.button
                key={bookmark.id}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                onClick={() => handleBookmarkClick(bookmark)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d={bookmark.icon} />
                  </svg>
                </div>
                <span className="text-sm text-white/80 text-center line-clamp-1">{bookmark.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Reading list section */}
          <h2 className="text-lg font-semibold text-white mt-8 mb-4">Quick Links</h2>
          <div className="space-y-2">
            {[
              { title: "My Portfolio", desc: "This site!", icon: "🏠" },
              { title: "View Source Code", desc: "Check out the GitHub repo", icon: "💻" },
              { title: "Contact Me", desc: "Get in touch", icon: "📧" },
            ].map((link, index) => (
              <motion.button
                key={link.title}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-left"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <span className="text-2xl">{link.icon}</span>
                <div>
                  <div className="text-white font-medium">{link.title}</div>
                  <div className="text-sm text-white/50">{link.desc}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
