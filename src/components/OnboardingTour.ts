import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TourGuideClient } from "@sjmc11/tourguidejs/dist/tour";
import "@sjmc11/tourguidejs/src/scss/tour.scss";

export interface OnboardingTourStep {
  target: string;
  title?: string;
  content: string;
  order?: number;
  group?: string;
  // false = este paso conserva la ubicacion automatica de la libreria (puede
  // quedar a un lado) en vez del "siempre arriba" que aplica al resto.
  forceTop?: boolean;
}

interface UseOnboardingTourOptions {
  steps: OnboardingTourStep[];
  storageKey: string;
  autoStart?: boolean;
  enabled?: boolean;
  autoScrollSmooth?: boolean;
  allowDialogOverlap?: boolean;
  forceVerticalPlacement?: boolean;
  allowPartialTargets?: boolean;
  minimumFirstRunStepDurationMs?: number;
}

function purgeOrphanTourDom() {
  document.querySelectorAll(".tg-dialog, .tg-backdrop").forEach((el) => el.remove());
}

const MAX_TARGET_WAIT_MS = 5000;

const DEFAULT_TARGET_PADDING = 30;

const AUTO_SCROLL_OFFSET = 140;

const TARGET_SCROLL_MARGIN_PX = AUTO_SCROLL_OFFSET + DEFAULT_TARGET_PADDING;

// Aire entre el destino y una barra fija inferior.
const BOTTOM_BAR_CLEARANCE_PX = 24;

// Alto de la barra fija pegada al borde inferior del viewport (p. ej. FlowActionBar), si
// hay una. Se detecta mirando que elemento fijo/sticky queda realmente arriba en la
// parte baja de la pantalla, sin depender de clases ni ids concretos.
function getBottomBarHeight(): number {
  if (typeof document.elementsFromPoint !== "function") return 0;

  const y = window.innerHeight - 2;
  let height = 0;

  [0.3, 0.5, 0.7, 0.9].forEach((ratio) => {
    const stack = document.elementsFromPoint(window.innerWidth * ratio, y);
    const bar = stack.find((element) => {
      if (element === document.documentElement || element === document.body) return false;
      if (element.closest(".tg-dialog, .tg-backdrop")) return false;
      const { position } = window.getComputedStyle(element);
      return position === "fixed" || position === "sticky";
    });
    if (!bar) return;

    const { top } = bar.getBoundingClientRect();
    if (top > window.innerHeight / 2) height = Math.max(height, window.innerHeight - top);
  });

  return height;
}

// La libreria solo aplica el scroll-margin a los destinos que recibe como selector (string).
// Como aqui se le pasan elementos ya resueltos, se aplica a mano: sin el, scrollIntoView
// deja el destino pegado al borde del viewport, tapado por barras fijas como FlowActionBar.
function getTargetScrollMargin(): string {
  const bottom = Math.max(TARGET_SCROLL_MARGIN_PX, getBottomBarHeight() + BOTTOM_BAR_CLEARANCE_PX);
  return `${TARGET_SCROLL_MARGIN_PX}px 0 ${bottom}px`;
}

// Objetivos mas bajos que esto son "chicos" (botones, paneles cortos): se deja
// la ubicacion automatica de la libreria para que el dialogo no tape el foco.
const LARGE_TARGET_MIN_HEIGHT = 200;

function getActiveStep(client: TourGuideClient): { target?: unknown; forceTop?: boolean } | undefined {
  return (client as unknown as { tourSteps?: { target?: unknown; forceTop?: boolean }[]; activeStep?: number })
    .tourSteps?.[(client as unknown as { activeStep?: number }).activeStep ?? 0];
}

function getActiveStepTarget(client: TourGuideClient): Element | null {
  const target = getActiveStep(client)?.target;
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
  if (getActiveStep(client)?.forceTop === false) return;
  if (targetRect.height < LARGE_TARGET_MIN_HEIGHT) return;

  const dialogRect = dialog.getBoundingClientRect();
  if (dialogRect.width === 0 || dialogRect.height === 0) return;

  const gap = 20;
  const edgePadding = 8;
  const required = dialogRect.height + gap;

  // El dialogo siempre se ubica arriba del target; si no hay espacio, se sube el scroll
  // para correr el target hacia abajo en el viewport y liberar el espacio necesario.
  let targetTop = targetRect.top;
  const spaceAbove = targetTop;

  if (spaceAbove < required) {
    const scrollAmount = Math.min(required - spaceAbove, window.scrollY);
    if (scrollAmount > 0) {
      window.scrollBy(0, -scrollAmount);
      targetTop += scrollAmount;
    }
  }

  let top = targetTop - dialogRect.height - gap;
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
  // La libreria posiciona el dialogo (a veces al costado) con una transicion CSS de
  // hasta 300ms. Si corregimos con un setTimeout, el usuario alcanza a ver esa posicion
  // "equivocada" antes de que saltemos arriba. Un microtask corre antes del siguiente
  // pintado del navegador, asi que la correccion reemplaza el valor equivocado sin que
  // llegue a pintarse: la transicion de la libreria anima directo hacia la posicion final.
  let scheduled = false;

  const scheduleCorrection = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => {
      scheduled = false;
      correctSidePlacement(client);
    });
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
    observer.disconnect();
  };
}

// localStorage puede lanzar (modo privado, datos bloqueados). Solo en ese caso se
// recurre a la memoria para no repetir el tour dentro de la misma sesion.
const seenInMemory = new Set<string>();

function readSeen(storageKey: string): boolean {
  try {
    return localStorage.getItem(storageKey) === "true";
  } catch {
    return seenInMemory.has(storageKey);
  }
}

function markSeen(storageKey: string) {
  try {
    localStorage.setItem(storageKey, "true");
  } catch {
    seenInMemory.add(storageKey);
  }
}

// La libreria dibuja un unico dialogo/backdrop global, asi que solo puede haber un
// tour activo a la vez. Los tours automaticos que llegan mientras otro corre esperan
// a que termine (p. ej. el del sidebar antes que el de la pagina).
let activeTourId: symbol | null = null;
const tourSlotListeners = new Set<() => void>();

function isTourSlotFree() {
  return activeTourId === null;
}

function acquireTourSlot(id: symbol) {
  if (activeTourId !== null && activeTourId !== id) return false;
  activeTourId = id;
  return true;
}

function releaseTourSlot(id: symbol) {
  if (activeTourId !== id) return;
  activeTourId = null;
  [...tourSlotListeners].forEach((listener) => listener());
}

function onTourSlotFree(listener: () => void) {
  tourSlotListeners.add(listener);
  return () => {
    tourSlotListeners.delete(listener);
  };
}

// Un mismo id puede existir varias veces (p. ej. sidebar de escritorio y drawer movil):
// se toma el primero que realmente se renderiza, no el primero del DOM.
function isRendered(element: Element) {
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (window.getComputedStyle(node).display === "none") return false;
  }
  return true;
}

function resolveTarget(selector: string): Element | null {
  return Array.from(document.querySelectorAll(selector)).find(isRendered) ?? null;
}

const EXIT_RETRY_DELAY_MS = 50;
const EXIT_MAX_ATTEMPTS = 10;

// exit() rechaza ("Promise waiting") mientras la libreria esta en plena transicion de
// paso. Se reintenta en vez de propagar el error: un rechazo dejaria a startTour sin
// arrancar (boton "Ver guia" inerte) y al tour viejo abierto.
async function exitClient(client: TourGuideClient) {
  for (let attempt = 0; attempt < EXIT_MAX_ATTEMPTS; attempt += 1) {
    try {
      await client.exit();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, EXIT_RETRY_DELAY_MS));
    }
  }
}

function attachFirstRunStepGuard(client: TourGuideClient, durationMs: number) {
  let timer: number | null = null;

  const allowNextStep = () => {
    const nextButton = document.querySelector<HTMLButtonElement>("#tg-dialog-next-btn");
    if (!nextButton) return;
    nextButton.disabled = false;
    nextButton.classList.remove("disabled");
  };

  const startStepTimer = () => {
    if (timer !== null) window.clearTimeout(timer);

    const nextButton = document.querySelector<HTMLButtonElement>("#tg-dialog-next-btn");
    if (!nextButton) return;
    nextButton.disabled = true;
    nextButton.classList.add("disabled");
    timer = window.setTimeout(allowNextStep, durationMs);
  };

  client.onAfterStepChange(startStepTimer);

  return {
    startInitialTimer: startStepTimer,
    cleanup: () => {
      if (timer !== null) window.clearTimeout(timer);
      allowNextStep();
    },
  };
}

export function useOnboardingTour({
  steps,
  storageKey,
  autoStart = true,
  enabled = true,
  autoScrollSmooth = true,
  allowDialogOverlap = false,
  forceVerticalPlacement = true,
  allowPartialTargets = false,
  minimumFirstRunStepDurationMs = 3000,
}: UseOnboardingTourOptions) {
  const [tourId] = useState(() => Symbol("onboarding-tour"));
  const tourRef = useRef<TourGuideClient | null>(null);
  const verticalGuardCleanupRef = useRef<(() => void) | null>(null);
  const stepGuardCleanupRef = useRef<(() => void) | null>(null);
  const manualStartCancelRef = useRef<(() => void) | null>(null);

  // Los pasos son datos planos: se compara por contenido para que un consumidor que
  // pase un array nuevo en cada render no reinicie el tour en curso.
  const stepsKey = JSON.stringify(steps);
  const stableSteps = useMemo(() => JSON.parse(stepsKey) as OnboardingTourStep[], [stepsKey]);

  const buildClient = useCallback((isFirstRun: boolean) => {
    const scrollMargin = getTargetScrollMargin();
    const availableSteps = stableSteps.flatMap((step) => {
      const target = resolveTarget(step.target);
      if (!target) return [];
      if (target instanceof HTMLElement) target.style.scrollMargin = scrollMargin;
      return [{ ...step, target }];
    });
    if (
      !availableSteps.length ||
      (!allowPartialTargets && availableSteps.length !== stableSteps.length)
    ) {
      return null;
    }

    return new TourGuideClient({
      steps: availableSteps,
      showStepProgress: true,
      showButtons: true,
      nextLabel: "Siguiente",
      prevLabel: "Atrás",
      finishLabel: "Finalizar",
      exitOnEscape: !isFirstRun,
      exitOnClickOutside: !isFirstRun,
      closeButton: !isFirstRun,
      keyboardControls: !isFirstRun,
      autoScrollOffset: AUTO_SCROLL_OFFSET,
      autoScrollSmooth,
      allowDialogOverlap,
    });
  }, [allowPartialTargets, stableSteps, autoScrollSmooth, allowDialogOverlap]);

  const releaseClient = useCallback(() => {
    verticalGuardCleanupRef.current?.();
    verticalGuardCleanupRef.current = null;
    stepGuardCleanupRef.current?.();
    stepGuardCleanupRef.current = null;
    tourRef.current = null;
    document.documentElement.style.scrollBehavior = "";
  }, []);

  const destroyCurrentClient = useCallback(async () => {
    const client = tourRef.current;
    releaseClient();
    try {
      if (client) await exitClient(client);
    } finally {
      releaseTourSlot(tourId);
      if (isTourSlotFree()) purgeOrphanTourDom();
    }
  }, [releaseClient, tourId]);

  const launchClient = useCallback(
    (client: TourGuideClient, isFirstRun: boolean) => {
      tourRef.current = client;
      let startInitialStepTimer: (() => void) | null = null;
      // Finalizar/Esc/click afuera: la libreria sale sola, hay que soltar lo nuestro.
      client.onAfterExit(() => {
        if (tourRef.current !== client) return;
        releaseClient();
        releaseTourSlot(tourId);
      });

      if (isFirstRun) {
        const stepGuard = attachFirstRunStepGuard(client, minimumFirstRunStepDurationMs);
        stepGuardCleanupRef.current = stepGuard.cleanup;
        startInitialStepTimer = stepGuard.startInitialTimer;
      }

      document.documentElement.style.scrollBehavior = "auto";
      const started = Promise.resolve(client.start()).then((result) => {
        startInitialStepTimer?.();
        return result;
      });
      if (forceVerticalPlacement) {
        verticalGuardCleanupRef.current = attachVerticalPlacementGuard(client);
      }

      return started.catch((error: unknown) => {
        if (tourRef.current === client) {
          releaseClient();
          releaseTourSlot(tourId);
        }
        throw error;
      });
    },
    [forceVerticalPlacement, minimumFirstRunStepDurationMs, releaseClient, tourId],
  );

  // Espera a que los targets existan y a que no haya otro tour activo; devuelve la
  // funcion que cancela la espera.
  const scheduleStart = useCallback(
    (onStarted?: () => void) => {
      let cancelled = false;
      let rafId: number | null = null;
      let unsubscribe: (() => void) | null = null;
      let deadline = performance.now() + MAX_TARGET_WAIT_MS;

      const attempt = () => {
        rafId = null;
        if (cancelled) return;

        const isFirstRun = !readSeen(storageKey);
        const client = buildClient(isFirstRun);
        if (!client) {
          if (performance.now() < deadline) rafId = window.requestAnimationFrame(attempt);
          return;
        }

        if (!acquireTourSlot(tourId)) {
          unsubscribe = onTourSlotFree(() => {
            unsubscribe?.();
            unsubscribe = null;
            deadline = performance.now() + MAX_TARGET_WAIT_MS;
            rafId = window.requestAnimationFrame(attempt);
          });
          return;
        }

        launchClient(client, isFirstRun)
          .then(() => {
            if (isFirstRun) markSeen(storageKey);
            if (!cancelled) onStarted?.();
          })
          .catch(() => undefined);
      };

      rafId = window.requestAnimationFrame(attempt);

      return () => {
        cancelled = true;
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        unsubscribe?.();
        unsubscribe = null;
      };
    },
    [buildClient, launchClient, storageKey, tourId],
  );

  const startTour = useCallback(() => {
    manualStartCancelRef.current?.();
    manualStartCancelRef.current = null;

    void destroyCurrentClient().then(() => {
      manualStartCancelRef.current = scheduleStart();
    });
  }, [destroyCurrentClient, scheduleStart]);

  const exitTour = useCallback(() => tourRef.current?.exit(), []);

  useEffect(() => {
    if (!enabled || !stableSteps.length) return;

    if (isTourSlotFree()) purgeOrphanTourDom();

    const cancelAutoStart = autoStart && !readSeen(storageKey) ? scheduleStart() : null;

    return () => {
      cancelAutoStart?.();
      void destroyCurrentClient();
    };
  }, [autoStart, enabled, stableSteps, storageKey, scheduleStart, destroyCurrentClient]);

  useEffect(
    () => () => {
      manualStartCancelRef.current?.();
      manualStartCancelRef.current = null;
    },
    [],
  );

  return { startTour, exitTour };
}
