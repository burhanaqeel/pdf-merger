"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  downloadResultsAsFolder,
  saveResultsToDirectory,
  supportsDirectorySave,
} from "@/lib/download";
import { DEFAULT_OUTPUT_FOLDER } from "@/lib/folder-name";
import type { MergeResult } from "@/lib/types";

type DownloadPanelProps = {
  results: MergeResult[];
  outputFolderName: string;
  autoDownloaded: boolean;
  onOutputFolderNameChange: (name: string) => void;
  onStartOver: () => void;
};

export function DownloadPanel({
  results,
  outputFolderName,
  autoDownloaded,
  onOutputFolderNameChange,
  onStartOver,
}: DownloadPanelProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(
    autoDownloaded
      ? `Download started — check your downloads for "${outputFolderName}.zip"`
      : null,
  );

  const totalPages = results.reduce(
    (sum, result) => sum + result.pageCount,
    0,
  );

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    setMessage(null);
    try {
      await downloadResultsAsFolder(results, outputFolderName);
      setMessage(`Saved as ${outputFolderName.trim() || DEFAULT_OUTPUT_FOLDER}.zip`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Download failed.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveToFolder = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await saveResultsToDirectory(results, outputFolderName);
      setMessage(
        `Files saved to folder "${outputFolderName.trim() || DEFAULT_OUTPUT_FOLDER}"`,
      );
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      setMessage(err instanceof Error ? err.message : "Could not save to folder.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-emerald-200 bg-[var(--success-bg)] px-6 py-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
          ✓
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Merge complete</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {results.length} PDF{results.length === 1 ? "" : "s"} · {totalPages}{" "}
          total page{totalPages === 1 ? "" : "s"}
        </p>
      </div>

      <div className="max-w-md">
        <Input
          label="Output folder name"
          hint="ZIP contains a folder with this name. Unzip to get your merged PDFs."
          value={outputFolderName}
          onChange={(event) => onOutputFolderNameChange(event.target.value)}
          placeholder={DEFAULT_OUTPUT_FOLDER}
        />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-3">
          <p className="text-sm font-semibold">Merged files</p>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {results.map((result) => (
            <li
              key={result.fileName}
              className="flex items-center justify-between gap-4 px-5 py-3.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-sm">📄</span>
                <span className="truncate text-sm font-medium">
                  {result.fileName}
                </span>
              </div>
              <Badge tone="muted">
                {result.pageCount} page{result.pageCount === 1 ? "" : "s"}
              </Badge>
            </li>
          ))}
        </ul>
      </div>

      {message && (
        <p
          className="rounded-lg bg-[var(--background)] px-4 py-3 text-sm text-[var(--muted)]"
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={handleDownloadZip}
          disabled={isDownloading || isSaving}
        >
          {isDownloading ? "Preparing…" : "Download folder (ZIP)"}
        </Button>
        {supportsDirectorySave() && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveToFolder}
            disabled={isDownloading || isSaving}
          >
            {isSaving ? "Saving…" : "Save to folder…"}
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onStartOver}>
          Start over
        </Button>
      </div>
    </section>
  );
}
