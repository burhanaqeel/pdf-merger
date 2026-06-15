"use client";

import { useState } from "react";
import { PageThumbnail } from "@/components/PageThumbnail";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DEFAULT_OUTPUT_FOLDER } from "@/lib/folder-name";
import { getSourceFile } from "@/lib/pages";
import type { ArrangeGroup, MergePage } from "@/lib/types";

type PageArrangePanelProps = {
  arrangeGroups: ArrangeGroup[];
  outputFolderName: string;
  isMerging: boolean;
  onOutputFolderNameChange: (name: string) => void;
  onMovePage: (
    groupId: string,
    pageId: string,
    direction: "up" | "down",
  ) => void;
  onRemovePage: (groupId: string, pageId: string) => void;
  onBack: () => void;
  onMerge: () => void;
};

function PageRow({
  page,
  index,
  total,
  file,
  onMove,
  onRemove,
}: {
  page: MergePage;
  index: number;
  total: number;
  file: File | undefined;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  return (
    <li className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="w-full sm:w-36 shrink-0">
          {file ? (
            <PageThumbnail
              file={file}
              pageIndex={page.pageIndex}
              label={`Page ${index + 1}`}
            />
          ) : (
            <div className="flex aspect-[3/4] items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--muted)]">
              No preview
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold">Page {index + 1}</span>
              <Badge tone="muted">of {total}</Badge>
            </div>
            <p className="text-sm text-[var(--foreground)]">
              {page.sourceFileName}
            </p>
            <p className="text-xs text-[var(--muted)]">
              From {page.folderName} · source page {page.pageIndex + 1}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-3 text-xs"
              disabled={index === 0}
              onClick={() => onMove("up")}
            >
              ↑ Move up
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-8 px-3 text-xs"
              disabled={index === total - 1}
              onClick={() => onMove("down")}
            >
              ↓ Move down
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-3 text-xs text-red-600"
              disabled={total <= 1}
              onClick={onRemove}
            >
              Remove page
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}

export function PageArrangePanel({
  arrangeGroups,
  outputFolderName,
  isMerging,
  onOutputFolderNameChange,
  onMovePage,
  onRemovePage,
  onBack,
  onMerge,
}: PageArrangePanelProps) {
  const [activeTab, setActiveTab] = useState(0);
  const activeGroup = arrangeGroups[activeTab];

  if (arrangeGroups.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)]">
        No files to arrange. Go back and add matching folders.
      </p>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Arrange merged pages
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
          Each tab is a merged output file. Reorder or remove individual pages
          before downloading the final folder.
        </p>
      </div>

      <div className="max-w-md">
        <Input
          label="Output folder name"
          hint={`Default: ${DEFAULT_OUTPUT_FOLDER}. Downloads as a ZIP containing this folder.`}
          value={outputFolderName}
          onChange={(event) => onOutputFolderNameChange(event.target.value)}
          placeholder={DEFAULT_OUTPUT_FOLDER}
        />
      </div>

      <div className="overflow-x-auto border-b border-[var(--border)]">
        <div className="flex min-w-max gap-1" role="tablist">
          {arrangeGroups.map((group, index) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={activeTab === index}
              onClick={() => setActiveTab(index)}
              className={`rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === index
                  ? "bg-[var(--background)] text-[var(--foreground)] border border-b-0 border-[var(--border)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="block max-w-[10rem] truncate">{group.fileName}</span>
              <span className="mt-0.5 block text-xs font-normal text-[var(--muted)]">
                {group.pages.length} page{group.pages.length === 1 ? "" : "s"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {activeGroup && (
        <div role="tabpanel" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">{activeGroup.fileName}</h3>
              <p className="text-sm text-[var(--muted)]">
                {activeGroup.pages.length} page
                {activeGroup.pages.length === 1 ? "" : "s"} in final merge order
              </p>
            </div>
            <Badge tone="success">
              {activeGroup.sources.length} sources combined
            </Badge>
          </div>

          <ul className="space-y-3">
            {activeGroup.pages.map((page, index) => (
              <PageRow
                key={page.id}
                page={page}
                index={index}
                total={activeGroup.pages.length}
                file={getSourceFile(activeGroup.sources, page.sourceId)}
                onMove={(direction) =>
                  onMovePage(activeGroup.id, page.id, direction)
                }
                onRemove={() => onRemovePage(activeGroup.id, page.id)}
              />
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        <Button type="button" variant="secondary" disabled={isMerging} onClick={onBack}>
          ← Back
        </Button>
        <Button type="button" disabled={isMerging} onClick={onMerge}>
          {isMerging ? "Merging…" : "Merge & download folder"}
        </Button>
      </div>
    </section>
  );
}
