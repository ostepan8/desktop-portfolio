"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useFileSystem } from "@/lib/filesystem";
import { PromptDialog } from "@/components/ui/PromptDialog";

interface TextEditProps {
  fileId?: string;
  onTitleChange?: (title: string) => void;
}

export function TextEdit({ fileId, onTitleChange }: TextEditProps) {
  const { getItem, updateItem, createFile } = useFileSystem();
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("Untitled.txt");
  const [currentFileId, setCurrentFileId] = useState<string | null>(fileId || null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load file content when the target fileId changes. Done during render
  // (React's "adjust state on prop change" pattern) to avoid a setState-in-
  // effect cascade; the parent-title notification stays in the effect below.
  const [loadedFileId, setLoadedFileId] = useState<string | undefined>(undefined);
  if (fileId !== loadedFileId) {
    setLoadedFileId(fileId);
    if (fileId) {
      const file = getItem(fileId);
      if (file && file.type === "file") {
        setContent(file.content || "");
        setFileName(file.name);
        setCurrentFileId(fileId);
      }
    }
  }

  // Reflect the loaded file's name in the window title (parent-side effect).
  useEffect(() => {
    if (!fileId) return;
    const file = getItem(fileId);
    if (file && file.type === "file") onTitleChange?.(file.name);
  }, [fileId, getItem, onTitleChange]);

  const handleSave = useCallback(() => {
    if (currentFileId) {
      updateItem(currentFileId, { content });
      setIsDirty(false);
      setLastSaved(new Date());
    }
  }, [currentFileId, content, updateItem]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!isDirty || !currentFileId) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, isDirty, currentFileId, handleSave]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const handleNewFile = useCallback(() => {
    if (isDirty && currentFileId) {
      handleSave();
    }
    setShowNewFileDialog(true);
  }, [isDirty, currentFileId, handleSave]);

  const createNewFile = useCallback(
    (rawName: string) => {
      const name = rawName.trim() || "Untitled.txt";
      const file = createFile(name, null, "");
      setCurrentFileId(file.id);
      setFileName(name);
      setContent("");
      setIsDirty(false);
      setLastSaved(null);
      setShowNewFileDialog(false);
      onTitleChange?.(name);
    },
    [createFile, onTitleChange],
  );

  // Word and character count
  const stats = {
    characters: content.length,
    words: content.trim() ? content.trim().split(/\s+/).length : 0,
    lines: content.split("\n").length,
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#2d2d2d] border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 text-sm text-white/80 hover:bg-white/10 rounded transition-colors"
            onClick={handleNewFile}
          >
            New
          </button>
          <button
            className={
              "px-3 py-1 text-sm rounded transition-colors " +
              (isDirty
                ? "text-white bg-blue-500 hover:bg-blue-600"
                : "text-white/50 cursor-default")
            }
            onClick={handleSave}
            disabled={!isDirty}
          >
            Save
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-white/40">
          {lastSaved && (
            <span>
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          {isDirty && <span className="text-yellow-400">Unsaved changes</span>}
        </div>
      </div>

      {/* File name */}
      <div className="px-4 py-2 border-b border-white/5">
        <input
          type="text"
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
            setIsDirty(true);
            onTitleChange?.(e.target.value);
          }}
          className="bg-transparent text-white/90 text-sm font-medium outline-none border-none w-full"
          placeholder="File name"
        />
      </div>

      {/* Editor */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-white/90 font-mono text-sm leading-relaxed resize-none outline-none"
          placeholder="Start typing..."
          spellCheck={false}
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] border-t border-white/10 text-xs text-white/40">
        <div className="flex items-center gap-4">
          <span>{stats.lines} lines</span>
          <span>{stats.words} words</span>
          <span>{stats.characters} characters</span>
        </div>
        <div>
          <span>Plain Text</span>
        </div>
      </div>

      <PromptDialog
        isOpen={showNewFileDialog}
        title="New File"
        placeholder="File name (e.g., notes.txt)"
        submitLabel="Create"
        onSubmit={createNewFile}
        onCancel={() => setShowNewFileDialog(false)}
      />
    </div>
  );
}
