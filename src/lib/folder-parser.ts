import { createId } from "@/lib/id";
import { getPageCount, isPdfFile } from "@/lib/pdf/utils";
import type { UploadedFolder, UploadedPdf } from "@/lib/types";

export type FolderParseResult = {
  folder: UploadedFolder;
  skippedCount: number;
};

export async function parseFolderUpload(
  fileList: FileList,
): Promise<FolderParseResult> {
  const files = Array.from(fileList);

  if (files.length === 0) {
    throw new Error("No files were selected.");
  }

  const folderName =
    files[0].webkitRelativePath.split("/")[0] ?? "Unnamed folder";

  const pdfFiles = files.filter(isPdfFile);
  const skippedCount = files.length - pdfFiles.length;

  if (pdfFiles.length === 0) {
    throw new Error(`"${folderName}" does not contain any PDF files.`);
  }

  const nestedPaths = pdfFiles.filter(
    (file) => file.webkitRelativePath.split("/").length > 2,
  );

  if (nestedPaths.length > 0) {
    throw new Error(
      `"${folderName}" must contain PDF files directly (no subfolders).`,
    );
  }

  const uploadedPdfs: UploadedPdf[] = await Promise.all(
    pdfFiles.map(async (file) => ({
      id: createId(),
      name: file.name,
      file,
      pageCount: await getPageCount(file),
    })),
  );

  uploadedPdfs.sort((a, b) => a.name.localeCompare(b.name));

  return {
    folder: {
      id: createId(),
      name: folderName,
      files: uploadedPdfs,
    },
    skippedCount,
  };
}

export function uniqueFolderName(
  name: string,
  existingNames: string[],
): string {
  if (!existingNames.includes(name)) {
    return name;
  }

  let index = 2;
  while (existingNames.includes(`${name} (${index})`)) {
    index += 1;
  }

  return `${name} (${index})`;
}
