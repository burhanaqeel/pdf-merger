"use client";

import { useCallback, useMemo, useState } from "react";
import { reorder } from "@/lib/array";
import {
  downloadResultsAsFolder,
  mergeArrangeGroups,
} from "@/lib/download";
import { parseFolderUpload, uniqueFolderName } from "@/lib/folder-parser";
import { DEFAULT_OUTPUT_FOLDER } from "@/lib/folder-name";
import { buildMergeGroups } from "@/lib/matching";
import { buildArrangeGroups } from "@/lib/pages";
import type {
  AppStep,
  ArrangeGroup,
  MergeGroup,
  MergeResult,
  MergeSource,
  UploadedFolder,
} from "@/lib/types";

export function usePdfMerger() {
  const [step, setStep] = useState<AppStep>("upload");
  const [folders, setFolders] = useState<UploadedFolder[]>([]);
  const [groups, setGroups] = useState<MergeGroup[]>([]);
  const [arrangeGroups, setArrangeGroups] = useState<ArrangeGroup[]>([]);
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

  const isWideStep = step === "arrange";

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

  const handleContinueToArrange = useCallback(() => {
    setArrangeGroups(buildArrangeGroups(mergeableGroups));
    setStep("arrange");
    setError(null);
  }, [mergeableGroups]);

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
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              sources: group.sources.filter((source) => source.id !== sourceId),
            }
          : group,
      ),
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

  const handleMovePage = useCallback(
    (groupId: string, pageId: string, direction: "up" | "down") => {
      setArrangeGroups((current) =>
        current.map((group) => {
          if (group.id !== groupId) {
            return group;
          }

          const index = group.pages.findIndex((page) => page.id === pageId);
          if (index === -1) {
            return group;
          }

          const targetIndex = direction === "up" ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= group.pages.length) {
            return group;
          }

          return {
            ...group,
            pages: reorder(group.pages, index, targetIndex),
          };
        }),
      );
    },
    [],
  );

  const handleRemovePage = useCallback((groupId: string, pageId: string) => {
    setArrangeGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              pages: group.pages.filter((page) => page.id !== pageId),
            }
          : group,
      ),
    );
  }, []);

  const handleMerge = useCallback(async () => {
    setIsMerging(true);
    setError(null);

    try {
      const merged = await mergeArrangeGroups(arrangeGroups);
      setResults(merged);
      setStep("done");
      await downloadResultsAsFolder(merged, outputFolderName);
      setAutoDownloaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Merge failed.");
    } finally {
      setIsMerging(false);
    }
  }, [arrangeGroups, outputFolderName]);

  const handleStartOver = useCallback(() => {
    setStep("upload");
    setFolders([]);
    setGroups([]);
    setArrangeGroups([]);
    setUnmatched([]);
    setResults([]);
    setOutputFolderName(DEFAULT_OUTPUT_FOLDER);
    setAutoDownloaded(false);
    setNotice(null);
    setError(null);
  }, []);

  const handleBackToPreview = useCallback(() => {
    setArrangeGroups(buildArrangeGroups(mergeableGroups));
    setStep("preview");
  }, [mergeableGroups]);

  return {
    step,
    folders,
    groups,
    arrangeGroups,
    unmatched,
    results,
    outputFolderName,
    autoDownloaded,
    isLoading,
    isMerging,
    notice,
    error,
    isWideStep,
    setOutputFolderName,
    setStep,
    handleAddFolder,
    handleRemoveFolder,
    handleContinueToPreview,
    handleContinueToArrange,
    handleReorderSource,
    handleRemoveSource,
    handleMoveGroup,
    handleRemoveGroup,
    handleMovePage,
    handleRemovePage,
    handleMerge,
    handleStartOver,
    handleBackToPreview,
  };
}
