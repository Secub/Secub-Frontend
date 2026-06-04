import type { ReactNode } from "react";
import { GoCheckCircle, GoGoal } from "react-icons/go";

export interface StepCircleProgressItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
  disabled?: boolean;
  disabledTooltip?: string;
}

interface StepCircleProgressProps {
  items: StepCircleProgressItem[];
  activeId: string;
  completedIds?: string[];
  onChange?: (id: string) => void;
  disabled?: boolean;
  lockedTooltip?: string;
  ariaLabel?: string;
}

export default function StepCircleProgress({
  items,
  activeId,
  completedIds = [],
  onChange,
  disabled = false,
  lockedTooltip,
  ariaLabel = "Progreso por pasos",
}: StepCircleProgressProps) {
  if (!items.length) return null;

  const completedSet = new Set(completedIds);
  const lastCompletedIndex = items.reduce(
    (lastIndex, item, index) => completedSet.has(item.id) ? index : lastIndex,
    -1,
  );
  const progressPercentage =
    items.length <= 1
      ? lastCompletedIndex >= 0 ? 100 : 0
      : Math.max(0, Math.round((lastCompletedIndex / (items.length - 1)) * 100));

  return (
    <nav className="px-2 md:px-8" aria-label={ariaLabel}>
      <div className="relative">
        <div className="absolute left-0 right-0 top-[22px] h-1 rounded-full bg-[var(--color-gray-6)]" aria-hidden="true" />
        <div
          className="absolute left-0 top-[22px] h-1 rounded-full bg-[var(--color-success)] transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
          aria-hidden="true"
        />

        <ol
          className="relative z-10 grid gap-3"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item, index) => {
            const isActive = item.id === activeId;
            const isCompleted = completedSet.has(item.id);
            const isItemDisabled = disabled || Boolean(item.disabled);
            const disabledMessage = item.disabled ? item.disabledTooltip : disabled ? lockedTooltip : undefined;
            const disabledMessageId = disabledMessage ? `step-${item.id}-disabled-reason` : undefined;

            return (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => !isItemDisabled && onChange?.(item.id)}
                  disabled={isItemDisabled}
                  title={disabledMessage}
                  className="group flex min-w-0 flex-col items-center text-center focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-65"
                  aria-current={isActive ? "step" : undefined}
                  aria-describedby={disabledMessageId}
                  aria-label={`${item.label}${isActive ? ", paso actual" : ""}${isCompleted ? ", completado" : ""}${isItemDisabled ? ", bloqueado" : ""}`}
                >
                  <span
                    className={[
                      "inline-flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm transition-all duration-200 group-focus-visible:ring-4 group-focus-visible:ring-[color:rgba(14,101,217,0.18)]",
                      isCompleted
                        ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                        : isActive
                          ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-white"
                          : isItemDisabled
                        ? "border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] text-[var(--color-gray-4)]"
                        : "border-[var(--color-secondary-4)] bg-white text-[var(--color-secondary-4)] group-hover:border-[var(--color-secondary-1)] group-hover:text-[var(--color-secondary-1)]",
                    ].join(" ")}
                    aria-hidden="true"
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
                  {isItemDisabled ? <span className="mt-1 text-xs text-[var(--color-gray-4)]">Bloqueado</span> : null}
                </button>
                {disabledMessage ? (
                  <span id={disabledMessageId} className="sr-only">
                    {disabledMessage}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <progress
        className="sr-only"
        value={lastCompletedIndex + 1}
        max={items.length}
        aria-label={ariaLabel}
      />
    </nav>
  );
}
