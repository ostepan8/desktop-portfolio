"use client";

import { motion } from "framer-motion";
import { type FileSystemItem } from "@/lib/filesystem";

export interface FileItemProps {
  item: FileSystemItem;
  isSelected: boolean;
  viewMode: "icons" | "list";
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

export function FinderFileItem({ item, isSelected, viewMode, onClick, onDoubleClick }: FileItemProps) {
  if (viewMode === "icons") {
    return (
      <motion.div
        className={
          "flex flex-col items-center gap-1 p-2 rounded-lg cursor-default select-none " +
          (isSelected ? "bg-white/10" : "hover:bg-white/5")
        }
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-4xl">{item.icon}</span>
        <span
          className={
            "text-xs text-center line-clamp-2 break-all max-w-[72px] px-1 rounded " +
            (isSelected ? "bg-[#0058d1]" : "")
          }
        >
          {item.name}
        </span>
      </motion.div>
    );
  }

  // List view
  const dateStr = item.modifiedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const kindLabels: Record<string, string> = {
    folder: "Folder",
    file: "Document",
    image: "Image",
    link: "Alias",
    app: "Application",
  };

  return (
    <motion.div
      className={
        "flex items-center gap-4 px-2 py-1 rounded cursor-default select-none " +
        (isSelected ? "bg-[#0058d1]" : "hover:bg-white/5")
      }
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-lg shrink-0">{item.icon}</span>
        <span className="text-sm truncate">{item.name}</span>
      </div>
      <span className="w-32 text-xs text-white/50 shrink-0">{dateStr}</span>
      <span className="w-20 text-xs text-white/50 shrink-0">{kindLabels[item.type]}</span>
    </motion.div>
  );
}
