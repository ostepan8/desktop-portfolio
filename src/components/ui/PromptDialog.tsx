"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  modalBackdropVariants,
  modalPanelVariants,
} from "@/constants/motion";
import { Z_INDEX } from "@/constants/layout";

interface PromptDialogProps {
  isOpen: boolean;
  title: string;
  placeholder?: string;
  defaultValue?: string;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

/**
 * Single-input modal prompt. Replaces the duplicated "New Folder" dialog in
 * Finder and "New File" dialog in TextEdit (same structure, same buttons,
 * same enter/escape handling, slightly different copy).
 */
export function PromptDialog({
  isOpen,
  title,
  placeholder,
  defaultValue = "",
  submitLabel = "Create",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset the field when the dialog opens — done during render (React's
  // "adjust state on prop change" pattern) to avoid a setState-in-effect cascade.
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setValue(defaultValue);
  }

  useEffect(() => {
    if (!isOpen) return;
    // Focus after mount + a frame so AnimatePresence has mounted the panel.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  const submit = () => onSubmit(value);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-black/50"
          style={{ zIndex: Z_INDEX.modal }}
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onCancel}
        >
          <motion.div
            className="bg-[var(--macos-bg-3)] rounded-lg p-4 w-80 border border-white/10 shadow-2xl"
            variants={modalPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-medium mb-3">{title}</h3>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm outline-none focus:border-white/30"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") onCancel();
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded transition-colors"
                onClick={onCancel}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={submit}
              >
                {submitLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
