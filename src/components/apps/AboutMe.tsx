"use client";

import { motion } from "framer-motion";
import { BRAND_ICONS } from "@/constants/brand-icons";
import { SOCIAL_LINKS } from "@/constants/social-links";
import {
  EXPERIENCE,
  PROFILE,
  PROFILE_STATS,
  SKILL_GROUPS,
} from "@/constants/profile";

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
            className="text-lg text-purple-300 mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {PROFILE.title}
          </motion.p>
          <motion.p
            className="text-sm text-white/50 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
          >
            {PROFILE.currentRole} · {PROFILE.location}
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

        {/* Stats/Info */}
        <motion.div
          className="grid grid-cols-3 gap-6 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {PROFILE_STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10"
            >
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Skills */}
        <motion.div
          className="mb-8 w-full max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {SKILL_GROUPS.map((group, groupIndex) => (
            <div key={group.label} className="mb-4">
              <h3 className="text-xs text-white/50 uppercase tracking-wider text-center mb-2">
                {group.label}
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {group.skills.map((skill, index) => (
                  <motion.span
                    key={skill}
                    className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-white/80 border border-white/10"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + groupIndex * 0.1 + index * 0.03 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Experience timeline */}
        <motion.div
          className="mb-8 w-full max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="text-xs text-white/50 uppercase tracking-wider text-center mb-3">
            Experience
          </h3>
          <div className="space-y-3">
            {EXPERIENCE.map((job, index) => (
              <motion.details
                key={job.company}
                className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.08 }}
                open={index === 0}
              >
                <summary className="cursor-pointer list-none px-4 py-3 hover:bg-white/5 transition-colors">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-white">
                      {job.role}
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-white/40">
                      {job.dates}
                    </span>
                  </div>
                  <div className="text-xs text-purple-300/90 mt-0.5">
                    {job.company} · {job.location}
                  </div>
                </summary>
                <ul className="px-4 pb-3 space-y-1.5">
                  {job.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="text-xs text-white/60 leading-relaxed pl-3 border-l border-purple-400/30"
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.details>
            ))}
          </div>
        </motion.div>

        {/* Resume button */}
        <motion.a
          href={PROFILE.resumePath}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-8 px-5 py-2.5 rounded-lg bg-purple-500 text-white text-sm font-semibold hover:bg-purple-400 transition-colors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          View Full Resume ↗
        </motion.a>

        {/* Social Links */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
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
              transition={{ delay: 0.9 + index * 0.1 }}
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
          transition={{ delay: 1.2 }}
        >
          <p>
            {PROFILE.school} · Class of {PROFILE.gradYear}
          </p>
          <p className="mt-1">Built with Next.js, React & Framer Motion</p>
        </motion.div>
      </div>
    </div>
  );
}
