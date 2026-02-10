"use client";

import { DesktopProvider } from "@/components/desktop";

export default function Home() {
  return (
    <DesktopProvider>
      {/* Menu Bar */}
      <header className="h-7 bg-[var(--macos-menubar)] glass flex items-center justify-between px-4 text-[13px] font-medium z-50">
        <div className="flex items-center gap-4">
          <button className="hover:bg-white/10 px-2 py-0.5 rounded">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
          </button>
          <span className="font-semibold">Finder</span>
          <span className="text-white/60">File</span>
          <span className="text-white/60">Edit</span>
          <span className="text-white/60">View</span>
          <span className="text-white/60">Go</span>
          <span className="text-white/60">Window</span>
          <span className="text-white/60">Help</span>
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <span>🔋</span>
          <span>📶</span>
          <time suppressHydrationWarning>
            {new Date().toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              weekday: "short",
              month: "short",
              day: "numeric"
            })}
          </time>
        </div>
      </header>

      {/* Desktop Area */}
      <main className="flex-1 relative">
        {/* Desktop icons will go here in future todos */}
        <div className="absolute top-8 right-8 flex flex-col gap-2 items-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <span className="text-5xl">💻</span>
          </div>
          <span className="text-xs text-white text-center drop-shadow-lg">Macintosh HD</span>
        </div>
      </main>

      {/* Dock */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50">
        <div className="h-16 px-2 bg-[var(--macos-dock)] glass rounded-2xl border border-white/20 flex items-center gap-1">
          <DockIcon emoji="📁" label="Finder" active />
          <DockIcon emoji="🌐" label="Safari" />
          <DockIcon emoji="👤" label="About Me" />
          <DockIcon emoji="💼" label="Projects" />
          <DockIcon emoji="💻" label="Terminal" />
          <DockIcon emoji="📝" label="TextEdit" />
          <div className="w-px h-10 bg-white/20 mx-1" />
          <DockIcon emoji="⚙️" label="Settings" />
        </div>
      </div>
    </DesktopProvider>
  );
}

// Dock icon component
function DockIcon({ emoji, label, active }: { emoji: string; label: string; active?: boolean }) {
  return (
    <div className="relative group">
      <div className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-2xl cursor-pointer transition-all duration-200 hover:scale-110 hover:-translate-y-1">
        {emoji}
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800/90 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {label}
      </div>
      {/* Active indicator */}
      {active && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/60 rounded-full" />
      )}
    </div>
  );
}
