"use client";

import { useState } from "react";
import type { MergeGroup, MergeSource } from "@/lib/types";
import { totalPages } from "@/lib/matching";

type MergePreviewPanelProps = {
  groups: MergeGroup[];
  unmatched: MergeSource[];
  isMerging: boolean;
  onReorderSource: (
    groupId: string,
    sourceId: string,
    direction: "up" | "down",
  ) => void;
  onRemoveSource: (groupId: string, sourceId: string) => void;
  onMoveGroup: (groupId: string, direction: "up" | "down") => void;
  onRemoveGroup: (groupId: string) => void;
  onBack: () => void;
  onMerge: () => void;
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
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-t border-neutral-200 py-3 text-sm">
      <span className="w-6 text-neutral-400">{index + 1}</span>
      <div>
        <p>{source.folderName}</p>
        <p className="text-neutral-500">
          {source.pageCount} page{source.pageCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onMove("up")}
          className="text-xs uppercase tracking-wide underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30"
        >
          Up
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={() => onMove("down")}
          className="text-xs uppercase tracking-wide underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30"
        >
          Down
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs uppercase tracking-wide underline underline-offset-4"
        >
          Remove
        </button>
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
    <article className="border-b border-black pb-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Output file {index + 1}
          </p>
          <h3 className="text-xl font-semibold">{group.fileName}</h3>
          <p className="text-sm text-neutral-600">
            {group.sources.length} source
            {group.sources.length === 1 ? "" : "s"} · {pages} total page
            {pages === 1 ? "" : "s"} after merge
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs uppercase tracking-wide">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveGroup(group.id, "up")}
            className="underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30"
          >
            Move up
          </button>
          <button
            type="button"
            disabled={index === totalGroups - 1}
            onClick={() => onMoveGroup(group.id, "down")}
            className="underline underline-offset-4 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-30"
          >
            Move down
          </button>
          <button
            type="button"
            onClick={() => onRemoveGroup(group.id)}
            className="underline underline-offset-4"
          >
            Skip file
          </button>
        </div>
      </div>

      <p className="mb-2 text-xs uppercase tracking-widest text-neutral-500">
        Merge order
      </p>

      <ul>
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
  isMerging,
  onReorderSource,
  onRemoveSource,
  onMoveGroup,
  onRemoveGroup,
  onBack,
  onMerge,
}: MergePreviewPanelProps) {
  const [showUnmatched, setShowUnmatched] = useState(unmatched.length > 0);

  const mergeableGroups = groups.filter((group) => group.sources.length >= 2);
  const invalidGroups = groups.filter((group) => group.sources.length < 2);

  return (
    <section className="space-y-10">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          Preview & set merge order
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-neutral-600">
          PDFs are grouped by file name. Reorder sources to control page
          sequence. The first source&apos;s pages come first, then the second,
          and so on.
        </p>
      </div>

      {mergeableGroups.length === 0 ? (
        <p className="text-sm text-neutral-600">
          No matching file names were found across folders. Add folders that
          share PDF names, then try again.
        </p>
      ) : (
        <div className="space-y-10">
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
        <div className="space-y-2 border-t border-neutral-200 pt-6 text-sm text-neutral-600">
          <p>
            {invalidGroups.length} group
            {invalidGroups.length === 1 ? "" : "s"} need at least two sources
            to merge and will be skipped.
          </p>
        </div>
      )}

      {showUnmatched && unmatched.length > 0 && (
        <div className="space-y-3 border-t border-neutral-200 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-widest">
              Unmatched files
            </h3>
            <button
              type="button"
              onClick={() => setShowUnmatched(false)}
              className="text-xs underline underline-offset-4"
            >
              Hide
            </button>
          </div>
          <p className="text-sm text-neutral-600">
            These PDFs appear in only one folder and will not be included in the
            merge.
          </p>
          <ul className="divide-y divide-neutral-200 text-sm">
            {unmatched.map((source) => (
              <li key={source.id} className="py-2">
                {source.name}{" "}
                <span className="text-neutral-500">in {source.folderName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-4 border-t border-black pt-6">
        <button
          type="button"
          disabled={isMerging}
          onClick={onBack}
          className="border border-black px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          disabled={isMerging || mergeableGroups.length === 0}
          onClick={onMerge}
          className="border border-black bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isMerging ? "Merging..." : "Merge PDFs"}
        </button>
      </div>
    </section>
  );
}
