"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useFileSystem } from "@/lib/filesystem";

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
  const [newFileName, setNewFileName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load file content on mount
  useEffect(() => {
    if (fileId) {
      const file = getItem(fileId);
      if (file && file.type === "file") {
        setContent(file.content || "");
        setFileName(file.name);
        setCurrentFileId(fileId);
        onTitleChange?.(file.name);
      }
    }
  }, [fileId, getItem, onTitleChange]);

  // Auto-save after 2 seconds of inactivity
  useEffect(() => {
    if (!isDirty || !currentFileId) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, isDirty, currentFileId]);

  const handleSave = useCallback(() => {
    if (currentFileId) {
      updateItem(currentFileId, { content });
      setIsDirty(false);
      setLastSaved(new Date());
    }
  }, [currentFileId, content, updateItem]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);
  }, []);

  const handleNewFile = useCallback(() => {
    if (isDirty && currentFileId) {
      handleSave();
    }
    setShowNewFileDialog(true);
    setNewFileName("");
  }, [isDirty, currentFileId, handleSave]);

  const createNewFile = useCallback(() => {
    const name = newFileName.trim() || "Untitled.txt";
    const file = createFile(name, null, "");
    setCurrentFileId(file.id);
    setFileName(name);
    setContent("");
    setIsDirty(false);
    setLastSaved(null);
    setShowNewFileDialog(false);
    onTitleChange?.(name);
  }, [newFileName, createFile, onTitleChange]);

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

      {/* New file dialog */}
      {showNewFileDialog && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2d2d2d] rounded-lg p-4 w-80 border border-white/10 shadow-2xl">
            <h3 className="text-white font-medium mb-3">New File</h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="File name (e.g., notes.txt)"
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm outline-none focus:border-white/30"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") createNewFile();
                if (e.key === "Escape") setShowNewFileDialog(false);
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-3 py-1.5 text-sm text-white/70 hover:bg-white/10 rounded transition-colors"
                onClick={() => setShowNewFileDialog(false)}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={createNewFile}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
