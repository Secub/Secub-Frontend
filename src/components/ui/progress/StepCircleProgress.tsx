import type { ReactNode } from "react";
import { GoCheckCircle, GoGoal } from "react-icons/go";

export interface StepCircleProgressItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
}

interface StepCircleProgressProps {
  items: StepCircleProgressItem[];
  activeId: string;
  completedIds?: string[];
  onChange?: (id: string) => void;
  disabled?: boolean;
  lockedTooltip?: string;
}

export default function StepCircleProgress({
  items,
  activeId,
  completedIds = [],
  onChange,
  disabled = false,
  lockedTooltip,
}: StepCircleProgressProps) {
  if (!items.length) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId),
  );

  const completedSet = new Set(completedIds);
  const progressPercentage =
    items.length <= 1 ? 100 : Math.round((activeIndex / (items.length - 1)) * 100);

  return (
    <div className="px-2 md:px-8">
      <div className="relative">
        <div className="absolute left-0 right-0 top-[22px] h-1 rounded-full bg-[var(--color-gray-6)]" />
        <div
          className="absolute left-0 top-[22px] h-1 rounded-full bg-[var(--color-success)] transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />

        <div
          className="relative z-10 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            const isCompleted = completedSet.has(item.id) || index < activeIndex;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => !disabled && onChange?.(item.id)}
                disabled={disabled}
                title={disabled ? lockedTooltip : undefined}
                className="group flex min-w-0 flex-col items-center text-center focus-visible:outline-none disabled:cursor-not-allowed"
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm transition-all duration-200 group-focus-visible:ring-4 group-focus-visible:ring-[color:rgba(14,101,217,0.18)]",
                    isCompleted
                      ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                      : isActive
                        ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-white"
                        : "border-[var(--color-secondary-4)] bg-white text-[var(--color-secondary-4)] group-hover:border-[var(--color-secondary-1)] group-hover:text-[var(--color-secondary-1)]",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <GoCheckCircle className="text-xl" />
                  ) : isActive ? (
                    item.icon ?? <GoGoal className="text-xl" />
                  ) : (
                    index + 1
                  )}
                </span>

                <span
                  className={[
                    "mt-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                    isActive
                      ? "text-[var(--color-secondary-1)]"
                      : isCompleted
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-gray-3)]",
                  ].join(" ")}
                >
                  {item.label}
                </span>
                {item.sublabel ? (
                  <span className="mt-1 truncate text-sm font-semibold text-[var(--color-secondary-4)]">
                    {item.sublabel}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <progress
        className="sr-only"
        value={activeIndex + 1}
        max={items.length}
        aria-label="Progreso por pasos"
      />
    </div>
  );
}
