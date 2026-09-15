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
}

function purgeOrphanTourDom() {
  document.querySelectorAll(".tg-dialog, .tg-backdrop").forEach((el) => el.remove());
}

export function useOnboardingTour({
  steps,
  storageKey,
  autoStart = true,
  enabled = true,
}: UseOnboardingTourOptions) {
  const tourRef = useRef<TourGuideClient | null>(null);
  const autoStartedRef = useRef(false);

  // ✅ useCallback: referencia estable, solo cambia si "steps" cambia
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
    });

    tourRef.current = client;
    return client;
  }, [steps]);

  // ✅ useCallback: no depende de nada externo, referencia estable
  const destroyCurrentClient = useCallback(async () => {
    if (tourRef.current) {
      await tourRef.current.exit();
      tourRef.current = null;
    }
    purgeOrphanTourDom();
  }, []);

  const startTour = useCallback(async () => {
    await destroyCurrentClient();

    return new Promise<void>((resolve) => {
      const tryStart = () => {
        const client = buildClient();
        if (!client) {
          window.requestAnimationFrame(tryStart);
          return;
        }
        void client.start(); // ✅ fix error 1
        resolve();
      };
      tryStart();
    });
  }, [buildClient, destroyCurrentClient]);

  useEffect(() => {
    if (!enabled || !steps.length) return;

    let cancelled = false;
    let rafId: number | null = null;

    const init = async () => {
      purgeOrphanTourDom();

      const startWhenReady = () => {
        if (cancelled) return;

        const client = buildClient();
        if (!client) {
          rafId = window.requestAnimationFrame(startWhenReady);
          return;
        }

        const alreadySeen = localStorage.getItem(storageKey) === "true";
        if (autoStart && !alreadySeen && !autoStartedRef.current) {
          autoStartedRef.current = true;
          void client.start();
          localStorage.setItem(storageKey, "true");
        }
      };

      startWhenReady();
    };

    void init();

    return () => {
      cancelled = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      void destroyCurrentClient();
      autoStartedRef.current = false;
    };
  }, [autoStart, enabled, steps, storageKey, buildClient, destroyCurrentClient]); // ✅ fix warning: dependencias completas

  return {
    startTour,
    exitTour: () => tourRef.current?.exit(),
  };
}