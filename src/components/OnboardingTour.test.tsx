import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface MockClient {
  options: {
    keyboardControls?: boolean;
    exitOnEscape?: boolean;
    exitOnClickOutside?: boolean;
    closeButton?: boolean;
    steps: Array<{ target: unknown; title?: string }>;
  };
  afterExit?: () => void;
  afterStepChange?: () => void;
}

const { startMock, exitMock, updatePositionsMock, instances } = vi.hoisted(() => ({
  startMock: vi.fn<() => Promise<unknown>>(),
  exitMock: vi.fn<() => Promise<unknown>>(),
  updatePositionsMock: vi.fn<() => Promise<unknown>>(),
  instances: [] as unknown[],
}));

vi.mock("@sjmc11/tourguidejs/dist/tour", () => {
  class MockTourGuideClient {
    options: Record<string, unknown>;
    afterExit?: () => void;
    afterStepChange?: () => void;
    start = startMock;
    exit = exitMock;
    updatePositions = updatePositionsMock;
    tourSteps: unknown[];
    activeStep = 0;

    constructor(options?: Record<string, unknown>) {
      this.options = options ?? {};
      this.tourSteps = (this.options.steps as unknown[]) ?? [];
      instances.push(this);
    }

    onAfterExit(callback: () => void) {
      this.afterExit = callback;
    }

    onAfterStepChange(callback: () => void) {
      this.afterStepChange = callback;
    }
  }

  return { TourGuideClient: MockTourGuideClient };
});

import { useOnboardingTour, type OnboardingTourStep } from "./OnboardingTour";

const tourInstances = () => instances as MockClient[];
const startedInstance = () => tourInstances()[tourInstances().length - 1];
const pause = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms));

function mountTarget(id: string, parent: HTMLElement = document.body) {
  const element = document.createElement("div");
  element.id = id;
  parent.appendChild(element);
  return element;
}

function stepsFor(...ids: string[]): OnboardingTourStep[] {
  return ids.map((id, index) => ({
    target: `#${id}`,
    title: `Paso ${index + 1}`,
    content: `Contenido ${index + 1}`,
    order: index + 1,
  }));
}

describe("useOnboardingTour", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    document.documentElement.style.scrollBehavior = "";
    instances.length = 0;
    startMock.mockReset().mockResolvedValue(true);
    exitMock.mockReset().mockResolvedValue(undefined);
    updatePositionsMock.mockReset().mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("auto start", () => {
    it("waits for every target to be mounted before starting", async () => {
      renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters", "list"), storageKey: "tour_a" }),
      );

      mountTarget("filters");
      await pause();
      expect(startMock).not.toHaveBeenCalled();

      mountTarget("list");
      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1), { timeout: 2000 });
    });

    it.each([
      ["enabled is false", { enabled: false }, undefined],
      ["autoStart is false", { autoStart: false }, undefined],
      ["the tour was already seen", {}, "true"],
    ])("does not start when %s", async (_label, options, seen) => {
      if (seen) localStorage.setItem("tour_a", seen);
      mountTarget("filters");

      renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a", ...options }),
      );

      await pause();
      expect(startMock).not.toHaveBeenCalled();
    });

    it("locks keyboard and close controls during the first tour", async () => {
      mountTarget("filters");
      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await waitFor(() => expect(startMock).toHaveBeenCalled());
      expect(startedInstance().options.keyboardControls).toBe(false);
      expect(startedInstance().options.exitOnEscape).toBe(false);
      expect(startedInstance().options.exitOnClickOutside).toBe(false);
      expect(startedInstance().options.closeButton).toBe(false);
    });

    it("keeps next disabled until the configured first-run delay expires", async () => {
      mountTarget("filters");
      const nextButton = document.createElement("button");
      nextButton.id = "tg-dialog-next-btn";
      document.body.appendChild(nextButton);

      renderHook(() =>
        useOnboardingTour({
          steps: stepsFor("filters"),
          storageKey: "tour_a",
          minimumFirstRunStepDurationMs: 40,
        }),
      );

      await waitFor(() => expect(nextButton.disabled).toBe(true));
      await pause(60);
      expect(nextButton.disabled).toBe(false);
    });

    it("uses a one-second first-run delay by default", async () => {
      mountTarget("filters");
      const nextButton = document.createElement("button");
      nextButton.id = "tg-dialog-next-btn";
      document.body.appendChild(nextButton);
      const setTimeoutSpy = vi.spyOn(window, "setTimeout");

      const { unmount } = renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }),
      );

      await waitFor(() => expect(nextButton.disabled).toBe(true));
      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      unmount();
    });

    it("keeps normal controls when the tour has already been seen", async () => {
      localStorage.setItem("tour_a", "true");
      mountTarget("filters");
      const { result } = renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a", autoStart: false }),
      );

      result.current.startTour();
      await waitFor(() => expect(startMock).toHaveBeenCalled());
      expect(startedInstance().options.keyboardControls).toBe(true);
      expect(startedInstance().options.exitOnEscape).toBe(true);
      expect(startedInstance().options.exitOnClickOutside).toBe(true);
      expect(startedInstance().options.closeButton).toBe(true);
    });
  });

  describe("seen flag", () => {
    it("marks the tour as seen once it has started", async () => {
      mountTarget("filters");
      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await waitFor(() => expect(localStorage.getItem("tour_a")).toBe("true"));
    });

    it("does not mark the tour as seen when it fails to start", async () => {
      startMock.mockRejectedValue(new Error("boom"));
      mountTarget("filters");
      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await waitFor(() => expect(startMock).toHaveBeenCalled());
      await pause();
      expect(localStorage.getItem("tour_a")).toBeNull();
    });

    it("still starts when localStorage is unavailable", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("blocked");
      });
      mountTarget("filters");

      renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_storage_blocked" }),
      );

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
    });
  });

  describe("targets", () => {
    it("does not start a strict tour when a target is missing", async () => {
      mountTarget("filters");
      renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters", "missing"), storageKey: "tour_a" }),
      );

      await pause(150);
      expect(startMock).not.toHaveBeenCalled();
    });

    it("starts a partial tour with only the targets that exist", async () => {
      mountTarget("filters");
      renderHook(() =>
        useOnboardingTour({
          steps: stepsFor("filters", "missing"),
          storageKey: "tour_a",
          allowPartialTargets: true,
        }),
      );

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
      expect(startedInstance().options.steps).toHaveLength(1);
    });

    it("ignores targets that are not rendered", async () => {
      const hidden = mountTarget("filters");
      hidden.style.display = "none";

      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await pause(150);
      expect(startMock).not.toHaveBeenCalled();
    });

    it("targets the rendered element when the id is duplicated", async () => {
      const hiddenWrapper = mountTarget("drawer");
      hiddenWrapper.style.display = "none";
      mountTarget("filters", hiddenWrapper);
      const visible = mountTarget("filters");

      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
      expect(startedInstance().options.steps[0].target).toBe(visible);
    });
  });

  describe("steps identity", () => {
    it("keeps the running tour when steps are re-created with the same content", async () => {
      mountTarget("filters");
      const { rerender } = renderHook(
        ({ ids }) => useOnboardingTour({ steps: stepsFor(...ids), storageKey: "tour_a" }),
        { initialProps: { ids: ["filters"] } },
      );

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));

      rerender({ ids: ["filters"] });
      await pause();

      expect(startMock).toHaveBeenCalledTimes(1);
      expect(exitMock).not.toHaveBeenCalled();
    });
  });

  describe("one tour at a time", () => {
    it("starts the second tour only after the first one ends", async () => {
      mountTarget("sidebar");
      mountTarget("page");

      renderHook(() => useOnboardingTour({ steps: stepsFor("sidebar"), storageKey: "tour_sidebar" }));
      renderHook(() => useOnboardingTour({ steps: stepsFor("page"), storageKey: "tour_page" }));

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
      await pause();
      expect(startMock).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem("tour_page")).toBeNull();

      tourInstances()[0].afterExit?.();

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(2));
      await waitFor(() => expect(localStorage.getItem("tour_page")).toBe("true"));
    });
  });

  describe("manual start", () => {
    it("replays a tour that was already seen and returns nothing to await", async () => {
      localStorage.setItem("tour_a", "true");
      mountTarget("filters");
      const { result } = renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }),
      );

      const returned: unknown = result.current.startTour();

      expect(returned).toBeUndefined();
      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
    });
  });

  describe("restarting a running tour", () => {
    it("still restarts when the library refuses to exit mid-transition", async () => {
      mountTarget("filters");
      const { result } = renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }),
      );
      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));

      // La libreria rechaza exit() mientras hay una transicion de paso en curso.
      exitMock.mockRejectedValueOnce("Promise waiting");
      result.current.startTour();

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(2), { timeout: 2000 });
    });
  });

  describe("scroll", () => {
    it("gives every resolved target a scroll margin so fixed bars do not cover it", async () => {
      const target = mountTarget("filters");
      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));

      // 140 (autoScrollOffset) + 30 (targetPadding)
      expect(target.style.scrollMargin).toContain("170px");
    });

    it("repositions the tour when an inner container scrolls", async () => {
      const container = document.createElement("div");
      document.body.appendChild(container);
      mountTarget("field", container);
      renderHook(() => useOnboardingTour({ steps: stepsFor("field"), storageKey: "tour_a" }));

      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
      updatePositionsMock.mockClear();

      container.dispatchEvent(new Event("scroll"));

      await waitFor(() => expect(updatePositionsMock).toHaveBeenCalled());
    });

    it("scrolls the inner container to make room for the dialog above a large target", async () => {
      const container = document.createElement("div");
      container.style.overflowY = "auto";
      Object.defineProperty(container, "scrollHeight", { value: 2000 });
      Object.defineProperty(container, "clientHeight", { value: 500 });
      container.scrollTop = 300;
      document.body.appendChild(container);
      const target = mountTarget("courses", container);
      vi.spyOn(target, "getBoundingClientRect").mockReturnValue(
        { top: 50, left: 0, width: 400, height: 300, right: 400, bottom: 350, x: 0, y: 50 } as DOMRect,
      );
      const dialog = document.createElement("div");
      dialog.className = "tg-dialog";
      vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue(
        { top: 0, left: 0, width: 300, height: 150, right: 300, bottom: 150, x: 0, y: 0 } as DOMRect,
      );
      const backdrop = document.createElement("div");
      backdrop.className = "tg-backdrop";
      const windowScroll = vi.spyOn(window, "scrollBy").mockImplementation(() => undefined);

      renderHook(() => useOnboardingTour({ steps: stepsFor("courses"), storageKey: "tour_a" }));
      await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
      document.body.append(dialog, backdrop);
      dialog.style.top = "0px";

      await waitFor(() => expect(container.scrollTop).toBe(180));
      expect(windowScroll).not.toHaveBeenCalled();
    });
  });

  describe("cleanup", () => {
    it("restores scroll behavior when the tour ends", async () => {
      mountTarget("filters");
      renderHook(() => useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }));

      await waitFor(() => expect(startMock).toHaveBeenCalled());
      expect(document.documentElement.style.scrollBehavior).toBe("auto");

      startedInstance().afterExit?.();

      expect(document.documentElement.style.scrollBehavior).toBe("");
    });

    it("exits the running tour on unmount", async () => {
      mountTarget("filters");
      const { unmount } = renderHook(() =>
        useOnboardingTour({ steps: stepsFor("filters"), storageKey: "tour_a" }),
      );

      await waitFor(() => expect(startMock).toHaveBeenCalled());
      unmount();

      await waitFor(() => expect(exitMock).toHaveBeenCalled());
    });
  });
});
