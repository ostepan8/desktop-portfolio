"use client";

import { useState, useCallback, useRef, useEffect, KeyboardEvent } from "react";
import { useFileSystem } from "@/lib/filesystem";

interface TerminalLine {
  id: number;
  type: "input" | "output" | "error";
  content: string;
}

const WELCOME_MESSAGE = `Welcome to Portfolio Terminal v1.0.0
Type 'help' to see available commands.
`;

const EASTER_EGGS: Record<string, string> = {
  "sudo rm -rf /": "Nice try! 😈 This is a virtual filesystem.",
  "vim": "Vim? In this economy? Try 'cat' instead.",
  "emacs": "There's no escape from Emacs... or is there? (Try Ctrl+C)",
  "exit": "You can close this window with the red button.",
  "coffee": "☕ Here's your coffee! Now back to work.",
  "hello": "Hello there, fellow developer! 👋",
  "matrix": "Unfortunately, no one can be told what the Matrix is...",
  "42": "The answer to life, the universe, and everything!",
  "ping": "Pong! 🏓",
  "fortune": "Your code will compile on the first try today. (Just kidding)",
};

export function Terminal() {
  const { getChildren, getItem, getPath } = useFileSystem();
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 0, type: "output", content: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lineIdRef = useRef(1);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input on click
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Get current directory name for prompt
  const getCurrentDirName = useCallback(() => {
    if (currentDir === null) return "~";
    const item = getItem(currentDir);
    return item?.name || "~";
  }, [currentDir, getItem]);

  // Get prompt string
  const getPrompt = useCallback(() => {
    return `owen@portfolio:${getCurrentDirName()}$`;
  }, [getCurrentDirName]);

  // Add output line
  const addOutput = useCallback((content: string, type: "output" | "error" = "output") => {
    setLines((prev) => [
      ...prev,
      { id: lineIdRef.current++, type, content },
    ]);
  }, []);

  // Execute command
  const executeCommand = useCallback((cmd: string) => {
    const trimmedCmd = cmd.trim();
    if (!trimmedCmd) return;

    // Add input line
    setLines((prev) => [
      ...prev,
      { id: lineIdRef.current++, type: "input", content: `${getPrompt()} ${trimmedCmd}` },
    ]);

    // Add to history
    setHistory((prev) => [...prev, trimmedCmd]);
    setHistoryIndex(-1);

    // Parse command
    const parts = trimmedCmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Check for easter eggs first
    if (EASTER_EGGS[trimmedCmd.toLowerCase()]) {
      addOutput(EASTER_EGGS[trimmedCmd.toLowerCase()]);
      return;
    }

    // Execute command
    switch (command) {
      case "help":
        addOutput(`Available commands:
  help     - Show this help message
  ls       - List directory contents
  cd       - Change directory
  cat      - Display file contents
  pwd      - Print working directory
  whoami   - Display current user
  echo     - Echo text
  clear    - Clear terminal
  date     - Display current date
  history  - Show command history

Easter eggs? Try typing something fun! 🥚`);
        break;

      case "ls": {
        const children = getChildren(currentDir);
        if (children.length === 0) {
          addOutput("(empty directory)");
        } else {
          const output = children
            .map((item) => (item.type === "folder" ? `${item.name}/` : item.name))
            .join("  ");
          addOutput(output);
        }
        break;
      }

      case "cd": {
        const target = args[0];
        if (!target || target === "~") {
          setCurrentDir(null);
        } else if (target === "..") {
          if (currentDir) {
            const currentItem = getItem(currentDir);
            setCurrentDir(currentItem?.parentId ?? null);
          }
        } else {
          const children = getChildren(currentDir);
          const found = children.find(
            (item) => item.name.toLowerCase() === target.toLowerCase() && item.type === "folder"
          );
          if (found) {
            setCurrentDir(found.id);
          } else {
            addOutput(`cd: ${target}: No such directory`, "error");
          }
        }
        break;
      }

      case "cat": {
        const filename = args[0];
        if (!filename) {
          addOutput("cat: missing file operand", "error");
          break;
        }
        const children = getChildren(currentDir);
        const file = children.find(
          (item) => item.name.toLowerCase() === filename.toLowerCase() && item.type !== "folder"
        );
        if (file) {
          addOutput(file.content || "(empty file)");
        } else {
          addOutput(`cat: ${filename}: No such file`, "error");
        }
        break;
      }

      case "pwd": {
        if (currentDir === null) {
          addOutput("/Users/owen");
        } else {
          const path = getPath(currentDir);
          addOutput("/Users/owen/" + path.map((p) => p.name).join("/"));
        }
        break;
      }

      case "whoami":
        addOutput("owen");
        break;

      case "echo":
        addOutput(args.join(" "));
        break;

      case "clear":
        setLines([]);
        break;

      case "date":
        addOutput(new Date().toString());
        break;

      case "history":
        if (history.length === 0) {
          addOutput("(no history)");
        } else {
          addOutput(history.map((h, i) => `  ${i + 1}  ${h}`).join("\n"));
        }
        break;

      case "neofetch":
        addOutput(`
       ████████████████       owen@portfolio
   ████████████████████████   ---------------
 ████████████████████████████ OS: Portfolio OS 1.0
█████████████████████████████ Host: Next.js 16
█████████████████████████████ Kernel: React 19
█████████████████████████████ Shell: Terminal 1.0
█████████████████████████████ Resolution: ${window.innerWidth}x${window.innerHeight}
 ████████████████████████████ Theme: macOS Dark
   ████████████████████████   Terminal: Portfolio Terminal
       ████████████████       CPU: Your Browser @ 60fps
`);
        break;

      default:
        addOutput(`${command}: command not found. Type 'help' for available commands.`, "error");
    }
  }, [currentDir, getChildren, getItem, getPath, getPrompt, addOutput, history]);

  // Handle key press
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      executeCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length > 0) {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(history[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= history.length) {
          setHistoryIndex(-1);
          setInput("");
        } else {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
    } else if (e.key === "c" && e.ctrlKey) {
      setInput("");
      addOutput("^C");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }, [input, executeCommand, history, historyIndex, addOutput]);

  return (
    <div
      ref={containerRef}
      className="h-full bg-[var(--macos-bg)] font-mono text-sm text-green-400 overflow-auto p-4 cursor-text"
      onClick={handleContainerClick}
    >
      {/* Output lines */}
      {lines.map((line) => (
        <div
          key={line.id}
          className={
            "whitespace-pre-wrap break-all " +
            (line.type === "error" ? "text-red-400" : line.type === "input" ? "text-white" : "")
          }
        >
          {line.content}
        </div>
      ))}

      {/* Input line */}
      <div className="flex items-center">
        <span className="text-white">{getPrompt()}</span>
        <span className="ml-2">&nbsp;</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
      </div>
    </div>
  );
}
