"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  thumbnail: string;
  tech: string[];
  github?: string;
  demo?: string;
  featured?: boolean;
}

const GITHUB = "https://github.com/ostepan8";

const PROJECTS: Project[] = [
  {
    id: "desktop-portfolio",
    title: "Desktop Portfolio",
    description: "This site — a macOS desktop in the browser with windows, dock, and apps",
    longDescription: "The portfolio you're using right now. A full window management system, fake filesystem persisted to localStorage, working terminal, live GitHub integration, and a dock with magnification — all built from scratch.",
    thumbnail: "🖥️",
    tech: ["React", "Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    github: `${GITHUB}/desktop-portfolio`,
    demo: "https://owen-stepan.com",
    featured: true,
  },
  {
    id: "jarvis",
    title: "JARVIS",
    description: "Personal AI assistant that runs my home — TV, lights, cameras, schedule",
    longDescription: "A high-performance Python orchestrator with an NLP scheduling engine that lets AI agents perform multi-step operations from conversational commands. Talks to my Roku TV, lights, and cameras through a home server, with QML and React front-ends.",
    thumbnail: "🤖",
    tech: ["Python", "TypeScript", "React", "QML", "NLP"],
    github: `${GITHUB}/jarvis-server`,
    featured: true,
  },
  {
    id: "degree-planner",
    title: "AI Degree Planner",
    description: "Agent that reads course catalogs and plans your entire degree",
    longDescription: "An AI agent powered by the Subconscious SDK that searches official university course catalogs, extracts degree requirements, and generates a complete semester-by-semester plan of study using an agent runtime built for reliable multi-step reasoning. One of five demo products I launched on co-op.",
    thumbnail: "🎓",
    tech: ["TypeScript", "Next.js", "Subconscious SDK", "AI Agents"],
    github: `${GITHUB}/ai-agent-degree-planner`,
    featured: true,
  },
  {
    id: "quill",
    title: "Quill Compiler",
    description: "A compiler for my own language, built with C++ and LLVM",
    longDescription: "A high-performance compiler for the Quill programming language featuring comprehensive optimization passes and an extensive benchmarking suite.",
    thumbnail: "🪶",
    tech: ["C++", "LLVM", "Compilers"],
    github: `${GITHUB}/quill-compiler`,
    featured: false,
  },
  {
    id: "feed",
    title: "Feed",
    description: "Social platform I founded and scaled to 150+ active users",
    longDescription: "A MERN social platform with a Next.js companion web app sharing a MongoDB and Express backend. Founded Feed Tech LLC in high school and led development end-to-end; scaled to 150+ active users and 700+ posts.",
    thumbnail: "📱",
    tech: ["React", "Next.js", "Node.js", "Express", "MongoDB"],
    github: `${GITHUB}/feed`,
    featured: false,
  },
  {
    id: "receipt-tracker",
    title: "Receipt Tracker Agent",
    description: "Reducto + Subconscious agent that categorizes your spending",
    longDescription: "A web app that parses receipts with Reducto document extraction and uses Subconscious agents to categorize spending habits automatically.",
    thumbnail: "🧾",
    tech: ["TypeScript", "Reducto", "Subconscious SDK", "AI Agents"],
    github: `${GITHUB}/receipt-tracker-agent`,
    featured: false,
  },
  {
    id: "arbitrage",
    title: "Sports Betting Arbitrage",
    description: "Modular C++ engine that detects arbitrage across odds feeds",
    longDescription: "A modular C++ application that detects sports betting arbitrage opportunities by integrating multiple odds sources (APIs, WebSockets) behind a unified data structure with plug-and-play odds providers.",
    thumbnail: "📊",
    tech: ["C++", "WebSockets", "Real-time Data"],
    github: `${GITHUB}/arbitrage-sports-betting`,
    featured: false,
  },
  {
    id: "resume-tailor",
    title: "Resume Tailor",
    description: "Agent that generates role-specific resumes from your history",
    longDescription: "A Supabase and Subconscious-powered web app that stores projects, work experience, awards, and past resumes to generate tailored resumes for specific roles.",
    thumbnail: "📄",
    tech: ["TypeScript", "Supabase", "Subconscious SDK"],
    github: `${GITHUB}/resume-tailoring-agent`,
    featured: false,
  },
];

// Get all unique technologies
const ALL_TECH = Array.from(new Set(PROJECTS.flatMap((p) => p.tech))).sort();

export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!filter) return PROJECTS;
    return PROJECTS.filter((p) => p.tech.includes(filter));
  }, [filter]);

  return (
    <div className="h-full bg-[#1a1a1a] overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#1a1a1a]/95 backdrop-blur-sm border-b border-white/10 p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-white">Projects</h1>
          <span className="text-sm text-white/50">{filteredProjects.length} projects</span>
        </div>

        {/* Tech filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hidden">
          <button
            className={
              "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 " +
              (!filter
                ? "bg-purple-500 text-white"
                : "bg-white/10 text-white/70 hover:bg-white/20")
            }
            onClick={() => setFilter(null)}
          >
            All
          </button>
          {ALL_TECH.map((tech) => (
            <button
              key={tech}
              className={
                "px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0 " +
                (filter === tech
                  ? "bg-purple-500 text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20")
              }
              onClick={() => setFilter(filter === tech ? null : tech)}
            >
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Projects grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              className={
                "group relative bg-white/5 rounded-xl border border-white/10 overflow-hidden cursor-pointer transition-colors hover:border-purple-500/50 " +
                (project.featured ? "ring-1 ring-purple-500/30" : "")
              }
              onClick={() => setSelectedProject(project)}
            >
              {project.featured && (
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white rounded text-xs font-medium">
                  Featured
                </div>
              )}

              {/* Thumbnail */}
              <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <span className="text-6xl">{project.thumbnail}</span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{project.title}</h3>
                <p className="text-sm text-white/60 mb-3 line-clamp-2">{project.description}</p>

                {/* Tech tags */}
                <div className="flex flex-wrap gap-1">
                  {project.tech.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 bg-white/10 rounded text-xs text-white/70"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.tech.length > 3 && (
                    <span className="px-2 py-0.5 text-xs text-white/50">
                      +{project.tech.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Project detail modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="bg-[#252525] rounded-2xl max-w-lg w-full overflow-hidden border border-white/10 shadow-2xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="h-40 bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center relative">
                <span className="text-7xl">{selectedProject.thumbnail}</span>
                <button
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-colors"
                  onClick={() => setSelectedProject(null)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedProject.title}</h2>
                <p className="text-white/70 mb-4 leading-relaxed">{selectedProject.longDescription}</p>

                {/* Tech stack */}
                <div className="mb-6">
                  <h4 className="text-sm text-white/50 uppercase tracking-wider mb-2">Tech Stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tech.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-3">
                  {selectedProject.github && (
                    <a
                      href={selectedProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-white/10 rounded-lg text-center text-white font-medium hover:bg-white/20 transition-colors"
                    >
                      View on GitHub
                    </a>
                  )}
                  {selectedProject.demo && (
                    <a
                      href={selectedProject.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-purple-500 rounded-lg text-center text-white font-medium hover:bg-purple-600 transition-colors"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
