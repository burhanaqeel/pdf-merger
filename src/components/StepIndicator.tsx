"use client";

import type { AppStep } from "@/lib/types";

const STEPS: { id: AppStep; label: string; description: string }[] = [
  { id: "upload", label: "Upload", description: "Add PDF folders" },
  { id: "preview", label: "Sources", description: "Order PDF sources" },
  { id: "arrange", label: "Pages", description: "Preview & arrange" },
  { id: "done", label: "Download", description: "Save folder" },
];

type StepIndicatorProps = {
  current: AppStep;
};

export function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {STEPS.map((step, index) => {
          const isActive = step.id === current;
          const isComplete = index < currentIndex;

          return (
            <li key={step.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors sm:h-8 sm:w-8 ${
                    isActive
                      ? "bg-[var(--accent)] text-white"
                      : isComplete
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <div className="hidden min-w-0 lg:block">
                  <p
                    className={`truncate text-sm font-medium ${
                      isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`hidden h-px flex-1 md:block ${
                    isComplete ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
