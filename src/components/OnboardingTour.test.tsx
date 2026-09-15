import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const startMock = vi.fn();
const exitMock = vi.fn();

vi.mock("@sjmc11/tourguidejs/dist/tour", () => {
  class MockTourGuideClient {
    options: Record<string, unknown>;
    start = startMock;
    exit = exitMock;

    constructor(options?: Record<string, unknown>) {
      this.options = options ?? {};
    }
  }

  return { TourGuideClient: MockTourGuideClient };
});

import { useOnboardingTour } from "./OnboardingTour";

describe("useOnboardingTour", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    startMock.mockClear();
    exitMock.mockClear();
    vi.useRealTimers();
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("starts only after the target elements are mounted and advances through the configured steps", async () => {
    const stepTargetSelector = "#proposito-filters-panel";

    renderHook(() =>
      useOnboardingTour({
        steps: [
          {
            target: stepTargetSelector,
            title: "Filtros",
            content: "Filtra los propósitos de formación.",
            order: 1,
          },
          {
            target: "#proposito-list-section",
            title: "Listado",
            content: "Aquí revisa los registros.",
            order: 2,
          },
        ],
        storageKey: "tour_proposito_formacion_v1",
        autoStart: true,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(startMock).not.toHaveBeenCalled();
    });

    const filtersPanel = document.createElement("div");
    filtersPanel.id = "proposito-filters-panel";
    document.body.appendChild(filtersPanel);

    const listSection = document.createElement("div");
    listSection.id = "proposito-list-section";
    document.body.appendChild(listSection);

    await waitFor(() => {
      expect(startMock).toHaveBeenCalledTimes(1);
    }, { timeout: 2000 });
  });
});
