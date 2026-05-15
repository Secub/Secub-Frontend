import type { ReactNode } from "react";

import {
  GoCheckCircle,
  GoGoal,
} from "react-icons/go";

export interface WorkflowStepItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
}

interface WorkflowStepProgressProps {
  items: WorkflowStepItem[];

  activeId: string;

  completedIds?: string[];

  onChange?: (id: string) => void;

  disabled?: boolean;

  lockedTooltip?: string;
}

export default function WorkflowStepProgress({
  items,
  activeId,
  completedIds = [],
  onChange,
  disabled = false,
  lockedTooltip,
}: WorkflowStepProgressProps) {
  const activeIndex = Math.max(
    0,
    items.findIndex(
      (item) => item.id === activeId,
    ),
  );

  const completedSet = new Set(
    completedIds,
  );

  return (
    <div className="w-full overflow-hidden rounded-[18px] border border-[var(--color-gray-6)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]">
      <div className="flex w-full">
        {items.map((item, index) => {
          const isFirst = index === 0;

          const isLast =
            index === items.length - 1;

          const isActive =
            item.id === activeId;

          const isCompleted =
            completedSet.has(item.id) ||
            index < activeIndex;

          const isEnabled =
            isActive || isCompleted;

          return (
            <button
              key={item.id}
              type="button"
              disabled={disabled}
              title={
                disabled
                  ? lockedTooltip
                  : undefined
              }
              onClick={() =>
                !disabled &&
                onChange?.(item.id)
              }
              aria-current={
                isActive
                  ? "step"
                  : undefined
              }
              className={[
                "group relative flex min-h-[72px] flex-1 items-center justify-center overflow-hidden px-6 py-4 text-center transition-all duration-300",
                isEnabled
                  ? "bg-[var(--color-secondary-1)] text-white"
                  : "bg-[var(--color-white)] text-[var(--color-secondary-4)]",
                disabled
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer",
              ].join(" ")}
            >
              {/* ARROW SHAPE */}

              {!isLast && (
                <div
                  className={[
                    "absolute right-[-18px] top-0 z-20 h-full w-9 skew-x-[-28deg] border-r border-[var(--color-gray-6)]",
                    isEnabled
                      ? "bg-[var(--color-secondary-1)]"
                      : "bg-[var(--color-white)]",
                  ].join(" ")}
                />
              )}

              {/* BORDER LEFT */}

              {!isFirst && (
                <div className="absolute left-0 top-0 z-10 h-full border-l border-[var(--color-gray-6)]" />
              )}

              {/* CONTENT */}

              <div className="relative z-30 flex items-center gap-3">
                {/* ICON */}

                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                    isEnabled
                      ? "bg-white/15 text-white"
                      : "bg-[var(--color-gray-6)] text-[var(--color-secondary-4)]",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <GoCheckCircle className="text-lg" />
                  ) : isActive ? (
                    item.icon ?? (
                      <GoGoal className="text-lg" />
                    )
                  ) : (
                    index + 1
                  )}
                </span>

                {/* TEXT */}

                <div className="flex flex-col items-start">
                  <span
                    className={[
                      "text-sm font-semibold transition-colors",
                      isEnabled
                        ? "text-white"
                        : "text-[var(--color-secondary-4)]",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>

                  {item.sublabel ? (
                    <span
                      className={[
                        "text-xs transition-colors",
                        isEnabled
                          ? "text-white/75"
                          : "text-[var(--color-gray-3)]",
                      ].join(" ")}
                    >
                      {/* {item.sublabel} este es el subnumero, como decir el numero del paso*/}
                    </span>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ACCESSIBILITY */}

      <progress
        className="sr-only"
        value={activeIndex + 1}
        max={items.length}
        aria-label="Workflow Progress"
      />
    </div>
  );
}