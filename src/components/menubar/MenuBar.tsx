"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useSounds } from "@/lib/sounds";
import { useSystemStatus } from "@/lib/system-status";
import { Z_INDEX } from "@/constants/layout";
import { NotificationCenter } from "./NotificationCenter";
import { ControlCenter } from "./ControlCenter";
import { MenuBarItem, MenuDropdown } from "./MenuDropdown";
import { StatusIcon } from "./StatusIcon";
import {
  MENU_BAR_MENUS,
  type MenuActions,
  type MenuContext,
  type MenuBarMenu,
} from "./menu-definitions";
import {
  AppleLogo,
  BatteryIcon,
  ControlCenterIcon,
  SearchIcon,
  VolumeOffIcon,
  VolumeOnIcon,
  WifiIcon,
} from "./icons";

interface WindowInfo {
  id: string;
  title: string;
  appId: string;
}

interface MenuBarProps {
  activeApp?: string;
  windows?: WindowInfo[];
  activeWindowId?: string | null;
  /** Handlers for every wired menu item. Missing ones render disabled. */
  actions?: MenuActions;
}

export function MenuBar({
  activeApp = "Finder",
  windows = [],
  activeWindowId,
  actions = {},
}: MenuBarProps) {
  const isMobile = useIsMobile();
  const { wifi } = useSystemStatus();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const time = useClock(isMobile);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the open menu when the user clicks anywhere outside the menu bar.
  useClickOutside(menuRef, () => setOpenMenu(null));

  // Hover-to-switch only works once a menu is already open (macOS behavior).
  const handleMenuEnter = useCallback(
    (id: string) => {
      if (openMenu !== null) setOpenMenu(id);
    },
    [openMenu],
  );

  const menuContext: MenuContext = {
    ...actions,
    activeWindowId,
    windows,
  };

  if (isMobile) {
    return <MobileMenuBar ref={menuRef} activeApp={activeApp} time={time} />;
  }

  return (
    <header
      ref={menuRef}
      className="h-7 bg-[var(--macos-menubar)] glass flex items-center justify-between px-2 text-[13px] font-medium select-none"
      style={{ zIndex: Z_INDEX.menuBar }}
    >
      <div className="flex items-center gap-1">
        {MENU_BAR_MENUS.map((menu, index) => (
          <Fragment key={menu.id}>
            <MenuBarMenuItem
              menu={menu}
              isOpen={openMenu === menu.id}
              isAppMenu={menu.id === "apple"}
              onToggle={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
              onEnter={() => handleMenuEnter(menu.id)}
              context={menuContext}
            />
            {/* App label sits between the Apple logo and the standard menus. */}
            {index === 0 && (
              <AppLabel
                activeApp={activeApp}
                isOpen={openMenu === "app"}
                onToggle={() => setOpenMenu(openMenu === "app" ? null : "app")}
                onEnter={() => handleMenuEnter("app")}
              />
            )}
          </Fragment>
        ))}
      </div>

      <div className="flex items-center gap-0.5">
        <VolumeButton />

        <StatusIcon title="Battery" subtitle="100% - Charged">
          <BatteryIcon />
        </StatusIcon>
        <StatusIcon title="Wi-Fi" subtitle={wifi ? "Home Network" : "Off"}>
          <span className={wifi ? "" : "opacity-40"}>
            <WifiIcon />
          </span>
        </StatusIcon>
        <StatusIcon
          title="Spotlight"
          subtitle="⌘ Space"
          onClick={actions.onSpotlight}
        >
          <SearchIcon />
        </StatusIcon>

        <div className="relative">
          <button
            onClick={() => setShowControlCenter(!showControlCenter)}
            className={
              "px-1.5 py-0.5 rounded transition-colors " +
              (showControlCenter ? "bg-white/20" : "hover:bg-white/10")
            }
            title="Control Center"
          >
            <ControlCenterIcon />
          </button>
          <ControlCenter
            isOpen={showControlCenter}
            onClose={() => setShowControlCenter(false)}
          />
        </div>

        <button
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          className={
            "px-2 py-0.5 rounded transition-colors " +
            (showNotificationCenter ? "bg-white/20" : "hover:bg-white/10")
          }
        >
          <time className="tabular-nums text-white/90 text-[13px]">{time}</time>
        </button>
      </div>

      <NotificationCenter
        isOpen={showNotificationCenter}
        onClose={() => setShowNotificationCenter(false)}
      />
    </header>
  );
}

function MenuBarMenuItem({
  menu,
  isOpen,
  isAppMenu,
  onToggle,
  onEnter,
  context,
}: {
  menu: MenuBarMenu;
  isOpen: boolean;
  isAppMenu: boolean;
  onToggle: () => void;
  onEnter: () => void;
  context: MenuContext;
}) {
  return (
    <MenuBarItem
      isOpen={isOpen}
      onMouseDown={onToggle}
      onMouseEnter={onEnter}
      className={isAppMenu ? "" : "text-white/90"}
    >
      {menu.isAppleLogo ? <AppleLogo /> : menu.label}
      <MenuDropdown items={menu.buildItems(context)} isOpen={isOpen} />
    </MenuBarItem>
  );
}

function AppLabel({
  activeApp,
  isOpen,
  onToggle,
  onEnter,
}: {
  activeApp: string;
  isOpen: boolean;
  onToggle: () => void;
  onEnter: () => void;
}) {
  return (
    <MenuBarItem
      isOpen={isOpen}
      onMouseDown={onToggle}
      onMouseEnter={onEnter}
      className="font-semibold"
    >
      {activeApp}
    </MenuBarItem>
  );
}

/** Menu bar speaker icon — click toggles the global mute. */
function VolumeButton() {
  const { isMuted, setMuted } = useSounds();
  return (
    <button
      onClick={() => setMuted(!isMuted)}
      className="px-1.5 py-0.5 rounded hover:bg-white/10 cursor-default transition-colors"
      title={isMuted ? "Sound: Off" : "Sound: On"}
    >
      {isMuted ? <VolumeOffIcon /> : <VolumeOnIcon />}
    </button>
  );
}

// Mobile menu bar: just the app label + sound toggle + time. The full menu
// system would be too cramped on small screens.
const MobileMenuBar = ({
  ref,
  activeApp,
  time,
}: {
  ref: React.RefObject<HTMLDivElement | null>;
  activeApp: string;
  time: string;
}) => {
  const { isMuted, setMuted } = useSounds();
  return (
    <header
      ref={ref}
      className="h-7 bg-[var(--macos-menubar)] glass flex items-center justify-between px-3 text-[13px] font-medium select-none"
      style={{ zIndex: Z_INDEX.menuBar }}
    >
      <div className="flex items-center gap-2">
        <AppleLogo />
        <span className="font-semibold text-white/90">{activeApp}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setMuted(!isMuted)}
          className="p-1 rounded active:bg-white/20 text-sm"
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        <span className="text-white/90 text-xs tabular-nums">{time}</span>
      </div>
    </header>
  );
};

/** Update the formatted time string once a second. Mobile uses a shorter
 *  format (just HH:MM) since the menu bar has less room there. */
function useClock(isMobile: boolean): string {
  const [time, setTime] = useState("");

  useEffect(() => {
    const format = isMobile
      ? { hour: "numeric" as const, minute: "2-digit" as const }
      : {
          hour: "numeric" as const,
          minute: "2-digit" as const,
          weekday: "short" as const,
          month: "short" as const,
          day: "numeric" as const,
        };
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", format));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isMobile]);

  return time;
}
