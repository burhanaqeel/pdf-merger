import { PDFDocument } from "pdf-lib";
import type { MergePage, MergeSource } from "@/lib/types";

export async function mergePagesInOrder(
  pages: MergePage[],
  sources: MergeSource[],
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  const docCache = new Map<string, PDFDocument>();

  for (const source of sources) {
    const bytes = await source.file.arrayBuffer();
    docCache.set(
      source.id,
      await PDFDocument.load(bytes, { ignoreEncryption: true }),
    );
  }

  for (const page of pages) {
    const doc = docCache.get(page.sourceId);
    if (!doc) {
      continue;
    }

    const [copied] = await merged.copyPages(doc, [page.pageIndex]);
    merged.addPage(copied);
  }

  return merged.save();
}
