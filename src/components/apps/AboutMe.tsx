"use client";

import { motion } from "framer-motion";
import { BRAND_ICONS } from "@/constants/brand-icons";
import { SOCIAL_LINKS } from "@/constants/social-links";
import { PROFILE } from "@/constants/profile";

/**
 * Deliberately NOT a resume. Credentials live in Resume.pdf (one click away);
 * this card is just who Owen is and where to look next.
 */
export function AboutMe() {
  return (
    <div className="h-full bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] overflow-auto">
      <div className="min-h-full flex flex-col items-center justify-center p-8">
        {/* Profile Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Avatar */}
          <motion.div
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl font-bold text-white shadow-2xl shadow-purple-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            OS
          </motion.div>

          {/* Name */}
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {PROFILE.name}
          </motion.h1>

          {/* Title */}
          <motion.p
            className="text-lg text-purple-300 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {PROFILE.title}
          </motion.p>

          {/* Bio */}
          <motion.p
            className="text-white/70 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {PROFILE.bio}
          </motion.p>
        </motion.div>

        {/* Where to look next — the desktop shows what the resume can't. */}
        <motion.div
          className="grid grid-cols-3 gap-3 mb-8 text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl mb-1">🐙</div>
            <div className="text-xs text-white/50">Live repos in the Projects app</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl mb-1">🎬</div>
            <div className="text-xs text-white/50">Demos I&apos;ve shipped, in Videos</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl mb-1">🏀</div>
            <div className="text-xs text-white/50">The mixtape, in Basketball</div>
          </div>
        </motion.div>

        {/* Resume button — the one pointer to credentials */}
        <motion.a
          href={PROFILE.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 px-5 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          The Credentials → Resume.pdf
        </motion.a>

        {/* Social Links */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {SOCIAL_LINKS.map((link, index) => (
            <motion.a
              key={link.id}
              href={link.url}
              target={link.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center transition-all hover:bg-white/20 hover:scale-110 border border-white/10"
              title={link.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={BRAND_ICONS[link.id]} />
              </svg>
            </motion.a>
          ))}
        </motion.div>

        {/* Version info like About This Mac */}
        <motion.div
          className="mt-8 text-center text-white/30 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          <p>Built with Next.js, React & Framer Motion</p>
        </motion.div>
      </div>
    </div>
  );
}
