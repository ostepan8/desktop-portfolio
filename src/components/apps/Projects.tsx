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

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Desktop Portfolio",
    description: "A macOS-inspired portfolio website with windows, dock, and apps",
    longDescription: "This portfolio itself! Built to showcase my work in a unique, interactive way. Features a fully functional window management system, file browser, terminal, and more.",
    thumbnail: "🖥️",
    tech: ["React", "Next.js", "TypeScript", "Tailwind", "Framer Motion"],
    github: "https://github.com/ostepan/desktop-portfolio",
    demo: "https://owen-stepan.com",
    featured: true,
  },
  {
    id: "2",
    title: "AI Chat Application",
    description: "Real-time chat app powered by large language models",
    longDescription: "A full-stack chat application with streaming responses, conversation history, and multiple AI model support. Features a clean, modern UI with dark mode.",
    thumbnail: "🤖",
    tech: ["React", "Node.js", "OpenAI", "WebSocket", "PostgreSQL"],
    github: "https://github.com/ostepan",
    featured: true,
  },
  {
    id: "3",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce with payments and inventory",
    longDescription: "A complete e-commerce solution with product management, shopping cart, Stripe integration, and order tracking. Includes admin dashboard for inventory management.",
    thumbnail: "🛒",
    tech: ["Next.js", "Stripe", "Prisma", "PostgreSQL", "Tailwind"],
    github: "https://github.com/ostepan",
    featured: false,
  },
  {
    id: "4",
    title: "Task Management System",
    description: "Collaborative task tracking with real-time updates",
    longDescription: "A Trello-like task management application with drag-and-drop boards, real-time collaboration, and team features. Includes notifications and activity feeds.",
    thumbnail: "📋",
    tech: ["React", "Firebase", "TypeScript", "DnD Kit"],
    github: "https://github.com/ostepan",
    demo: "https://example.com",
    featured: false,
  },
  {
    id: "5",
    title: "Weather Dashboard",
    description: "Beautiful weather app with forecasts and maps",
    longDescription: "A weather application featuring current conditions, 7-day forecasts, interactive maps, and location search. Uses multiple weather APIs for accurate data.",
    thumbnail: "🌤️",
    tech: ["React", "Weather API", "Mapbox", "Chart.js"],
    demo: "https://example.com",
    featured: false,
  },
  {
    id: "6",
    title: "Developer Blog",
    description: "Markdown-powered blog with syntax highlighting",
    longDescription: "A personal blog built with MDX for writing technical articles. Features syntax highlighting, table of contents, reading time estimates, and RSS feed.",
    thumbnail: "📝",
    tech: ["Next.js", "MDX", "Tailwind", "Vercel"],
    github: "https://github.com/ostepan",
    demo: "https://example.com",
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
