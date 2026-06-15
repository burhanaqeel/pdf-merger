"use client";

import type { AppStep } from "@/lib/types";

const STEPS: { id: AppStep; label: string }[] = [
  { id: "upload", label: "Upload folders" },
  { id: "preview", label: "Preview & order" },
  { id: "done", label: "Download" },
];

type StepIndicatorProps = {
  current: AppStep;
};

export function StepIndicator({ current }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <nav aria-label="Progress" className="flex flex-wrap gap-x-8 gap-y-2">
      {STEPS.map((step, index) => {
        const isActive = step.id === current;
        const isComplete = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center gap-2 text-sm">
            <span
              className={
                isActive
                  ? "font-semibold text-black"
                  : isComplete
                    ? "text-black"
                    : "text-neutral-400"
              }
            >
              {index + 1}. {step.label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
