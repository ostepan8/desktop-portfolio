"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface DockItemData {
  id: string;
  icon: string;
  label: string;
  isRunning?: boolean;
  onClick?: () => void;
}

interface DockProps {
  items: DockItemData[];
  onItemClick?: (id: string) => void;
}

export function Dock({ items, onItemClick }: DockProps) {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
    >
      <motion.div
        className="h-[68px] px-3 bg-white/10 glass rounded-2xl border border-white/20 flex items-end gap-1 pb-2"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {items.map((item) => (
          <DockIcon
            key={item.id}
            item={item}
            mouseX={mouseX}
            onClick={() => {
              item.onClick?.();
              onItemClick?.(item.id);
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface DockIconProps {
  item: DockItemData;
  mouseX: ReturnType<typeof useMotionValue<number>>;
  onClick?: () => void;
}

function DockIcon({ item, mouseX, onClick }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthSync = useTransform(distance, [-150, 0, 150], [48, 72, 48]);
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="absolute -top-8 px-3 py-1 bg-gray-900/90 text-white text-xs rounded-md whitespace-nowrap pointer-events-none"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 5 }}
        transition={{ duration: 0.15 }}
      >
        {item.label}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90" />
      </motion.div>

      <motion.div
        ref={ref}
        style={{ width, height: width }}
        className="bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-3xl select-none">{item.icon}</span>
      </motion.div>

      {item.isRunning && (
        <motion.div
          className="absolute -bottom-1 w-1 h-1 bg-white/60 rounded-full"
          layoutId={"running-" + item.id}
        />
      )}
    </div>
  );
}

export function DockSeparator() {
  return <div className="w-px h-10 bg-white/20 mx-1 self-center" />;
}
