"use client";

import { useState } from "react";
import { PROFILE } from "@/constants/profile";

interface PdfViewerProps {
  /** Path to the PDF, defaults to Owen's resume. */
  src?: string;
  fileName?: string;
}

/**
 * Preview-style PDF viewer. Renders the browser's native PDF plugin in an
 * iframe; mobile browsers that can't inline PDFs get a download fallback.
 */
export function PdfViewer({
  src = PROFILE.resumePath,
  fileName = PROFILE.resumeFileName,
}: PdfViewerProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[var(--macos-bg-1,#262626)]">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--macos-bg)] border-b border-white/10 shrink-0">
        <span className="text-sm text-white/80 font-medium truncate">{fileName}</span>
        <div className="ml-auto flex gap-2">
          <a
            href={src}
            download
            className="px-3 py-1 rounded-md bg-[var(--macos-accent)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Download
          </a>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 rounded-md bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
          >
            Open in Tab ↗
          </a>
        </div>
      </div>

      {/* Document */}
      {failed ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center">
          <span className="text-5xl">📄</span>
          <p className="text-white/80 font-medium">
            This browser can&apos;t preview PDFs inline.
          </p>
          <a
            href={src}
            download
            className="px-4 py-2 rounded-lg bg-[var(--macos-accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Download {fileName}
          </a>
        </div>
      ) : (
        <iframe
          src={`${src}#view=FitH`}
          title={fileName}
          className="flex-1 w-full border-0 bg-[#38383d]"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
