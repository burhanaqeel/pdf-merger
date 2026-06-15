import JSZip from "jszip";
import { mergePdfFiles, downloadBlob } from "@/lib/pdf/utils";
import type { MergeGroup, MergeResult } from "@/lib/types";
import { totalPages } from "@/lib/matching";

export async function mergeAllGroups(
  groups: MergeGroup[],
): Promise<MergeResult[]> {
  const results: MergeResult[] = [];

  for (const group of groups) {
    if (group.sources.length === 0) {
      continue;
    }

    const bytes = await mergePdfFiles(group.sources.map((s) => s.file));
    const pageCount = totalPages(group.sources);

    results.push({
      fileName: group.fileName,
      pageCount,
      blob: new Blob([Uint8Array.from(bytes)], { type: "application/pdf" }),
    });
  }

  return results;
}

export async function downloadResults(
  results: MergeResult[],
  asZip: boolean,
): Promise<void> {
  if (results.length === 0) {
    return;
  }

  if (!asZip || results.length === 1) {
    for (const result of results) {
      downloadBlob(result.blob, result.fileName);
    }
    return;
  }

  const zip = new JSZip();

  for (const result of results) {
    zip.file(result.fileName, result.blob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  downloadBlob(zipBlob, "merged-pdfs.zip");
}
