"use client";

/**
 * Inline SVG icons used by the menu bar (status icons + ControlCenter tiles +
 * Now Playing widget). These were originally defined at the bottom of
 * MenuBar.tsx — extracted so MenuBar can focus on composition.
 *
 * Why not use an icon library? macOS look-and-feel needs pixel-accurate paths
 * and weights, which is easier to control with hand-rolled SVG than a library
 * that wants you to pick from its set.
 */

export function AppleLogo() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function WifiIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 11a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
      <path d="M5.17 9.17a4 4 0 015.66 0 .75.75 0 001.06-1.06 5.5 5.5 0 00-7.78 0 .75.75 0 001.06 1.06z" />
      <path d="M2.34 6.34a7 7 0 0111.32 0 .75.75 0 001.06-1.06 8.5 8.5 0 00-13.44 0 .75.75 0 001.06 1.06z" />
    </svg>
  );
}

export function BluetoothIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z" />
    </svg>
  );
}

export function AirDropIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

export function DisplayIcon() {
  return (
    <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z" />
    </svg>
  );
}

export function SunIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
    </svg>
  );
}

export function SpeakerIcon() {
  return (
    <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export function VolumeOnSmallIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
    </svg>
  );
}

export function VolumeOffSmallIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

export function MusicNoteIcon() {
  return (
    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
    </svg>
  );
}

export function PlayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

export function ForwardIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}

export function VolumeOnIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.5 2.5L4 5H2a1 1 0 00-1 1v4a1 1 0 001 1h2l3.5 2.5a.5.5 0 00.8-.4V2.9a.5.5 0 00-.8-.4zM10.5 4.5a.5.5 0 01.7 0 5.5 5.5 0 010 7.78.5.5 0 11-.7-.72 4.5 4.5 0 000-6.34.5.5 0 010-.72z" />
      <path d="M12.5 2.5a.5.5 0 01.7 0 8.5 8.5 0 010 12.02.5.5 0 11-.7-.72 7.5 7.5 0 000-10.58.5.5 0 010-.72z" />
    </svg>
  );
}

export function VolumeOffIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.5 2.5L4 5H2a1 1 0 00-1 1v4a1 1 0 001 1h2l3.5 2.5a.5.5 0 00.8-.4V2.9a.5.5 0 00-.8-.4z" />
      <path d="M10.35 5.35a.5.5 0 01.7 0L12.5 6.8l1.45-1.45a.5.5 0 01.7.7L13.2 7.5l1.45 1.45a.5.5 0 01-.7.7L12.5 8.2l-1.45 1.45a.5.5 0 01-.7-.7L11.8 7.5l-1.45-1.45a.5.5 0 010-.7z" />
    </svg>
  );
}

export function BatteryIcon() {
  return (
    <svg className="w-[22px] h-4 text-white/90" viewBox="0 0 25 12" fill="none">
      <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M23 4v4a2 2 0 002-2 2 2 0 00-2-2z" fill="currentColor" fillOpacity="0.5" />
      <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  );
}

export function ControlCenterIcon() {
  return (
    <svg className="w-4 h-4 text-white/90" viewBox="0 0 16 16" fill="currentColor">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="3" rx="1" />
      <rect x="9" y="6" width="6" height="3" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="11" width="6" height="4" rx="1" />
    </svg>
  );
}
