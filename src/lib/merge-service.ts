import { mergePdfFiles } from "@/lib/pdf/utils";
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
