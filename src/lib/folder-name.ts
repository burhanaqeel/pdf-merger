export const DEFAULT_OUTPUT_FOLDER = "merged-pdfs";

export function sanitizeFolderName(name: string): string {
  const trimmed = name.trim() || DEFAULT_OUTPUT_FOLDER;
  return trimmed
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\.+$/g, "")
    .slice(0, 80);
}
