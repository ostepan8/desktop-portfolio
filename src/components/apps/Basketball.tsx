"use client";

import { motion } from "framer-motion";
import { BASKETBALL, PROFILE } from "@/constants/profile";

interface BasketballProps {
  /** Opens the Videos app on the mixtape. Wired by the app registry. */
  onWatchMixtape?: () => void;
}

/**
 * Scoreboard-style card for Owen's high school basketball career.
 * Data lives in src/constants/profile.ts (sourced from MaxPreps).
 */
export function Basketball({ onWatchMixtape }: BasketballProps) {
  return (
    <div className="h-full overflow-auto bg-gradient-to-b from-[#1a0f08] via-[#241205] to-[#0d0603]">
      <div className="max-w-xl mx-auto p-6">
        {/* Jersey header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 shadow-lg shadow-orange-900/50 mb-4 relative">
            {/* Ball seams */}
            <svg viewBox="0 0 96 96" className="absolute inset-0 w-full h-full opacity-40">
              <path d="M48 0 V96 M0 48 H96 M8 14 Q48 48 8 82 M88 14 Q48 48 88 82" stroke="#7c2d12" strokeWidth="2.5" fill="none" />
            </svg>
            <span className="text-4xl font-black text-white relative">
              #{BASKETBALL.jerseyNumber}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{PROFILE.name}</h1>
          <p className="text-orange-300/90 text-sm font-medium mt-1">
            {BASKETBALL.position} · {BASKETBALL.height} · {BASKETBALL.role}
          </p>
          <p className="text-white/50 text-sm">
            {BASKETBALL.school} {BASKETBALL.team} · {BASKETBALL.schoolCity} · Class of{" "}
            {BASKETBALL.classYear}
          </p>
        </motion.div>

        {/* Season stat grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">
            {BASKETBALL.season}
          </h2>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {BASKETBALL.stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-xl p-3 text-center"
              >
                <div className="text-2xl font-bold text-white tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-orange-300/70 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">
            Honors
          </h2>
          <ul className="space-y-1.5">
            {BASKETBALL.achievements.map((achievement) => (
              <li
                key={achievement}
                className="flex items-start gap-2 text-sm text-white/75"
              >
                <span className="text-orange-400 mt-0.5">🏆</span>
                {achievement}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Notable games */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-6"
        >
          <h2 className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-2">
            Notable Games
          </h2>
          <div className="divide-y divide-white/5 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {BASKETBALL.notableGames.map((game) => (
              <div
                key={`${game.date}-${game.opponent}`}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <div className="text-sm text-white/90 font-medium">
                    vs {game.opponent}
                  </div>
                  <div className="text-xs text-white/40">{game.date}</div>
                </div>
                <div className="ml-auto text-xs text-orange-300/90 font-medium text-right shrink-0">
                  {game.note}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* MaxPreps link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 pb-4"
        >
          {onWatchMixtape && (
            <button
              onClick={onWatchMixtape}
              className="px-5 py-2.5 rounded-lg bg-white text-orange-950 text-sm font-semibold hover:bg-orange-100 transition-colors"
            >
              ▶ Watch the Mixtape
            </button>
          )}
          <a
            href={BASKETBALL.maxprepsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-orange-600 text-white text-sm font-semibold hover:bg-orange-500 transition-colors"
          >
            Full Stats on MaxPreps ↗
          </a>
        </motion.div>
      </div>
    </div>
  );
}
