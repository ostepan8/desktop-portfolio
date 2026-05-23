"use client";

import { motion } from "framer-motion";

interface SocialLink {
  name: string;
  icon: string;
  url: string;
  color: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    name: "GitHub",
    icon: "M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z",
    url: "https://github.com/ostepan",
    color: "#333",
  },
  {
    name: "LinkedIn",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
    url: "https://linkedin.com/in/ostepan",
    color: "#0A66C2",
  },
  {
    name: "Twitter",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    url: "https://x.com/ostepan",
    color: "#1DA1F2",
  },
  {
    name: "Email",
    icon: "M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z",
    url: "mailto:oleg@owen-stepan.com",
    color: "#EA4335",
  },
];

const SKILLS = [
  "React", "TypeScript", "Next.js", "Node.js",
  "Python", "PostgreSQL", "AWS", "Docker",
];

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
            className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/30"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            👨‍💻
          </motion.div>

          {/* Name */}
          <motion.h1
            className="text-3xl font-bold text-white mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Oleg Stepanenko
          </motion.h1>

          {/* Title */}
          <motion.p
            className="text-lg text-purple-300 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Full Stack Developer
          </motion.p>

          {/* Bio */}
          <motion.p
            className="text-white/70 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Passionate about building beautiful, performant web experiences.
            I love turning complex problems into simple, elegant solutions.
            When I&apos;m not coding, you&apos;ll find me exploring new technologies
            or contributing to open source.
          </motion.p>
        </motion.div>

        {/* Stats/Info */}
        <motion.div
          className="grid grid-cols-3 gap-6 mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold text-white">5+</div>
            <div className="text-sm text-white/50">Years Experience</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold text-white">50+</div>
            <div className="text-sm text-white/50">Projects Completed</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm border border-white/10">
            <div className="text-2xl font-bold text-white">10k+</div>
            <div className="text-sm text-white/50">Lines of Code</div>
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-sm text-white/50 uppercase tracking-wider text-center mb-3">
            Technologies
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {SKILLS.map((skill, index) => (
              <motion.span
                key={skill}
                className="px-3 py-1.5 bg-white/10 rounded-full text-sm text-white/80 border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.05 }}
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          {SOCIAL_LINKS.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
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
                <path d={link.icon} />
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
          <p>Portfolio v1.0.0</p>
          <p className="mt-1">Built with Next.js, React & Framer Motion</p>
        </motion.div>
      </div>
    </div>
  );
}
