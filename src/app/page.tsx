export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Menu Bar - placeholder */}
      <div className="h-7 bg-[var(--macos-menubar)] glass flex items-center px-4 text-sm">
        <span className="font-semibold"></span>
        <span className="ml-4 text-[var(--macos-text-secondary)]">Desktop Portfolio</span>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 relative bg-gradient-to-br from-purple-900 via-blue-900 to-teal-800">
        {/* Desktop icons will go here */}
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/50 text-lg">macOS Desktop Coming Soon...</p>
        </div>
      </div>

      {/* Dock - placeholder */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <div className="h-16 px-2 bg-[var(--macos-dock)] glass rounded-2xl flex items-center gap-2">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
            📁
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
            🌐
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
            💼
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
            💻
          </div>
        </div>
      </div>
    </div>
  );
}
