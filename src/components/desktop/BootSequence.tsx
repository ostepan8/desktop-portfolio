"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [stage, setStage] = useState<"logo" | "progress" | "done">("logo");
  const [progress, setProgress] = useState(0);
  // Use a ref to avoid re-running effects when onComplete changes identity
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Check if we should skip the boot sequence
    if (typeof window !== "undefined") {
      const hasBooted = sessionStorage.getItem("hasBooted");
      if (hasBooted) {
        onCompleteRef.current();
        return;
      }
    }

    // Stage 1: Show logo for 1 second
    const logoTimer = setTimeout(() => {
      setStage("progress");
    }, 1000);

    return () => clearTimeout(logoTimer);
  }, []);

  useEffect(() => {
    if (stage !== "progress") return;

    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Variable speed to feel more realistic
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stage]);

  useEffect(() => {
    if (progress >= 100) {
      // Short delay then complete
      const timer = setTimeout(() => {
        setStage("done");
        // Mark as booted for this session
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hasBooted", "true");
        }
        // Delay a bit for fade out animation
        setTimeout(() => onCompleteRef.current(), 500);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <AnimatePresence>
      {stage !== "done" && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Apple Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg
              className="w-24 h-24 md:w-28 md:h-28"
              viewBox="0 0 24 24"
              fill="#f5f5f7"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </motion.div>

          {/* Progress bar */}
          <AnimatePresence>
            {stage === "progress" && (
              <motion.div
                className="mt-16 w-56"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-[5px] bg-[#3d3d3d] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#f5f5f7] rounded-full"
                    style={{
                      boxShadow: "0 0 8px rgba(255,255,255,0.3)",
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
