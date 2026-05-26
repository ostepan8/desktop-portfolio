"use client";

import { motion } from "framer-motion";
import { BRAND_ICONS } from "@/constants/brand-icons";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import {
  CATEGORIES,
  isUrlBlocked,
  type Bookmark,
} from "@/constants/safari-bookmarks";

interface SafariStartPageProps {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  bookmarks: Bookmark[];
  onBookmarkClick: (bookmark: Bookmark) => void;
}

export function SafariStartPage({
  activeCategory,
  onCategoryChange,
  bookmarks,
  onBookmarkClick,
}: SafariStartPageProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Category tabs */}
      <div className="mb-6">
        <SegmentedControl
          items={[
            { value: "__all__", label: "All" },
            ...CATEGORIES.map((c) => ({ value: c, label: c })),
          ]}
          value={activeCategory ?? "__all__"}
          onChange={(next) =>
            onCategoryChange(next === "__all__" ? null : next)
          }
          accent="blue"
        />
      </div>

      {/* Favorites grid */}
      <h2 className="text-lg font-semibold text-white mb-4">Favorites</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
        {bookmarks.map((bookmark, index) => {
          const blocked = isUrlBlocked(bookmark.url);
          return (
            <motion.button
              key={bookmark.id}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group relative"
              onClick={() => onBookmarkClick(bookmark)}
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
  );
}
