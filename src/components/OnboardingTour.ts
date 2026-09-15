import { useEffect, useRef } from "react";
import { TourGuideClient } from "@sjmc11/tourguidejs/dist/Tour";
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

// ✅ Limpieza defensiva: elimina cualquier diálogo/backdrop huérfano
// que haya quedado en el DOM de una instancia anterior (StrictMode, HMR, etc.)
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

  const destroyCurrentClient = async () => {
    if (tourRef.current) {
      await tourRef.current.exit(); // ✅ esperar a que termine antes de seguir
      tourRef.current = null;
    }
    purgeOrphanTourDom(); // ✅ red de seguridad por si quedó algo huérfano
  };

  const buildClient = () => {
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
  };

  const startTour = async () => {
    await destroyCurrentClient();

    return new Promise<void>((resolve) => {
      const tryStart = () => {
        const client = buildClient();
        if (!client) {
          window.requestAnimationFrame(tryStart);
          return;
        }
        client.start();
        resolve();
      };
      tryStart();
    });
  };

  useEffect(() => {
    if (!enabled || !steps.length) return;

    let cancelled = false;
    let rafId: number | null = null;

    const init = async () => {
      // ✅ Purga cualquier residuo ANTES de empezar (cubre el doble-mount de StrictMode)
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
  }, [autoStart, enabled, steps, storageKey]);

  return {
    startTour,
    exitTour: () => tourRef.current?.exit(),
  };
}