import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AsignarRAPage from "./AsignarRAPage";

const state = vi.hoisted(() => ({
  completed: true,
  canManage: true,
  pendingCourseIds: [] as string[],
  save: vi.fn(),
  next: vi.fn(),
  finish: vi.fn(),
}));

vi.mock("../../../components/panel", async () => ({
  FlowActionBar: (await import("../../../components/panel/FlowActionBar")).default,
  PanelLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
  BackButton: () => null,
}));
vi.mock("../../../components/panel/academicWorkflow", () => ({
  useAcademicWorkflowProgress: () => ({}),
  getAcademicWorkflowState: () => state.completed ? "completed" : "inProgress",
}));
vi.mock("../../../components/OnboardingTour", () => ({
  useOnboardingTour: () => ({ startTour: vi.fn() }),
}));
vi.mock("./components/AsignarRACourseDetail", () => ({
  AsignarRACourseDetail: () => <div>Detalle del curso</div>,
}));
vi.mock("./hooks/useAsignarRA", () => ({
  useAsignarRA: () => ({
    access: { canRead: true, canManage: state.canManage },
    refs: {},
    selectedCourse: { id: "course-1", nombre: "Taller Integrador VIII" },
    selectedCourseAssignments: [],
    courseCompetencias: [],
    expandedCompetenciaIds: [],
    pendingCourseIds: state.pendingCourseIds,
    hasUnsavedChanges: () => true,
    getCourseStatus: () => ({ label: "Pendiente", variant: "warning" }),
    handleSaveCourseAssignments: state.save,
    handleSaveAndOpenNextCourse: state.next,
    handleSaveAndRequestFinish: state.finish,
  }),
}));

afterEach(cleanup);
beforeEach(() => {
  state.completed = true;
  state.canManage = true;
  state.pendingCourseIds = [];
});

describe("Asignar RA: acciones del detalle", () => {
  it("permite guardar al editar un flujo ya completo", async () => {
    render(<AsignarRAPage />);
    await userEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(state.save).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Finalizar" })).not.toBeInTheDocument();
  });

  it("mantiene Siguiente curso disponible si hay cursos pendientes aunque el flujo figure completo", async () => {
    state.pendingCourseIds = ["course-2"];
    render(<AsignarRAPage />);
    await userEvent.click(screen.getByRole("button", { name: "Siguiente curso" }));
    expect(state.next).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
  });

  it("permite guardar o finalizar el último curso de un flujo activo", async () => {
    state.completed = false;
    render(<AsignarRAPage />);
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Finalizar" }));
    expect(state.finish).toHaveBeenCalledTimes(1);
  });

  it("oculta las acciones de escritura a usuarios de consulta", () => {
    state.canManage = false;
    render(<AsignarRAPage />);
    expect(screen.queryByRole("button", { name: "Guardar cambios" })).not.toBeInTheDocument();
  });
});
