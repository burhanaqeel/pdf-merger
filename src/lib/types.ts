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

export type AppStep = "upload" | "preview" | "done";

export type MergeResult = {
  fileName: string;
  pageCount: number;
  blob: Blob;
};
