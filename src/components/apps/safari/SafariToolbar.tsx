"use client";

import { motion } from "framer-motion";

interface SafariToolbarProps {
  inputUrl: string;
  setInputUrl: (value: string) => void;
  historyIndex: number;
  historyLength: number;
  currentUrl: string | null;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  onForward: () => void;
  onRefresh: () => void;
  onGoHome: () => void;
}

export function SafariToolbar({
  inputUrl,
  setInputUrl,
  historyIndex,
  historyLength,
  currentUrl,
  isLoading,
  onSubmit,
  onBack,
  onForward,
  onRefresh,
  onGoHome,
}: SafariToolbarProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2 px-3 py-2 bg-[#2d2d2d] border-b border-white/10">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={"p-1.5 rounded transition-colors " +
            (historyIndex > 0 ? "hover:bg-white/10 text-white/70" : "text-white/30 cursor-default")}
          onClick={onBack}
          disabled={historyIndex <= 0}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          className={"p-1.5 rounded transition-colors " +
            (historyIndex < historyLength - 1 ? "hover:bg-white/10 text-white/70" : "text-white/30 cursor-default")}
          onClick={onForward}
          disabled={historyIndex >= historyLength - 1}
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
        onClick={currentUrl ? onRefresh : undefined}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

      {currentUrl && (
        <button
          type="button"
          className="p-1.5 rounded hover:bg-white/10 text-white/50 hover:text-white/80 transition-colors"
          onClick={onGoHome}
          title="Start Page"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      )}
    </form>
  );
}
