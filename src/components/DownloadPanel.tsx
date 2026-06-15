"use client";

import type { MergeResult } from "@/lib/types";

type DownloadPanelProps = {
  results: MergeResult[];
  onDownloadZip: () => void;
  onDownloadIndividual: () => void;
  onStartOver: () => void;
};

export function DownloadPanel({
  results,
  onDownloadZip,
  onDownloadIndividual,
  onStartOver,
}: DownloadPanelProps) {
  const totalPages = results.reduce(
    (sum, result) => sum + result.pageCount,
    0,
  );

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">Merge complete</h2>
        <p className="text-sm text-neutral-600">
          {results.length} PDF{results.length === 1 ? "" : "s"} created ·{" "}
          {totalPages} total page{totalPages === 1 ? "" : "s"}
        </p>
      </div>

      <ul className="divide-y divide-neutral-200">
        {results.map((result) => (
          <li
            key={result.fileName}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span>{result.fileName}</span>
            <span className="text-neutral-500">
              {result.pageCount} page{result.pageCount === 1 ? "" : "s"}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-4 border-t border-black pt-6">
        {results.length > 1 && (
          <button
            type="button"
            onClick={onDownloadZip}
            className="border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          >
            Download all as ZIP
          </button>
        )}
        <button
          type="button"
          onClick={onDownloadIndividual}
          className="border border-black px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
        >
          {results.length === 1 ? "Download PDF" : "Download individually"}
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="text-sm underline underline-offset-4"
        >
          Start over
        </button>
      </div>
    </section>
  );
}
