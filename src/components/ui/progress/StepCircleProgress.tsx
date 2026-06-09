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
    <nav className="step-circle-progress px-2 md:px-8" aria-label={ariaLabel}>
      <div className="relative">
        <div className="step-circle-progress__track absolute left-0 right-0 top-[22px] h-1 rounded-full" aria-hidden="true" />
        <div
          className="step-circle-progress__fill absolute left-0 top-[22px] h-1 rounded-full transition-all duration-300"
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
            const stepStateClass = isCompleted
              ? "step-circle-progress__button--completed"
              : isActive
                ? "step-circle-progress__button--active"
                : isItemDisabled
                  ? "step-circle-progress__button--disabled"
                  : "step-circle-progress__button--pending";

            return (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  onClick={() => !isItemDisabled && onChange?.(item.id)}
                  disabled={isItemDisabled}
                  title={disabledMessage}
                  className={`step-circle-progress__button ${stepStateClass} group flex min-w-0 flex-col items-center text-center focus-visible:outline-none disabled:cursor-not-allowed`}
                  aria-current={isActive ? "step" : undefined}
                  aria-describedby={disabledMessageId}
                  aria-label={`${item.label}${isActive ? ", paso actual" : ""}${isCompleted ? ", completado" : ""}${isItemDisabled ? ", bloqueado" : ""}`}
                >
                  <span
                    className="step-circle-progress__marker inline-flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm transition-all duration-200 group-focus-visible:ring-4 group-focus-visible:ring-[color:rgba(14,101,217,0.18)]"
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

                  <span className="step-circle-progress__label mt-3 text-xs font-semibold uppercase tracking-[0.12em] transition-colors">
                    {item.label}
                  </span>

                  {item.sublabel ? (
                    <span className="step-circle-progress__sublabel mt-1 truncate text-sm font-semibold">
                      {item.sublabel}
                    </span>
                  ) : null}

                  {isItemDisabled ? (
                    <span className="step-circle-progress__status mt-1 text-xs font-semibold">
                      Bloqueado
                    </span>
                  ) : null}
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
