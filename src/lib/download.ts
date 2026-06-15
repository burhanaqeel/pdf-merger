import JSZip from "jszip";
import { mergePagesInOrder } from "@/lib/pdf/merge-pages";
import { sanitizeFolderName } from "@/lib/folder-name";
import type { ArrangeGroup, MergeResult } from "@/lib/types";

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function supportsDirectorySave(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function downloadResultsAsFolder(
  results: MergeResult[],
  folderName: string,
): Promise<void> {
  if (results.length === 0) {
    return;
  }

  const safeName = sanitizeFolderName(folderName);
  const zip = new JSZip();
  const folder = zip.folder(safeName);

  if (!folder) {
    throw new Error("Could not create download folder.");
  }

  for (const result of results) {
    folder.file(result.fileName, result.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, `${safeName}.zip`);
}

export async function saveResultsToDirectory(
  results: MergeResult[],
  folderName: string,
): Promise<void> {
  if (!supportsDirectorySave()) {
    throw new Error("Your browser does not support saving to a folder.");
  }

  const safeName = sanitizeFolderName(folderName);
  const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  const outputDir = await dirHandle.getDirectoryHandle(safeName, {
    create: true,
  });

  for (const result of results) {
    const fileHandle = await outputDir.getFileHandle(result.fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();
    await writable.write(result.blob);
    await writable.close();
  }
}

export async function mergeArrangeGroups(
  groups: ArrangeGroup[],
): Promise<MergeResult[]> {
  const results: MergeResult[] = [];

  for (const group of groups) {
    if (group.pages.length === 0) {
      continue;
    }

    const bytes = await mergePagesInOrder(group.pages, group.sources);

    results.push({
      fileName: group.fileName,
      pageCount: group.pages.length,
      blob: new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }),
    });
  }

  return results;
}
