"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { totalPages } from "@/lib/matching";
import type { MergeGroup, MergeSource } from "@/lib/types";

type MergePreviewPanelProps = {
  groups: MergeGroup[];
  unmatched: MergeSource[];
  onReorderSource: (
    groupId: string,
    sourceId: string,
    direction: "up" | "down",
  ) => void;
  onRemoveSource: (groupId: string, sourceId: string) => void;
  onMoveGroup: (groupId: string, direction: "up" | "down") => void;
  onRemoveGroup: (groupId: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

function SourceRow({
  source,
  index,
  total,
  onMove,
  onRemove,
}: {
  source: MergeSource;
  index: number;
  total: number;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  return (
    <li className="flex items-center gap-3 rounded-lg bg-[var(--background)] px-3 py-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--muted)] border border-[var(--border)]">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{source.folderName}</p>
        <p className="text-xs text-[var(--muted)]">
          {source.pageCount} page{source.pageCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 px-0 text-xs"
          disabled={index === 0}
          onClick={() => onMove("up")}
          aria-label="Move up"
        >
          ↑
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 w-8 px-0 text-xs"
          disabled={index === total - 1}
          onClick={() => onMove("down")}
          aria-label="Move down"
        >
          ↓
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-2 text-xs text-red-600"
          onClick={onRemove}
        >
          ✕
        </Button>
      </div>
    </li>
  );
}

function MergeGroupBlock({
  group,
  index,
  totalGroups,
  onReorderSource,
  onRemoveSource,
  onMoveGroup,
  onRemoveGroup,
}: {
  group: MergeGroup;
  index: number;
  totalGroups: number;
  onReorderSource: MergePreviewPanelProps["onReorderSource"];
  onRemoveSource: MergePreviewPanelProps["onRemoveSource"];
  onMoveGroup: MergePreviewPanelProps["onMoveGroup"];
  onRemoveGroup: MergePreviewPanelProps["onRemoveGroup"];
}) {
  const pages = totalPages(group.sources);

  return (
    <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">{group.fileName}</h3>
            <Badge tone="success">{pages} pages merged</Badge>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {group.sources.length} source
            {group.sources.length === 1 ? "" : "s"} · pages combined in order below
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={index === 0}
            onClick={() => onMoveGroup(group.id, "up")}
          >
            ↑ Move up
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-8 px-3 text-xs"
            disabled={index === totalGroups - 1}
            onClick={() => onMoveGroup(group.id, "down")}
          >
            ↓ Move down
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-3 text-xs"
            onClick={() => onRemoveGroup(group.id)}
          >
            Skip
          </Button>
        </div>
      </div>

      <ul className="space-y-2">
        {group.sources.map((source, sourceIndex) => (
          <SourceRow
            key={source.id}
            source={source}
            index={sourceIndex}
            total={group.sources.length}
            onMove={(direction) =>
              onReorderSource(group.id, source.id, direction)
            }
            onRemove={() => onRemoveSource(group.id, source.id)}
          />
        ))}
      </ul>
    </article>
  );
}

export function MergePreviewPanel({
  groups,
  unmatched,
  onReorderSource,
  onRemoveSource,
  onMoveGroup,
  onRemoveGroup,
  onBack,
  onContinue,
}: MergePreviewPanelProps) {
  const [showUnmatched, setShowUnmatched] = useState(unmatched.length > 0);

  const mergeableGroups = groups.filter((group) => group.sources.length >= 2);
  const invalidGroups = groups.filter((group) => group.sources.length < 2);

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Review merge order
        </h2>
        <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
          Files are matched by name. Reorder sources to set the initial page
          sequence, then continue to arrange individual pages.
        </p>
      </div>

      {mergeableGroups.length === 0 ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-8 text-center text-sm text-[var(--muted)]">
          No matching file names found across folders. Go back and add folders
          that share PDF file names.
        </p>
      ) : (
        <div className="space-y-4">
          {mergeableGroups.map((group, index) => (
            <MergeGroupBlock
              key={group.id}
              group={group}
              index={index}
              totalGroups={mergeableGroups.length}
              onReorderSource={onReorderSource}
              onRemoveSource={onRemoveSource}
              onMoveGroup={onMoveGroup}
              onRemoveGroup={onRemoveGroup}
            />
          ))}
        </div>
      )}

      {invalidGroups.length > 0 && (
        <p className="text-sm text-[var(--muted)]">
          {invalidGroups.length} group
          {invalidGroups.length === 1 ? "" : "s"} with fewer than 2 sources will
          be skipped.
        </p>
      )}

      {showUnmatched && unmatched.length > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Unmatched files</h3>
            <Button
              type="button"
              variant="ghost"
              className="h-8 px-2 text-xs"
              onClick={() => setShowUnmatched(false)}
            >
              Hide
            </Button>
          </div>
          <p className="mb-3 text-sm text-[var(--muted)]">
            These appear in only one folder and won&apos;t be included.
          </p>
          <ul className="space-y-2">
            {unmatched.map((source) => (
              <li
                key={source.id}
                className="flex items-center justify-between rounded-lg bg-[var(--background)] px-3 py-2 text-sm"
              >
                <span>{source.name}</span>
                <span className="text-xs text-[var(--muted)]">
                  {source.folderName}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[var(--border)] pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onBack}
        >
          ← Back
        </Button>
        <Button
          type="button"
          disabled={mergeableGroups.length === 0}
          onClick={onContinue}
        >
          Continue to page editor →
        </Button>
      </div>
    </section>
  );
}
