"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Toggle } from "@/components/ui/Toggle";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useSystemStatus } from "@/lib/system-status";
import { Z_INDEX, MENU_BAR_HEIGHT } from "@/constants/layout";
import { slideInRightVariants } from "@/constants/motion";

interface Notification {
  id: string;
  app: string;
  title: string;
  message: string;
  time: string;
  icon?: string;
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    app: "Finder",
    title: "File Transfer Complete",
    message: "5 items have been copied to Documents",
    time: "2m ago",
    icon: "📁",
  },
  {
    id: "2",
    app: "Terminal",
    title: "Build Complete",
    message: "npm run build finished successfully",
    time: "15m ago",
    icon: "💻",
  },
  {
    id: "3",
    app: "Safari",
    title: "Download Complete",
    message: "project-files.zip has finished downloading",
    time: "1h ago",
    icon: "🧭",
  },
];

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  // Shared with the Control Center "Focus" tile — toggling one updates both.
  const { focusMode: doNotDisturb, setFocusMode: setDoNotDisturb } =
    useSystemStatus();

  useClickOutside(panelRef, onClose, isOpen);

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Get current date
  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = now.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: Z_INDEX.notificationCenter - 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            variants={slideInRightVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 bottom-0 w-[360px]"
            style={{ top: MENU_BAR_HEIGHT - 1, zIndex: Z_INDEX.notificationCenter }}
          >
            <GlassPanel
              ref={panelRef}
              variant="panel"
              className="h-full overflow-hidden"
            >
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {/* Date Header */}
              <div className="text-center pb-2">
                <div className="text-white/50 text-sm">{dayName}</div>
                <div className="text-white text-2xl font-semibold">{monthDay}</div>
              </div>

              {/* Do Not Disturb */}
              <div
                className="rounded-xl p-4 flex items-center justify-between"
                style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${doNotDisturb ? "bg-indigo-500" : "bg-white/20"}`}>
                    <MoonIcon />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Do Not Disturb</div>
                    <div className="text-xs text-white/50">
                      {doNotDisturb ? "On - Notifications silenced" : "Off"}
                    </div>
                  </div>
                </div>
                <Toggle checked={doNotDisturb} onChange={setDoNotDisturb} />
              </div>

              {/* Notifications */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Notifications
                  </span>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <AnimatePresence mode="popLayout">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="rounded-xl p-3 group relative"
                        style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                      >
                        <button
                          onClick={() => clearNotification(notification.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                        >
                          <XIcon />
                        </button>
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{notification.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white/50">{notification.app}</span>
                              <span className="text-xs text-white/30">{notification.time}</span>
                            </div>
                            <div className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </div>
                            <div className="text-xs text-white/60 line-clamp-2">
                              {notification.message}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="rounded-xl p-8 text-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="text-3xl mb-2">🔔</div>
                      <div className="text-sm text-white/50">No Notifications</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Weather Widget */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Weather
                </span>
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: "linear-gradient(135deg, #1a365d 0%, #2d3748 100%)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/70">Cupertino</div>
                      <div className="text-3xl font-light text-white">72°</div>
                      <div className="text-sm text-white/60">Sunny</div>
                    </div>
                    <div className="text-5xl">☀️</div>
                  </div>
                  <div className="flex justify-between mt-4 pt-3 border-t border-white/10">
                    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-white/50">{day}</div>
                        <div className="text-sm my-1">{["☀️", "⛅", "☀️", "🌤️", "☀️"][i]}</div>
                        <div className="text-xs text-white/70">{70 + i * 2}°</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calendar Widget */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Calendar
                </span>
                <div
                  className="rounded-xl p-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="text-sm font-medium text-white mb-3">Upcoming</div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-10 rounded-full bg-blue-500" />
                      <div>
                        <div className="text-sm text-white">Team Standup</div>
                        <div className="text-xs text-white/50">10:00 AM - 10:30 AM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-10 rounded-full bg-green-500" />
                      <div>
                        <div className="text-sm text-white">Code Review</div>
                        <div className="text-xs text-white/50">2:00 PM - 3:00 PM</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-10 rounded-full bg-purple-500" />
                      <div>
                        <div className="text-sm text-white">Sprint Planning</div>
                        <div className="text-xs text-white/50">Tomorrow, 9:00 AM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom padding for scroll */}
              <div className="h-8" />
            </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Icons
function MoonIcon() {
  return (
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3 h-3 text-white/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  );
}
