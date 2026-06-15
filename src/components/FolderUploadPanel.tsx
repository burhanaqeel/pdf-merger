"use client";

import { useRef } from "react";
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
    <section className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Upload PDF folders
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          Add two or more folders. Each folder should contain PDF files only,
          placed directly inside the folder. Files with the same name across
          folders will be merged into one output PDF.
        </p>
      </div>

      <div className="border border-dashed border-neutral-300 px-6 py-10">
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

        <div className="flex flex-col items-start gap-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => inputRef.current?.click()}
            className="border border-black px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Reading PDFs..." : "Select folder"}
          </button>
          <p className="text-xs text-neutral-500">
            Repeat to add more folders. Non-PDF files are ignored.
          </p>
        </div>
      </div>

      {notice && (
        <p className="text-sm text-neutral-600" role="status">
          {notice}
        </p>
      )}

      {folders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-black pb-2">
            <h3 className="text-sm font-semibold uppercase tracking-widest">
              Added folders
            </h3>
            <span className="text-xs text-neutral-500">
              {folders.length} folder{folders.length === 1 ? "" : "s"} ·{" "}
              {totalFiles} PDF{totalFiles === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="divide-y divide-neutral-200">
            {folders.map((folder) => (
              <li
                key={folder.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="font-medium">{folder.name}</p>
                  <ul className="space-y-1 text-sm text-neutral-600">
                    {folder.files.map((file) => (
                      <li key={file.id}>
                        {file.name}{" "}
                        <span className="text-neutral-400">
                          ({file.pageCount} page
                          {file.pageCount === 1 ? "" : "s"})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveFolder(folder.id)}
                  className="text-sm underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={folders.length < 2 || isLoading}
            onClick={onContinue}
            className="border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to preview
          </button>
        </div>
      )}
    </section>
  );
}
