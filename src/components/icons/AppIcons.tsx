"use client";

import type { ReactNode } from "react";

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * Apple "continuous corner" squircle (superellipse, n=5) on a 120x120 grid.
 * Using the true superellipse — not a rounded rect — is what makes the icon
 * silhouette read as a real macOS app tile.
 */
const SQUIRCLE =
  "M120,60 L119.95,80.16 L119.79,86.57 L119.54,91.21 L119.17,94.94 L118.71,98.11 L118.13,100.86 L117.44,103.29 L116.65,105.47 L115.73,107.43 L114.69,109.2 L113.53,110.79 L112.23,112.23 L110.79,113.53 L109.2,114.69 L107.43,115.73 L105.47,116.65 L103.29,117.44 L100.86,118.13 L98.11,118.71 L94.94,119.17 L91.21,119.54 L86.57,119.79 L80.16,119.95 L60,120 L39.84,119.95 L33.43,119.79 L28.79,119.54 L25.06,119.17 L21.89,118.71 L19.14,118.13 L16.71,117.44 L14.53,116.65 L12.57,115.73 L10.8,114.69 L9.21,113.53 L7.77,112.23 L6.47,110.79 L5.31,109.2 L4.27,107.43 L3.35,105.47 L2.56,103.29 L1.87,100.86 L1.29,98.11 L0.83,94.94 L0.46,91.21 L0.21,86.57 L0.05,80.16 L0,60 L0.05,39.84 L0.21,33.43 L0.46,28.79 L0.83,25.06 L1.29,21.89 L1.87,19.14 L2.56,16.71 L3.35,14.53 L4.27,12.57 L5.31,10.8 L6.47,9.21 L7.77,7.77 L9.21,6.47 L10.8,5.31 L12.57,4.27 L14.53,3.35 L16.71,2.56 L19.14,1.87 L21.89,1.29 L25.06,0.83 L28.79,0.46 L33.43,0.21 L39.84,0.05 L60,0 L80.16,0.05 L86.57,0.21 L91.21,0.46 L94.94,0.83 L98.11,1.29 L100.86,1.87 L103.29,2.56 L105.47,3.35 L107.43,4.27 L109.2,5.31 L110.79,6.47 L112.23,7.77 L113.53,9.21 L114.69,10.8 L115.73,12.57 L116.65,14.53 L117.44,16.71 L118.13,19.14 L118.71,21.89 L119.17,25.06 L119.54,28.79 L119.79,33.43 L119.95,39.84 Z";

interface IconShellProps extends IconProps {
  /** Squircle background fill (a gradient rect or layered fills). */
  bg: ReactNode;
  /** Foreground artwork, clipped to the squircle. */
  children: ReactNode;
}

/**
 * Shared chrome for every app tile: squircle clip, the background fill, the
 * artwork, a faint top-light sheen, and a 1px inner glass edge — all under a
 * soft drop shadow. Keeping this in one place is what makes the whole dock
 * read as a cohesive, real macOS icon set.
 */
function IconShell({ size = 48, className = "", bg, children }: IconShellProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.28))" }}
      >
        <defs>
          <clipPath id="ic-sq">
            <path d={SQUIRCLE} />
          </clipPath>
          {/* Glassy top-light that unifies the tile. */}
          <linearGradient id="ic-sheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="14%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath="url(#ic-sq)">
          {bg}
          {children}
          <rect width="120" height="120" fill="url(#ic-sheen)" />
        </g>

        {/* Inner glass edge — a hair of light on the rim sells the depth. */}
        <path d={SQUIRCLE} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      </svg>
    </div>
  );
}

export function FinderIcon({ size = 48, className }: IconProps) {
  // The classic two-tone Finder face: the tile itself is split down the middle,
  // blue on the left, near-white on the right, with mirrored eyes and a smile.
  const bg = (
    <>
      <defs>
        <linearGradient id="finder-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4aa3ff" />
          <stop offset="100%" stopColor="#1f72e0" />
        </linearGradient>
        <linearGradient id="finder-right" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f8ff" />
          <stop offset="100%" stopColor="#cfe4ff" />
        </linearGradient>
        <clipPath id="finder-half-l">
          <rect x="0" y="0" width="60" height="120" />
        </clipPath>
        <clipPath id="finder-half-r">
          <rect x="60" y="0" width="60" height="120" />
        </clipPath>
      </defs>
      <rect x="0" width="60" height="120" fill="url(#finder-left)" />
      <rect x="60" width="60" height="120" fill="url(#finder-right)" />
      {/* Soft seam down the middle. */}
      <line x1="60" y1="6" x2="60" y2="114" stroke="#1f72e0" strokeWidth="1" strokeOpacity="0.25" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Eyes — white on the blue half, navy on the light half. */}
      <ellipse cx="44" cy="50" rx="5.5" ry="12" fill="#ffffff" />
      <ellipse cx="76" cy="50" rx="5.5" ry="12" fill="#0c2d52" />
      {/* Smile, color-split at the seam to match the two-tone face. */}
      <g clipPath="url(#finder-half-l)">
        <path d="M38 74 Q60 94 82 74" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g clipPath="url(#finder-half-r)">
        <path d="M38 74 Q60 94 82 74" fill="none" stroke="#0c2d52" strokeWidth="5" strokeLinecap="round" />
      </g>
    </IconShell>
  );
}

export function SafariIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <radialGradient id="safari-bg" cx="50%" cy="38%" r="75%">
          <stop offset="0%" stopColor="#5cc6ff" />
          <stop offset="60%" stopColor="#1c9bf0" />
          <stop offset="100%" stopColor="#0a6fd6" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#safari-bg)" />
    </>
  );
  // Fine degree ticks every 15°, longer + bolder on the cardinals.
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <IconShell size={size} className={className} bg={bg}>
      <circle cx="60" cy="60" r="43" fill="#fdfdfd" />
      <circle cx="60" cy="60" r="43" fill="none" stroke="#000" strokeOpacity="0.06" strokeWidth="2" />
      {ticks.map((angle) => {
        const cardinal = angle % 90 === 0;
        return (
          <line
            key={angle}
            x1="60"
            y1="22"
            x2="60"
            y2={cardinal ? "30" : "26"}
            stroke={cardinal ? "#8a8a8e" : "#c6c6cb"}
            strokeWidth={cardinal ? "2" : "1.2"}
            transform={`rotate(${angle} 60 60)`}
          />
        );
      })}
      {/* The iconic NE/SW needle. */}
      <g transform="rotate(45 60 60)">
        <polygon points="60,26 54,60 60,68 66,60" fill="#ff3b30" />
        <polygon points="60,94 54,60 60,52 66,60" fill="#e7e7ea" />
        <polygon points="60,26 60,68 66,60" fill="#d62b21" />
      </g>
      <circle cx="60" cy="60" r="3.5" fill="#3a3a3c" />
    </IconShell>
  );
}

export function TerminalIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="terminal-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3d" />
          <stop offset="100%" stopColor="#161617" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#terminal-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Inset black screen with a faint top "title" strip. */}
      <rect x="16" y="18" width="88" height="84" rx="8" fill="#0a0a0b" />
      <rect x="16" y="18" width="88" height="14" rx="8" fill="#202022" />
      <rect x="16" y="26" width="88" height="6" fill="#202022" />
      {/* Prompt: chevron + blinking-style cursor block. */}
      <path d="M30 52 L42 62 L30 72" fill="none" stroke="#34d058" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="48" y="66" width="20" height="5" rx="1" fill="#34d058" />
    </IconShell>
  );
}

export function TextEditIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="textedit-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fdfdfd" />
          <stop offset="100%" stopColor="#e9e9ec" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#textedit-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Sheet of paper with a curled corner. */}
      <path
        d="M30 18 H74 L92 36 V100 a4 4 0 0 1 -4 4 H30 a4 4 0 0 1 -4 -4 V22 a4 4 0 0 1 4 -4 Z"
        fill="#ffffff"
        stroke="#d7d7db"
        strokeWidth="1.5"
      />
      <path d="M74 18 V32 a4 4 0 0 0 4 4 H92 Z" fill="#e3e3e7" />
      {/* Text lines. */}
      <line x1="38" y1="50" x2="80" y2="50" stroke="#c4c4c9" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="62" x2="80" y2="62" stroke="#c4c4c9" strokeWidth="3" strokeLinecap="round" />
      <line x1="38" y1="74" x2="66" y2="74" stroke="#c4c4c9" strokeWidth="3" strokeLinecap="round" />
      {/* Graphite pencil laid diagonally across the page. */}
      <g transform="rotate(40 70 72)">
        <rect x="62" y="40" width="14" height="54" fill="#ffb340" />
        <rect x="62" y="40" width="14" height="54" fill="#000" fillOpacity="0.06" />
        <rect x="62" y="36" width="14" height="8" fill="#ff6482" />
        <polygon points="62,94 76,94 69,108" fill="#f2c79a" />
        <polygon points="65.5,101 72.5,101 69,108" fill="#3a3a3c" />
      </g>
    </IconShell>
  );
}

export function SettingsIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="settings-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9a9aa0" />
          <stop offset="100%" stopColor="#5e5e63" />
        </linearGradient>
        <radialGradient id="settings-gear" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#fdfdfd" />
          <stop offset="100%" stopColor="#d3d3d8" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#settings-bg)" />
    </>
  );
  const teeth = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <IconShell size={size} className={className} bg={bg}>
      <g transform="translate(60 60)">
        {teeth.map((angle) => (
          <rect
            key={angle}
            x="-7"
            y="-44"
            width="14"
            height="16"
            rx="3"
            fill="url(#settings-gear)"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="30" fill="url(#settings-gear)" />
        <circle r="30" fill="none" stroke="#000" strokeOpacity="0.08" strokeWidth="1.5" />
        <circle r="12" fill="#5e5e63" />
        <circle r="12" fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="1.5" />
      </g>
    </IconShell>
  );
}

export function AboutIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="about-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6a67e0" />
          <stop offset="100%" stopColor="#a64bd6" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#about-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Clean contact silhouette inside a soft circle. */}
      <circle cx="60" cy="58" r="40" fill="#ffffff" fillOpacity="0.16" />
      <circle cx="60" cy="48" r="16" fill="#ffffff" />
      <path d="M30 96 a30 26 0 0 1 60 0 Z" fill="#ffffff" />
    </IconShell>
  );
}

export function FolderIcon({ size = 48, className }: IconProps) {
  // Folders aren't squircle tiles — keep the macOS two-tone folder silhouette,
  // but with a softer gradient and drop shadow to match the app set.
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))" }}>
        <defs>
          <linearGradient id="folder-back" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7cdcff" />
            <stop offset="100%" stopColor="#33a3f5" />
          </linearGradient>
          <linearGradient id="folder-front" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5fc6fb" />
            <stop offset="100%" stopColor="#0a84ff" />
          </linearGradient>
        </defs>
        <path d="M14,34 Q14,28 20,28 L46,28 Q50,28 53,32 L59,40 L100,40 Q106,40 106,46 L106,40 L14,40 Z" fill="url(#folder-back)" />
        <path d="M14,40 L106,40 L106,40 Z" fill="none" />
        <path d="M12,48 Q12,42 18,42 L102,42 Q108,42 108,48 L108,96 Q108,102 102,102 L18,102 Q12,102 12,96 Z" fill="url(#folder-front)" />
        <path d="M12,48 Q12,42 18,42 L102,42 Q108,42 108,48 L108,52 L12,52 Z" fill="#ffffff" fillOpacity="0.18" />
      </svg>
    </div>
  );
}

export function FileIcon({ size = 48, className }: IconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }}>
        <defs>
          <linearGradient id="file-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e9e9ec" />
          </linearGradient>
        </defs>
        <path d="M30,10 L75,10 L95,30 L95,108 Q95,114 89,114 L30,114 Q24,114 24,108 L24,16 Q24,10 30,10 Z" fill="url(#file-bg)" stroke="#d6d6da" strokeWidth="1.5" />
        <path d="M75,10 L75,26 Q75,30 79,30 L95,30 Z" fill="#d1d1d6" />
        <line x1="38" y1="50" x2="80" y2="50" stroke="#c7c7cc" strokeWidth="3" strokeLinecap="round" />
        <line x1="38" y1="64" x2="80" y2="64" stroke="#c7c7cc" strokeWidth="3" strokeLinecap="round" />
        <line x1="38" y1="78" x2="64" y2="78" stroke="#c7c7cc" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export function DriveIcon({ size = 48, className }: IconProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="w-full h-full" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.22))" }}>
        <defs>
          <linearGradient id="drive-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f0f0f2" />
            <stop offset="100%" stopColor="#d9d9de" />
          </linearGradient>
          <linearGradient id="drive-side" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0%" stopColor="#b6b6bb" />
            <stop offset="100%" stopColor="#8e8e93" />
          </linearGradient>
        </defs>
        <path d="M20,45 L60,25 L100,45 L60,65 Z" fill="url(#drive-top)" />
        <path d="M20,45 L20,75 L60,95 L60,65 Z" fill="url(#drive-side)" />
        <path d="M60,65 L60,95 L100,75 L100,45 Z" fill="#cfcfd4" />
        <ellipse cx="60" cy="49" rx="11" ry="7" fill="none" stroke="#8e8e93" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function GitHubIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="github-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3a3f" />
          <stop offset="100%" stopColor="#141416" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#github-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Octocat mark (simplified GitHub logomark). */}
      <path
        d="M60 24c-20 0-36 16.2-36 36.2 0 16 10.3 29.6 24.6 34.4 1.8.3 2.5-.8 2.5-1.7v-6.3c-10 2.2-12.2-4.3-12.2-4.3-1.6-4.2-4-5.3-4-5.3-3.3-2.3.2-2.2.2-2.2 3.6.3 5.5 3.7 5.5 3.7 3.2 5.6 8.5 4 10.5 3 .3-2.4 1.3-4 2.3-4.9-8-.9-16.4-4-16.4-17.9 0-4 1.4-7.2 3.7-9.7-.4-.9-1.6-4.6.3-9.6 0 0 3-1 9.9 3.7a34 34 0 0 1 18 0c6.9-4.7 9.9-3.7 9.9-3.7 1.9 5 .7 8.7.3 9.6 2.3 2.5 3.7 5.7 3.7 9.7 0 13.9-8.5 17-16.5 17.9 1.3 1.1 2.5 3.4 2.5 6.8v10c0 1 .7 2.1 2.5 1.7C85.7 89.8 96 76.2 96 60.2 96 40.2 80 24 60 24Z"
        fill="#ffffff"
      />
    </IconShell>
  );
}

export function VideosIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="videos-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3fa9f5" />
          <stop offset="100%" stopColor="#0b57c9" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#videos-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* QuickTime-style Q ring with a play wedge. */}
      <circle cx="60" cy="60" r="34" fill="none" stroke="#ffffff" strokeWidth="11" strokeOpacity="0.95" />
      <path d="M52 44 L80 60 L52 76 Z" fill="#ffffff" />
      <line x1="82" y1="82" x2="97" y2="97" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" />
    </IconShell>
  );
}

export function BasketballAppIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="bball-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2b1608" />
          <stop offset="100%" stopColor="#120a04" />
        </linearGradient>
        <radialGradient id="bball-ball" cx="0.35" cy="0.3" r="1">
          <stop offset="0%" stopColor="#ff9d42" />
          <stop offset="100%" stopColor="#d9541a" />
        </radialGradient>
      </defs>
      <rect width="120" height="120" fill="url(#bball-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Basketball with seams. */}
      <circle cx="60" cy="60" r="38" fill="url(#bball-ball)" />
      <g stroke="#7c2d12" strokeWidth="3.5" fill="none">
        <path d="M60 22 V98" />
        <path d="M22 60 H98" />
        <path d="M33 33 Q60 60 33 87" />
        <path d="M87 33 Q60 60 87 87" />
      </g>
    </IconShell>
  );
}

export function PreviewIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="preview-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7f7fa" />
          <stop offset="100%" stopColor="#d9dae0" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#preview-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Document page behind a Preview-style magnifier. */}
      <path d="M34 20 L70 20 L84 34 L84 92 Q84 97 79 97 L34 97 Q29 97 29 92 L29 25 Q29 20 34 20 Z" fill="#ffffff" stroke="#c3c4cc" strokeWidth="2" />
      <path d="M70 20 L70 32 Q70 34 72 34 L84 34 Z" fill="#c9cad2" />
      <line x1="40" y1="48" x2="73" y2="48" stroke="#b3b4bd" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="40" y1="60" x2="73" y2="60" stroke="#b3b4bd" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="66" cy="74" r="17" fill="none" stroke="#0a84ff" strokeWidth="7" />
      <line x1="78" y1="86" x2="92" y2="100" stroke="#0a84ff" strokeWidth="8" strokeLinecap="round" />
    </IconShell>
  );
}

export function RematchIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="rematch-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#rematch-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Two boxing gloves squaring off over a VS bolt. */}
      <circle cx="38" cy="52" r="17" fill="#ef4444" />
      <rect x="30" y="62" width="16" height="12" rx="4" fill="#dc2626" />
      <circle cx="82" cy="52" r="17" fill="#3b82f6" />
      <rect x="74" y="62" width="16" height="12" rx="4" fill="#2563eb" />
      <path
        d="M64 78 L52 96 L60 96 L54 112 L72 90 L63 90 L70 78 Z"
        fill="#fbbf24"
      />
    </IconShell>
  );
}

export function ArbHunterIcon({ size = 48, className }: IconProps) {
  const bg = (
    <>
      <defs>
        <linearGradient id="arb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123024" />
          <stop offset="100%" stopColor="#06130c" />
        </linearGradient>
      </defs>
      <rect width="120" height="120" fill="url(#arb-bg)" />
    </>
  );
  return (
    <IconShell size={size} className={className} bg={bg}>
      {/* Two diverging price lines and the gap between them — the arb. */}
      <polyline
        points="16,74 38,66 56,72 78,52 104,44"
        fill="none"
        stroke="#34d399"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="16,88 40,86 60,92 82,80 104,84"
        fill="none"
        stroke="#f87171"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="93"
        y1="50"
        x2="93"
        y2="80"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeDasharray="5 4"
      />
      <text
        x="60"
        y="34"
        textAnchor="middle"
        fontSize="22"
        fontWeight="bold"
        fontFamily="monospace"
        fill="#34d399"
      >
        %
      </text>
    </IconShell>
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
  github: GitHubIcon,
  videos: VideosIcon,
  basketball: BasketballAppIcon,
  pdfviewer: PreviewIcon,
  rematch: RematchIcon,
  arbhunter: ArbHunterIcon,
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
