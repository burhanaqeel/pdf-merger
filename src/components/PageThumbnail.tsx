"use client";

import { useEffect, useState } from "react";
import { renderPageThumbnail } from "@/lib/pdf/thumbnail";

type PageThumbnailProps = {
  file: File;
  pageIndex: number;
  label: string;
};

export function PageThumbnail({ file, pageIndex, label }: PageThumbnailProps) {
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    renderPageThumbnail(file, pageIndex)
      .then((dataUrl) => {
        if (!cancelled) {
          setSrc(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file, pageIndex]);

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="h-full w-full object-contain" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs text-[var(--muted)]">
          {error ? "Preview unavailable" : "Loading…"}
        </div>
      )}
    </div>
  );
}
