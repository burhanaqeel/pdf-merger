"use client";

import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { UploadedFolder } from "@/lib/types";

type FolderUploadPanelProps = {
  folders: UploadedFolder[];
  isLoading: boolean;
  notice: string | null;
  onAddFolder: (files: FileList) => void;
  onRemoveFolder: (folderId: string) => void;
  onContinue: () => void;
};

export function FolderUploadPanel({
  folders,
  isLoading,
  notice,
  onAddFolder,
  onRemoveFolder,
  onContinue,
}: FolderUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const totalFiles = folders.reduce(
    (sum, folder) => sum + folder.files.length,
    0,
  );

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">Add your folders</h2>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
          Select two or more folders containing PDFs. Files with matching names
          across folders will be merged together.
        </p>
      </div>

      <div
        className="rounded-2xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-6 py-12 text-center transition-colors hover:border-[var(--accent)]/30"
        onClick={() => !isLoading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          // @ts-expect-error webkitdirectory is supported in Chromium browsers
          webkitdirectory=""
          onChange={(event) => {
            const files = event.target.files;
            if (files && files.length > 0) {
              onAddFolder(files);
            }
            event.target.value = "";
          }}
        />

        <div className="mx-auto flex max-w-sm flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--background)] text-xl">
            📁
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isLoading ? "Reading PDF files…" : "Click to select a folder"}
            </p>
            <p className="text-xs text-[var(--muted)]">
              PDF files only · no subfolders · add multiple folders one at a time
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            disabled={isLoading}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            {isLoading ? "Processing…" : "Browse folder"}
          </Button>
        </div>
      </div>

      {notice && (
        <p
          className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800"
          role="status"
        >
          {notice}
        </p>
      )}

      {folders.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold">Uploaded folders</h3>
            <div className="flex gap-2">
              <Badge>{folders.length} folders</Badge>
              <Badge tone="muted">{totalFiles} PDFs</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">📂</span>
                      <p className="truncate font-medium">{folder.name}</p>
                      <Badge tone="muted">
                        {folder.files.length} file
                        {folder.files.length === 1 ? "" : "s"}
                      </Badge>
                    </div>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {folder.files.map((file) => (
                        <li
                          key={file.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-[var(--background)] px-3 py-2 text-sm"
                        >
                          <span className="truncate">{file.name}</span>
                          <span className="shrink-0 text-xs text-[var(--muted)]">
                            {file.pageCount} page
                            {file.pageCount === 1 ? "" : "s"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="shrink-0 text-xs"
                    onClick={() => onRemoveFolder(folder.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            disabled={folders.length < 2 || isLoading}
            onClick={onContinue}
            className="w-full sm:w-auto"
          >
            Continue to preview →
          </Button>
        </div>
      )}
    </section>
  );
}
