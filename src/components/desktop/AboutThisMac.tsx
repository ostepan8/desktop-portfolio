"use client";

import { motion, AnimatePresence } from "framer-motion";

interface AboutThisMacProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutThisMac({ isOpen, onClose }: AboutThisMacProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[540px] rounded-xl overflow-hidden"
            style={{
              backgroundColor: "rgba(40, 40, 42, 0.95)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(255, 255, 255, 0.1)",
            }}
            initial={{ opacity: 0, scale: 0.95, y: "-48%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-48%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-3 h-3 rounded-full bg-[#ff5f57] hover:bg-[#ff5f57]/80 transition-colors group"
            >
              <span className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center">
                <svg className="w-[6px] h-[6px] text-black/80" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" />
                </svg>
              </span>
            </button>

            {/* Content */}
            <div className="p-8 pt-12 text-center">
              {/* macOS Logo */}
              <div className="flex justify-center mb-4">
                <svg className="w-24 h-24" viewBox="0 0 24 24" fill="url(#mac-gradient)">
                  <defs>
                    <linearGradient id="mac-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6dd5fa" />
                      <stop offset="50%" stopColor="#2980b9" />
                      <stop offset="100%" stopColor="#667db6" />
                    </linearGradient>
                  </defs>
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>

              {/* System Name */}
              <h1 className="text-2xl font-normal text-white mb-1">macOS Portfolio</h1>
              <p className="text-sm text-white/60 mb-6">Version 1.0</p>

              {/* System Info */}
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-left max-w-xs mx-auto">
                <div className="text-sm text-white/50 text-right">Chip</div>
                <div className="text-sm text-white">Apple M3 Pro</div>

                <div className="text-sm text-white/50 text-right">Memory</div>
                <div className="text-sm text-white">18 GB</div>

                <div className="text-sm text-white/50 text-right">Startup Disk</div>
                <div className="text-sm text-white">Macintosh HD</div>

                <div className="text-sm text-white/50 text-right">Serial Number</div>
                <div className="text-sm text-white font-mono text-xs">WEB-PORTFOLIO-2024</div>

                <div className="text-sm text-white/50 text-right">Built With</div>
                <div className="text-sm text-white">Next.js + React</div>
              </div>

              {/* Links */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40">
                  A portfolio project showcasing web development skills
                </p>
                <div className="flex justify-center gap-4 mt-3">
                  <a
                    href="https://github.com/ostepan8/desktop-portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    View Source
                  </a>
                  <span className="text-white/20">|</span>
                  <a
                    href="#"
                    className="text-xs text-blue-400 hover:underline"
                  >
                    Contact
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
