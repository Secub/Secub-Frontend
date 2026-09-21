import { useCallback, useEffect, useRef } from "react";
import { TourGuideClient } from "@sjmc11/tourguidejs/dist/tour";
import "@sjmc11/tourguidejs/src/scss/tour.scss";

export interface OnboardingTourStep {
  target: string;
  title?: string;
  content: string;
  order?: number;
  group?: string;
}

interface UseOnboardingTourOptions {
  steps: OnboardingTourStep[];
  storageKey: string;
  autoStart?: boolean;
  enabled?: boolean;
  autoScrollSmooth?: boolean;
  allowDialogOverlap?: boolean;
  forceVerticalPlacement?: boolean;
}

function purgeOrphanTourDom() {
  document.querySelectorAll(".tg-dialog, .tg-backdrop").forEach((el) => el.remove());
}

const MAX_TARGET_WAIT_MS = 5000;

const DEFAULT_TARGET_PADDING = 30;

function getActiveStepTarget(client: TourGuideClient): Element | null {
  const rawStep = (client as unknown as { tourSteps?: { target?: unknown }[]; activeStep?: number })
    .tourSteps?.[(client as unknown as { activeStep?: number }).activeStep ?? 0];
  const target = rawStep?.target;
  return target instanceof Element ? target : null;
}

function correctBackdropPosition(client: TourGuideClient): DOMRect | null {
  const backdrop = document.querySelector<HTMLElement>(".tg-backdrop");
  const target = getActiveStepTarget(client);
  if (!backdrop || !target) return null;

  const rect = target.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;

  const halfPadding = DEFAULT_TARGET_PADDING / 2;
  const top = `${window.scrollY + rect.top - halfPadding}px`;
  const left = `${window.scrollX + rect.left - halfPadding}px`;
  const width = `${rect.width + DEFAULT_TARGET_PADDING}px`;
  const height = `${rect.height + DEFAULT_TARGET_PADDING}px`;

  if (backdrop.style.top !== top) backdrop.style.top = top;
  if (backdrop.style.left !== left) backdrop.style.left = left;
  if (backdrop.style.width !== width) backdrop.style.width = width;
  if (backdrop.style.height !== height) backdrop.style.height = height;

  return rect;
}

function correctSidePlacement(client: TourGuideClient) {
  const dialog = document.querySelector<HTMLElement>(".tg-dialog");
  if (!dialog) return;

  const targetRect = correctBackdropPosition(client);
  if (!targetRect) return;

  const dialogRect = dialog.getBoundingClientRect();
  if (dialogRect.width === 0 || dialogRect.height === 0) return;

  const gap = 20;
  const edgePadding = 8;
  const required = dialogRect.height + gap;

  let targetTop = targetRect.top;
  let targetBottom = targetRect.bottom;
  let spaceBelow = window.innerHeight - targetBottom;
  let spaceAbove = targetTop;

  if (spaceBelow < required && spaceAbove < required) {
    const deficit = required - spaceBelow;
    const maxScroll = Math.max(0, targetTop - edgePadding);
    const scrollAmount = Math.min(deficit, maxScroll);
    if (scrollAmount > 0) {
      window.scrollBy(0, scrollAmount);
      targetTop -= scrollAmount;
      targetBottom -= scrollAmount;
      spaceBelow = window.innerHeight - targetBottom;
      spaceAbove = targetTop;
    }
  }

  const placeBelow = spaceBelow >= required || spaceBelow >= spaceAbove;
  let top = placeBelow ? targetBottom + gap : targetTop - dialogRect.height - gap;
  top = Math.min(Math.max(edgePadding, top), window.innerHeight - dialogRect.height - edgePadding);

  const maxLeft = Math.max(edgePadding, window.innerWidth - dialogRect.width - edgePadding);
  const left = Math.min(
    Math.max(edgePadding, targetRect.left + (targetRect.width - dialogRect.width) / 2),
    maxLeft,
  );

  const newTop = `${top + window.scrollY}px`;
  const newLeft = `${left + window.scrollX}px`;
  if (dialog.style.top !== newTop) dialog.style.top = newTop;
  if (dialog.style.left !== newLeft) dialog.style.left = newLeft;

  const arrow = dialog.querySelector<HTMLElement>(".tg-arrow");
  if (arrow && arrow.style.display !== "none") arrow.style.display = "none";
}

function attachVerticalPlacementGuard(client: TourGuideClient) {
  const SETTLE_MS = 80;
  let settleTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleCorrection = () => {
    if (settleTimer !== null) clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settleTimer = null;
      correctSidePlacement(client);
    }, SETTLE_MS);
  };

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.target instanceof HTMLElement &&
        (mutation.target.classList.contains("tg-dialog") || mutation.target.classList.contains("tg-backdrop"))
      ) {
        scheduleCorrection();
        return;
      }
    }
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ["style"], subtree: true });
  scheduleCorrection();

  return () => {
    if (settleTimer !== null) clearTimeout(settleTimer);
    observer.disconnect();
  };
}

export function useOnboardingTour({
  steps,
  storageKey,
  autoStart = true,
  enabled = true,
  autoScrollSmooth = true,
  allowDialogOverlap = false,
  forceVerticalPlacement = false,
}: UseOnboardingTourOptions) {
  const tourRef = useRef<TourGuideClient | null>(null);
  const autoStartedRef = useRef(false);
  const verticalGuardCleanupRef = useRef<(() => void) | null>(null);

  const buildClient = useCallback(() => {
    const hasAllTargets = steps.every((step) => Boolean(document.querySelector(step.target)));
    if (!hasAllTargets) return null;

    const client = new TourGuideClient({
      steps: steps.map((step) => ({ ...step })),
      exitOnEscape: true,
      exitOnClickOutside: true,
      showStepProgress: true,
      showButtons: true,
      nextLabel: "Siguiente",
      prevLabel: "Atrás",
      finishLabel: "Finalizar",
      autoScrollOffset: 140,
      autoScrollSmooth,
      allowDialogOverlap,
    });

    tourRef.current = client;
    return client;
  }, [steps, autoScrollSmooth, allowDialogOverlap]);

  const destroyCurrentClient = useCallback(async () => {
    verticalGuardCleanupRef.current?.();
    verticalGuardCleanupRef.current = null;
    if (tourRef.current) {
      await tourRef.current.exit();
      tourRef.current = null;
    }
    purgeOrphanTourDom();
    document.documentElement.style.scrollBehavior = "";
  }, []);

  const startTour = useCallback(async () => {
    await destroyCurrentClient();

    return new Promise<void>((resolve) => {
      const startedAt = performance.now();
      const tryStart = () => {
        const client = buildClient();
        if (!client) {
          if (performance.now() - startedAt < MAX_TARGET_WAIT_MS) {
            window.requestAnimationFrame(tryStart);
          } else {
            resolve();
          }
          return;
        }
        document.documentElement.style.scrollBehavior = "auto";
        void client.start();
        if (forceVerticalPlacement) {
          verticalGuardCleanupRef.current = attachVerticalPlacementGuard(client);
        }
        resolve();
      };
      tryStart();
    });
  }, [buildClient, destroyCurrentClient, forceVerticalPlacement]);

  useEffect(() => {
    if (!enabled || !steps.length) return;

    let cancelled = false;
    let rafId: number | null = null;
    const startedAt = performance.now();

    const init = async () => {
      purgeOrphanTourDom();

      const startWhenReady = () => {
        if (cancelled) return;

        const client = buildClient();
        if (!client) {
          if (performance.now() - startedAt < MAX_TARGET_WAIT_MS) {
            rafId = window.requestAnimationFrame(startWhenReady);
          }
          return;
        }

        const alreadySeen = localStorage.getItem(storageKey) === "true";
        if (autoStart && !alreadySeen && !autoStartedRef.current) {
          autoStartedRef.current = true;
          document.documentElement.style.scrollBehavior = "auto";
          void client.start();
          if (forceVerticalPlacement) {
            verticalGuardCleanupRef.current = attachVerticalPlacementGuard(client);
          }
          localStorage.setItem(storageKey, "true");
        }
      };

      rafId = window.requestAnimationFrame(startWhenReady);
    };

    void init();

    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      void destroyCurrentClient();
      autoStartedRef.current = false;
    };
  }, [autoStart, enabled, steps, storageKey, buildClient, destroyCurrentClient, forceVerticalPlacement]);

  return {
    startTour,
    exitTour: () => tourRef.current?.exit(),
  };
}
