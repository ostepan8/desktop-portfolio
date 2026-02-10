"use client";

interface IconProps {
  size?: number;
  className?: string;
}

// macOS Big Sur style icon wrapper - creates the squircle shape with shadow
function IconWrapper({ children, size = 48, className = "" }: IconProps & { children: React.ReactNode }) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg">
        {children}
      </svg>
    </div>
  );
}

// Squircle clip path for macOS-style rounded corners
const squirclePath = "M120,60 C120,93.1 93.1,120 60,120 C26.9,120 0,93.1 0,60 C0,26.9 26.9,0 60,0 C93.1,0 120,26.9 120,60 Z";

export function FinderIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="finder-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6CB5FF" />
          <stop offset="100%" stopColor="#1A73E8" />
        </linearGradient>
        <clipPath id="squircle">
          <path d={squirclePath} />
        </clipPath>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#finder-bg)" clipPath="url(#squircle)" />
      {/* Face */}
      <ellipse cx="60" cy="65" rx="32" ry="38" fill="white" />
      {/* Left eye */}
      <ellipse cx="48" cy="55" rx="6" ry="10" fill="#1A1A1A" />
      {/* Right eye */}
      <ellipse cx="72" cy="55" rx="6" ry="10" fill="#1A1A1A" />
      {/* Smile */}
      <path d="M42 75 Q60 92 78 75" fill="none" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
    </IconWrapper>
  );
}

export function SafariIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="safari-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#safari-bg)" />
      {/* Compass outer ring */}
      <circle cx="60" cy="60" r="42" fill="white" />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#E5E5E5" strokeWidth="2" />
      {/* Compass ticks */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="60"
          y1="24"
          x2="60"
          y2={angle % 90 === 0 ? "30" : "27"}
          stroke="#999"
          strokeWidth={angle % 90 === 0 ? "2" : "1"}
          transform={`rotate(${angle} 60 60)`}
        />
      ))}
      {/* Compass needle */}
      <polygon points="60,25 55,60 60,70 65,60" fill="#FF3B30" />
      <polygon points="60,95 55,60 60,50 65,60" fill="#E5E5E5" />
      {/* Center dot */}
      <circle cx="60" cy="60" r="4" fill="#333" />
    </IconWrapper>
  );
}

export function TerminalIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="terminal-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A4A4A" />
          <stop offset="100%" stopColor="#1A1A1A" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#terminal-bg)" />
      {/* Screen */}
      <rect x="15" y="20" width="90" height="80" rx="4" fill="#000" />
      {/* Prompt */}
      <text x="25" y="50" fill="#32D74B" fontSize="20" fontFamily="monospace" fontWeight="bold">{">"}</text>
      <text x="42" y="50" fill="#32D74B" fontSize="16" fontFamily="monospace">_</text>
      {/* Previous line */}
      <text x="25" y="75" fill="#8E8E93" fontSize="12" fontFamily="monospace">~ user$</text>
    </IconWrapper>
  );
}

export function TextEditIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="textedit-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFEAA7" />
          <stop offset="100%" stopColor="#FDCB6E" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#textedit-bg)" />
      {/* Paper */}
      <rect x="25" y="15" width="70" height="90" rx="4" fill="white" />
      {/* Lines */}
      <line x1="35" y1="35" x2="85" y2="35" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="35" y1="50" x2="85" y2="50" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="35" y1="65" x2="70" y2="65" stroke="#E0E0E0" strokeWidth="2" />
      <line x1="35" y1="80" x2="80" y2="80" stroke="#E0E0E0" strokeWidth="2" />
      {/* Pencil */}
      <g transform="translate(75, 70) rotate(45)">
        <rect x="0" y="0" width="8" height="40" fill="#FF9500" />
        <polygon points="0,40 4,-2 8,40" fill="#FFD60A" />
        <rect x="0" y="0" width="8" height="6" fill="#FF375F" />
        <polygon points="4,46 0,40 8,40" fill="#2C2C2E" />
      </g>
    </IconWrapper>
  );
}

export function SettingsIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="settings-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8E8E93" />
          <stop offset="100%" stopColor="#636366" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#settings-bg)" />
      {/* Gear */}
      <g transform="translate(60, 60)">
        <circle r="20" fill="#E5E5E7" />
        <circle r="10" fill="#636366" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x="-6"
            y="-38"
            width="12"
            height="16"
            rx="3"
            fill="#E5E5E7"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
    </IconWrapper>
  );
}

export function AboutIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="about-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5856D6" />
          <stop offset="100%" stopColor="#AF52DE" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#about-bg)" />
      {/* Person silhouette */}
      <circle cx="60" cy="42" r="18" fill="white" />
      <ellipse cx="60" cy="95" rx="32" ry="25" fill="white" />
    </IconWrapper>
  );
}

export function ProjectsIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="projects-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FF9500" />
          <stop offset="100%" stopColor="#FF6B00" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" rx="26" fill="url(#projects-bg)" />
      {/* Briefcase */}
      <rect x="20" y="40" width="80" height="55" rx="6" fill="white" />
      <rect x="45" y="28" width="30" height="20" rx="4" fill="none" stroke="white" strokeWidth="6" />
      {/* Handle */}
      <rect x="50" y="55" width="20" height="12" rx="2" fill="#FF9500" />
    </IconWrapper>
  );
}

export function FolderIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="folder-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64D2FF" />
          <stop offset="100%" stopColor="#0A84FF" />
        </linearGradient>
        <linearGradient id="folder-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5AC8FA" />
          <stop offset="100%" stopColor="#007AFF" />
        </linearGradient>
      </defs>
      {/* Back of folder */}
      <path d="M15,35 L15,95 Q15,100 20,100 L100,100 Q105,100 105,95 L105,35 Z" fill="url(#folder-bg)" />
      {/* Tab */}
      <path d="M15,35 L15,28 Q15,23 20,23 L50,23 Q55,23 58,28 L62,35 Z" fill="url(#folder-bg)" />
      {/* Front of folder */}
      <path d="M12,45 L12,98 Q12,103 17,103 L103,103 Q108,103 108,98 L108,45 Q108,40 103,40 L17,40 Q12,40 12,45 Z" fill="url(#folder-front)" />
    </IconWrapper>
  );
}

export function FileIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="file-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5F5F7" />
          <stop offset="100%" stopColor="#E5E5E7" />
        </linearGradient>
      </defs>
      {/* Paper */}
      <path d="M30,10 L75,10 L95,30 L95,110 Q95,115 90,115 L30,115 Q25,115 25,110 L25,15 Q25,10 30,10 Z" fill="url(#file-bg)" />
      {/* Fold */}
      <path d="M75,10 L75,25 Q75,30 80,30 L95,30 Z" fill="#D1D1D6" />
      {/* Lines */}
      <line x1="40" y1="50" x2="80" y2="50" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="65" x2="80" y2="65" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" />
      <line x1="40" y1="80" x2="65" y2="80" stroke="#C7C7CC" strokeWidth="3" strokeLinecap="round" />
    </IconWrapper>
  );
}

export function DriveIcon({ size = 48, className }: IconProps) {
  return (
    <IconWrapper size={size} className={className}>
      <defs>
        <linearGradient id="drive-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E5E5E7" />
          <stop offset="100%" stopColor="#C7C7CC" />
        </linearGradient>
        <linearGradient id="drive-side" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#AEAEB2" />
          <stop offset="100%" stopColor="#8E8E93" />
        </linearGradient>
      </defs>
      {/* Top face */}
      <path d="M20,45 L60,25 L100,45 L60,65 Z" fill="url(#drive-bg)" />
      {/* Front face */}
      <path d="M20,45 L20,75 L60,95 L60,65 Z" fill="url(#drive-side)" />
      {/* Right face */}
      <path d="M60,65 L60,95 L100,75 L100,45 Z" fill="#D1D1D6" />
      {/* Apple logo placeholder - simple circle */}
      <ellipse cx="60" cy="50" rx="12" ry="8" fill="none" stroke="#8E8E93" strokeWidth="2" />
    </IconWrapper>
  );
}

// Icon map for easy lookup
export const AppIconMap: Record<string, React.ComponentType<IconProps>> = {
  finder: FinderIcon,
  safari: SafariIcon,
  terminal: TerminalIcon,
  textedit: TextEditIcon,
  settings: SettingsIcon,
  about: AboutIcon,
  projects: ProjectsIcon,
  folder: FolderIcon,
  file: FileIcon,
  drive: DriveIcon,
};

// Helper component that renders the appropriate icon
export function AppIcon({ appId, size = 48, className }: IconProps & { appId: string }) {
  const IconComponent = AppIconMap[appId.toLowerCase()];
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }
  // Fallback
  return (
    <div
      className={`bg-gray-500 rounded-xl flex items-center justify-center text-white ${className}`}
      style={{ width: size, height: size }}
    >
      ?
    </div>
  );
}
