import { createId } from "@/lib/id";
import type { MergeGroup, MergeSource, UploadedFolder } from "@/lib/types";

function normalizeFileName(fileName: string): string {
  return fileName.trim().toLowerCase();
}

export function buildMergeGroups(folders: UploadedFolder[]): {
  groups: MergeGroup[];
  unmatched: MergeSource[];
} {
  const byName = new Map<string, MergeSource[]>();

  for (const folder of folders) {
    for (const pdf of folder.files) {
      const key = normalizeFileName(pdf.name);
      const source: MergeSource = {
        id: createId(),
        folderId: folder.id,
        folderName: folder.name,
        name: pdf.name,
        file: pdf.file,
        pageCount: pdf.pageCount,
      };

      const existing = byName.get(key) ?? [];
      existing.push(source);
      byName.set(key, existing);
    }
  }

  const groups: MergeGroup[] = [];
  const unmatched: MergeSource[] = [];

  const sortedKeys = [...byName.keys()].sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    const sources = byName.get(key) ?? [];

    if (sources.length === 1) {
      unmatched.push(sources[0]);
      continue;
    }

    groups.push({
      id: createId(),
      fileName: sources[0].name,
      sources,
    });
  }

  return { groups, unmatched };
}

export function totalPages(sources: MergeSource[]): number {
  return sources.reduce((sum, source) => sum + source.pageCount, 0);
}
