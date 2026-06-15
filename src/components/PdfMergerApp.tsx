"use client";

import { useCallback, useMemo, useState } from "react";
import { DownloadPanel } from "@/components/DownloadPanel";
import { FolderUploadPanel } from "@/components/FolderUploadPanel";
import { MergePreviewPanel } from "@/components/MergePreviewPanel";
import { StepIndicator } from "@/components/StepIndicator";
import { downloadResultsAsFolder } from "@/lib/download";
import { parseFolderUpload, uniqueFolderName } from "@/lib/folder-parser";
import { DEFAULT_OUTPUT_FOLDER } from "@/lib/folder-name";
import { buildMergeGroups } from "@/lib/matching";
import { mergeAllGroups } from "@/lib/merge-service";
import type {
  AppStep,
  MergeGroup,
  MergeResult,
  MergeSource,
  UploadedFolder,
} from "@/lib/types";

function reorder<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function PdfMergerApp() {
  const [step, setStep] = useState<AppStep>("upload");
  const [folders, setFolders] = useState<UploadedFolder[]>([]);
  const [groups, setGroups] = useState<MergeGroup[]>([]);
  const [unmatched, setUnmatched] = useState<MergeSource[]>([]);
  const [results, setResults] = useState<MergeResult[]>([]);
  const [outputFolderName, setOutputFolderName] = useState(DEFAULT_OUTPUT_FOLDER);
  const [autoDownloaded, setAutoDownloaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mergeableGroups = useMemo(
    () => groups.filter((group) => group.sources.length >= 2),
    [groups],
  );

  const handleAddFolder = useCallback(async (fileList: FileList) => {
    setError(null);
    setNotice(null);
    setIsLoading(true);

    try {
      const { folder, skippedCount } = await parseFolderUpload(fileList);

      setFolders((current) => {
        const name = uniqueFolderName(
          folder.name,
          current.map((item) => item.name),
        );

        return [...current, { ...folder, name }];
      });

      if (skippedCount > 0) {
        setNotice(
          `Ignored ${skippedCount} non-PDF file${skippedCount === 1 ? "" : "s"} in "${folder.name}".`,
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read folder.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRemoveFolder = useCallback((folderId: string) => {
    setFolders((current) => current.filter((folder) => folder.id !== folderId));
    setNotice(null);
    setError(null);
  }, []);

  const handleContinueToPreview = useCallback(() => {
    const { groups: nextGroups, unmatched: nextUnmatched } =
      buildMergeGroups(folders);

    setGroups(nextGroups);
    setUnmatched(nextUnmatched);
    setStep("preview");
    setError(null);
  }, [folders]);

  const handleReorderSource = useCallback(
    (groupId: string, sourceId: string, direction: "up" | "down") => {
      setGroups((current) =>
        current.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          const index = group.sources.findIndex(
            (source) => source.id === sourceId,
          );

          if (index === -1) {
            return group;
          }

          const targetIndex = direction === "up" ? index - 1 : index + 1;

          if (targetIndex < 0 || targetIndex >= group.sources.length) {
            return group;
          }

          return {
            ...group,
            sources: reorder(group.sources, index, targetIndex),
          };
        }),
      );
    },
    [],
  );

  const handleRemoveSource = useCallback((groupId: string, sourceId: string) => {
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        return {
          ...group,
          sources: group.sources.filter((source) => source.id !== sourceId),
        };
      }),
    );
  }, []);

  const handleMoveGroup = useCallback(
    (groupId: string, direction: "up" | "down") => {
      setGroups((current) => {
        const index = current.findIndex((group) => group.id === groupId);

        if (index === -1) {
          return current;
        }

        const targetIndex = direction === "up" ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= current.length) {
          return current;
        }

        return reorder(current, index, targetIndex);
      });
    },
    [],
  );

  const handleRemoveGroup = useCallback((groupId: string) => {
    setGroups((current) => current.filter((group) => group.id !== groupId));
  }, []);

  const handleMerge = useCallback(async () => {
    setIsMerging(true);
    setError(null);

    try {
      const merged = await mergeAllGroups(mergeableGroups);
      setResults(merged);
      setStep("done");

      await downloadResultsAsFolder(merged, outputFolderName);
      setAutoDownloaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed.");
    } finally {
      setIsMerging(false);
    }
  }, [mergeableGroups, outputFolderName]);

  const handleStartOver = useCallback(() => {
    setStep("upload");
    setFolders([]);
    setGroups([]);
    setUnmatched([]);
    setResults([]);
    setOutputFolderName(DEFAULT_OUTPUT_FOLDER);
    setAutoDownloaded(false);
    setNotice(null);
    setError(null);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8 sm:py-14">
        <header className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-sm text-white">
                PDF
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  PDF Merger
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  Match by filename · merge · download
                </p>
              </div>
            </div>
          </div>
          <StepIndicator current={step} />
        </header>

        <main className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          {error && (
            <div
              className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {step === "upload" && (
            <FolderUploadPanel
              folders={folders}
              isLoading={isLoading}
              notice={notice}
              onAddFolder={handleAddFolder}
              onRemoveFolder={handleRemoveFolder}
              onContinue={handleContinueToPreview}
            />
          )}

          {step === "preview" && (
            <MergePreviewPanel
              groups={groups}
              unmatched={unmatched}
              outputFolderName={outputFolderName}
              isMerging={isMerging}
              onOutputFolderNameChange={setOutputFolderName}
              onReorderSource={handleReorderSource}
              onRemoveSource={handleRemoveSource}
              onMoveGroup={handleMoveGroup}
              onRemoveGroup={handleRemoveGroup}
              onBack={() => setStep("upload")}
              onMerge={handleMerge}
            />
          )}

          {step === "done" && (
            <DownloadPanel
              results={results}
              outputFolderName={outputFolderName}
              autoDownloaded={autoDownloaded}
              onOutputFolderNameChange={setOutputFolderName}
              onStartOver={handleStartOver}
            />
          )}
        </main>

        <footer className="text-center text-xs text-[var(--muted)]">
          All processing happens in your browser. Files never leave your device.
        </footer>
      </div>
    </div>
  );
}
