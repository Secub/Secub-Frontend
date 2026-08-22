import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../ui";
import type { ButtonVariant } from "../ui/Button";

import { ActionIcon } from "../ui/ActionIcon";

interface FlowActionBarAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  variant?: ButtonVariant;
  leftIcon?: ReactNode;
  className?: string;
}

interface FlowActionBarProps {
  description?: ReactNode;
  actionsBefore?: FlowActionBarAction[];
  showSaveProgress?: boolean;
  saveLabel?: string;
  saveDisabled?: boolean;
  saveTitle?: string;
  onSaveProgress?: () => void;
  showNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextTitle?: string;
  onNext?: () => void;
  showFinish?: boolean;
  finishLabel?: string;
  finishDisabled?: boolean;
  finishTitle?: string;
  onFinish?: () => void;
}

function FlowActionButton({
  action,
}: {
  action: FlowActionBarAction;
}) {
  return (
    <Button
      variant={action.variant ?? "outline"}
      leftIcon={action.leftIcon}
      onClick={action.onClick}
      disabled={action.disabled}
      title={action.title}
      className={action.className}
    >
      {action.label}
    </Button>
  );
}

export default function FlowActionBar({
  description = "Guarda avances parciales, continúa al siguiente paso o finaliza únicamente cuando el flujo esté completo.",
  actionsBefore = [],
  showSaveProgress = false,
  saveLabel = "Guardar progreso",
  saveDisabled = false,
  saveTitle,
  onSaveProgress,
  showNext = false,
  nextLabel = "Siguiente paso",
  nextDisabled = false,
  nextTitle,
  onNext,
  showFinish = false,
  finishLabel = "Finalizar",
  finishDisabled = false,
  finishTitle,
  onFinish,
}: FlowActionBarProps) {
  const shouldShowSave = showSaveProgress && Boolean(onSaveProgress);
  const shouldShowNext = showNext && Boolean(onNext);
  const shouldShowFinish = showFinish && Boolean(onFinish);
  const shouldRender = actionsBefore.length > 0 || shouldShowSave || shouldShowNext || shouldShowFinish;
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const [barPosition, setBarPosition] = useState({ left: 0, width: 0 });
  const [reservedHeight, setReservedHeight] = useState(0);

  useEffect(() => {
    if (!shouldRender) return;

    let animationFrame = 0;

    const updatePosition = () => {
      window.cancelAnimationFrame(animationFrame);

      animationFrame = window.requestAnimationFrame(() => {
        const anchorRect = anchorRef.current?.getBoundingClientRect();
        const barRect = barRef.current?.getBoundingClientRect();

        if (anchorRect) {
          setBarPosition({
            left: anchorRect.left,
            width: anchorRect.width,
          });
        }

        if (barRect) {
          setReservedHeight(barRect.height);
        }
      });
    };

    updatePosition();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(updatePosition)
        : null;

    if (resizeObserver && anchorRef.current) {
      resizeObserver.observe(anchorRef.current);
    }

    if (resizeObserver && barRef.current) {
      resizeObserver.observe(barRef.current);
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  const fixedBarStyle = barPosition.width > 0
    ? {
        left: `${barPosition.left}px`,
        width: `${barPosition.width}px`,
      }
    : undefined;

  return (
    <>
      <div
        ref={anchorRef}
        aria-hidden="true"
        style={{ height: reservedHeight ? `${reservedHeight}px` : undefined }}
      />

      <div
        ref={barRef}
        className="fixed bottom-0 z-20 w-full min-w-0 border-t border-[var(--color-gray-6)] bg-[var(--secub-surface)] px-4 py-4 shadow-[var(--shadow-lg)] sm:px-6"
        style={fixedBarStyle}
      >
        <div className="flex w-full min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {description ? (
            <p className="min-w-0 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
              {description}
            </p>
          ) : (
            <span aria-hidden="true" />
          )}

          <div className="flex w-full min-w-0 shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:w-auto">
            {actionsBefore.map((action) => (
              <FlowActionButton key={action.label} action={action} />
            ))}

            {shouldShowSave ? (
              <Button
                variant="outline"
                leftIcon={<ActionIcon name="clock" />}
                onClick={onSaveProgress}
                disabled={saveDisabled}
                title={saveTitle}
                className="w-full sm:w-auto sm:min-w-[210px]"
              >
                {saveLabel}
              </Button>
            ) : null}

            {shouldShowNext ? (
              <Button
                variant="primary"
                leftIcon={<ActionIcon name="next" />}
                onClick={onNext}
                disabled={nextDisabled}
                title={nextTitle}
                className="w-full sm:w-auto sm:min-w-[220px]"
              >
                {nextLabel}
              </Button>
            ) : null}

            {shouldShowFinish ? (
              <Button
                variant="primary"
                leftIcon={<ActionIcon name="complete" />}
                onClick={onFinish}
                disabled={finishDisabled}
                title={finishTitle}
                className="w-full sm:w-auto sm:min-w-[220px]"
              >
                {finishLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export type { FlowActionBarAction, FlowActionBarProps };
