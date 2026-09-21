import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { OnboardingTourStep } from "../../../../components/OnboardingTour";
import type { DashboardView } from "../types/dashboard-page.types";

interface MockClient {
  options: { steps: Array<{ title?: string }> };
}

const { startMock, exitMock, instances } = vi.hoisted(() => ({
  startMock: vi.fn<() => Promise<unknown>>(),
  exitMock: vi.fn<() => Promise<unknown>>(),
  instances: [] as unknown[],
}));

vi.mock("@sjmc11/tourguidejs/dist/tour", () => {
  class MockTourGuideClient {
    options: Record<string, unknown>;
    start = startMock;
    exit = exitMock;

    constructor(options?: Record<string, unknown>) {
      this.options = options ?? {};
      instances.push(this);
    }

    onAfterExit() {}
  }

  return { TourGuideClient: MockTourGuideClient };
});

import {
  coursesViewTourSteps,
  detailViewTourSteps,
  resultsViewTourSteps,
  useDashboardViewTours,
} from "./useDashboardViewTours";

const lastInstance = () => (instances as MockClient[])[instances.length - 1];
const pause = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

// Crea en el DOM un elemento por cada destino, a partir del propio selector del paso.
// Un selector descendiente ("#tabla [marcador]") se monta dentro de su contenedor, que debe
// haberse creado antes (los pasos ya vienen en ese orden).
function createTarget(selector: string) {
  const element = document.createElement("div");
  const marker = /^\[data-dashboard-tour="(.+)"\]$/.exec(selector);
  if (marker) element.setAttribute("data-dashboard-tour", marker[1]);
  else element.id = selector.replace(/^#/, "");
  return element;
}

function mountTargets(steps: OnboardingTourStep[]) {
  steps.forEach(({ target }) => {
    const [containerSelector, childSelector] = target.split(" ");
    if (!childSelector) {
      document.body.appendChild(createTarget(target));
      return;
    }
    document.querySelector(containerSelector)?.appendChild(createTarget(childSelector));
  });
}

function renderTours(props: { view: DashboardView; isTeacher?: boolean; hasConsolidatedResults?: boolean }) {
  return renderHook(
    (current: typeof props) =>
      useDashboardViewTours({
        view: current.view,
        isTeacher: current.isTeacher ?? false,
        hasConsolidatedResults: current.hasConsolidatedResults ?? true,
      }),
    { initialProps: props },
  );
}

describe("useDashboardViewTours", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    instances.length = 0;
    startMock.mockReset().mockResolvedValue(true);
    exitMock.mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it.each([
    ["courses", coursesViewTourSteps, "tour_dashboard_courses_v1"],
    ["detail", detailViewTourSteps, "tour_dashboard_detail_v1"],
    ["results", resultsViewTourSteps, "tour_dashboard_results_v1"],
  ] as const)("auto starts the %s tour with all its steps", async (view, steps, storageKey) => {
    mountTargets([...steps]);

    const { result } = renderTours({ view });

    await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(lastInstance().options.steps).toHaveLength(steps.length);
    expect(result.current.canShowViewTour).toBe(true);
    await waitFor(() => expect(localStorage.getItem(storageKey)).toBe("true"));
  });

  it("does not start any tour on the control view", async () => {
    mountTargets([...coursesViewTourSteps, ...detailViewTourSteps, ...resultsViewTourSteps]);

    const { result } = renderTours({ view: "control" });

    await pause();
    expect(startMock).not.toHaveBeenCalled();
    expect(result.current.canShowViewTour).toBe(false);
  });

  it("does not offer the courses tour to teachers", async () => {
    mountTargets([...coursesViewTourSteps]);

    const { result } = renderTours({ view: "courses", isTeacher: true });

    await pause();
    expect(startMock).not.toHaveBeenCalled();
    expect(result.current.canShowViewTour).toBe(false);
  });

  it("does not offer the results tour when there are no consolidated results", async () => {
    mountTargets([...resultsViewTourSteps]);

    const { result } = renderTours({ view: "results", hasConsolidatedResults: false });

    await pause();
    expect(startMock).not.toHaveBeenCalled();
    expect(result.current.canShowViewTour).toBe(false);
  });

  it("starts with the steps that exist when the table has no rows", async () => {
    // Los destinos con espacio son descendientes de la tabla (sus filas): no se montan.
    mountTargets(coursesViewTourSteps.filter((step) => !step.target.includes(" ")));

    renderTours({ view: "courses" });

    await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1), { timeout: 2000 });
    expect(lastInstance().options.steps).toHaveLength(coursesViewTourSteps.length - 1);
  });

  it("replays the tour of the current view even if it was already seen", async () => {
    localStorage.setItem("tour_dashboard_detail_v1", "true");
    mountTargets([...detailViewTourSteps]);
    const { result } = renderTours({ view: "detail" });

    await pause();
    expect(startMock).not.toHaveBeenCalled();

    result.current.startViewTour();

    await waitFor(() => expect(startMock).toHaveBeenCalledTimes(1));
    expect(lastInstance().options.steps).toHaveLength(detailViewTourSteps.length);
  });
});
