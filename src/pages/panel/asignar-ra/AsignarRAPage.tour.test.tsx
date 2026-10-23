import type { ReactNode } from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AsignarRAPage from "./AsignarRAPage";

const state = vi.hoisted(() => ({
  tourSeen: false,
  expandedCompetenciaIds: [] as string[],
  toggle: vi.fn(),
  startDetailTour: vi.fn(),
}));

vi.mock("../../../components/panel", async () => ({
  FlowActionBar: () => null,
  PanelLayout: ({ children, onReplayTour }: { children: ReactNode; onReplayTour?: () => void }) => (
    <main>
      {onReplayTour ? <button type="button" onClick={onReplayTour}>Ver guía</button> : null}
      {children}
    </main>
  ),
  BackButton: () => null,
  WorkflowStateCard: () => null,
}));
vi.mock("../../../components/panel/academicWorkflow", () => ({
  useAcademicWorkflowProgress: () => ({}),
  getAcademicWorkflowState: () => "inProgress",
}));
vi.mock("../../../components/OnboardingTour", () => ({
  hasSeenOnboardingTour: () => state.tourSeen,
  useOnboardingTour: ({ storageKey }: { storageKey: string }) => ({
    startTour: storageKey === "tour_asignar_ra_detalle_v1" ? state.startDetailTour : vi.fn(),
  }),
}));
vi.mock("./components/AsignarRACourseDetail", () => ({
  AsignarRACourseDetail: () => <div>Detalle del curso</div>,
}));
vi.mock("./hooks/useAsignarRA", () => ({
  useAsignarRA: () => ({
    access: { canRead: true, canManage: true, isStepLocked: false },
    refs: {},
    selectedCourse: { id: "course-1", nombre: "Taller Integrador VIII" },
    selectedCourseAssignments: [],
    courseCompetencias: [{ id: "comp-1" }, { id: "comp-2" }],
    expandedCompetenciaIds: state.expandedCompetenciaIds,
    pendingCourseIds: [],
    hasUnsavedChanges: () => false,
    getCourseStatus: () => ({ label: "Pendiente", variant: "warning" }),
    toggleCompetenciaAccordion: state.toggle,
  }),
}));

afterEach(cleanup);
beforeEach(() => {
  state.tourSeen = false;
  state.expandedCompetenciaIds = [];
  state.toggle.mockReset();
  state.startDetailTour.mockReset();
});

describe("Asignar RA: tour del detalle y la primera competencia", () => {
  it("abre la primera competencia cuando el tour todavía no se ha visto", () => {
    render(<AsignarRAPage />);
    expect(state.toggle).toHaveBeenCalledWith("comp-1");
  });

  it("no abre la primera competencia por su cuenta si el tour ya se vio", () => {
    state.tourSeen = true;
    render(<AsignarRAPage />);
    expect(state.toggle).not.toHaveBeenCalled();
  });

  it("al repetir la guía con la competencia cerrada, la abre y espera a que esté abierta para iniciar", async () => {
    state.tourSeen = true;
    const { rerender } = render(<AsignarRAPage />);

    await userEvent.click(screen.getByRole("button", { name: "Ver guía" }));
    expect(state.toggle).toHaveBeenCalledWith("comp-1");
    expect(state.startDetailTour).not.toHaveBeenCalled();

    state.expandedCompetenciaIds = ["comp-1"];
    act(() => rerender(<AsignarRAPage />));
    expect(state.startDetailTour).toHaveBeenCalledTimes(1);
  });

  it("al repetir la guía con la competencia ya abierta, inicia de inmediato", async () => {
    state.tourSeen = true;
    state.expandedCompetenciaIds = ["comp-1"];
    render(<AsignarRAPage />);

    await userEvent.click(screen.getByRole("button", { name: "Ver guía" }));
    expect(state.toggle).not.toHaveBeenCalled();
    expect(state.startDetailTour).toHaveBeenCalledTimes(1);
  });
});
