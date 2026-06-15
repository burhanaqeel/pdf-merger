export type UploadedPdf = {
  id: string;
  name: string;
  file: File;
  pageCount: number;
};

export type UploadedFolder = {
  id: string;
  name: string;
  files: UploadedPdf[];
};

export type MergeSource = {
  id: string;
  folderId: string;
  folderName: string;
  name: string;
  file: File;
  pageCount: number;
};

export type MergeGroup = {
  id: string;
  fileName: string;
  sources: MergeSource[];
};

export type MergePage = {
  id: string;
  sourceId: string;
  sourceFileName: string;
  folderName: string;
  pageIndex: number;
};

export type ArrangeGroup = {
  id: string;
  fileName: string;
  sources: MergeSource[];
  pages: MergePage[];
};

export type AppStep = "upload" | "preview" | "arrange" | "done";

export type MergeResult = {
  fileName: string;
  pageCount: number;
  blob: Blob;
};
