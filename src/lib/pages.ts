import { createId } from "@/lib/id";
import type { ArrangeGroup, MergeGroup, MergePage } from "@/lib/types";

export function buildPagesFromGroup(group: MergeGroup): MergePage[] {
  const pages: MergePage[] = [];

  for (const source of group.sources) {
    for (let pageIndex = 0; pageIndex < source.pageCount; pageIndex += 1) {
      pages.push({
        id: createId(),
        sourceId: source.id,
        sourceFileName: source.name,
        folderName: source.folderName,
        pageIndex,
      });
    }
  }

  return pages;
}

export function buildArrangeGroups(groups: MergeGroup[]): ArrangeGroup[] {
  return groups
    .filter((group) => group.sources.length >= 2)
    .map((group) => ({
      id: group.id,
      fileName: group.fileName,
      sources: group.sources,
      pages: buildPagesFromGroup(group),
    }));
}

export function getSourceFile(
  sources: ArrangeGroup["sources"],
  sourceId: string,
): File | undefined {
  return sources.find((source) => source.id === sourceId)?.file;
}
