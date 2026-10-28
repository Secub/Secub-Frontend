import type { ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AsignarRAPage from "./AsignarRAPage";

type TourOptions = {
  storageKey: string;
  steps: Array<{ target: string; content: string }>;
  autoStart?: boolean;
  enabled?: boolean;
  allowPartialTargets?: boolean;
};

const state = vi.hoisted(() => ({
  loading: false,
  canManage: true,
  hasCourseRows: true,
  tours: new Map<string, TourOptions>(),
  startListTour: vi.fn(),
  startDetailTour: vi.fn(),
}));

vi.mock("../../../components/panel", () => ({
  FlowActionBar: () => null,
  PanelLayout: ({ children, onReplayTour }: { children: ReactNode; onReplayTour?: () => void }) => (
    <main>
      {onReplayTour ? <button type="button" onClick={onReplayTour}>Ver guía</button> : null}
      {children}
    </main>
  ),
  BackButton: () => null,
  WorkflowStateCard: ({ title }: { title: string }) => <p>{title}</p>,
  completeAcademicWorkflowFromCurrentProgress: vi.fn(),
}));
vi.mock("../../../components/panel/academicWorkflow", () => ({
  useAcademicWorkflowProgress: () => ({}),
  getAcademicWorkflowState: () => "inProgress",
}));
vi.mock("../../../services/raAssignments", () => ({
  saveCourseRAAssignments: vi.fn(),
  deleteCourseRAAssignments: vi.fn(),
}));
vi.mock("../../../components/OnboardingTour", () => ({
  useOnboardingTour: (options: TourOptions) => {
    state.tours.set(options.storageKey, options);
    return {
      startTour: options.storageKey === "tour_asignar_ra_detalle_v1" ? state.startDetailTour : state.startListTour,
    };
  },
}));
vi.mock("./components/AsignarRAFilters", () => ({ AsignarRAFilters: () => null }));
vi.mock("./components/AsignarRACoursesTable", () => ({
  AsignarRACoursesTable: ({ onSelectCourse }: { onSelectCourse: (courseId: string) => void }) => (
    <button type="button" onClick={() => onSelectCourse("course-1")}>Abrir curso</button>
  ),
}));
vi.mock("./components/AsignarRACourseDetail", () => ({
  AsignarRACourseDetail: ({
    expandedCompetenciaIds,
    onToggleAccordion,
  }: {
    expandedCompetenciaIds: string[];
    onToggleAccordion: (competenciaId: string) => void;
  }) => (
    <div>
      <p>Abiertas: {expandedCompetenciaIds.join(",")}</p>
      <button type="button" onClick={() => onToggleAccordion("comp-1")}>Alternar comp-1</button>
    </div>
  ),
}));
vi.mock("./hooks/useAsignarRA", async () => {
  const { useState } = await import("react");
  const { useAsignarRAActions } = await import("./hooks/useAsignarRAActions");
  const cycle = { id: "cycle-1" };
  const course = {
    id: "course-1", nombre: "Taller Integrador VIII", codigo: "T08",
    creditos: 3, semestre: 8, nucleo: "Síntesis" as const,
    programaId: "program-1", planId: "plan-1", docente: "Docente",
    tipoVinculacion: "", competenciasAsignadas: 2,
    nivelCompromiso: "A" as const, asignadoANucleoSintesis: true,
  };
  const competencias = [
    { id: "comp-1", nombre: "C1", resultadosAprendizaje: [{ id: "ra-1" }] },
    { id: "comp-2", nombre: "C2", resultadosAprendizaje: [{ id: "ra-2" }] },
  ];
  const noCompetencias: typeof competencias = [];
  const noAssignments: never[] = [];
  const noMeasurements: never[] = [];
  const pendingCourseIds = ["course-1"];
  const courses = [course];
  const refs = { coursesRef: { current: null }, assignmentPanelRef: { current: null } };

  return {
    useAsignarRA: () => {
      const [selectedCourseId, setSelectedCourseId] = useState("");
      const selectedCourse = selectedCourseId ? course : undefined;
      const courseCompetencias = selectedCourse ? competencias : noCompetencias;
      const actions = useAsignarRAActions({
        canManage: state.canManage,
        selectedProgramId: "program-1",
        selectedPlanId: "plan-1",
        courses,
        pendingCourseIds,
        selectedCycle: cycle,
        selectedCourse,
        selectedCourseAssignments: noAssignments,
        courseCompetencias,
        measurements: noMeasurements,
        coursesRef: refs.coursesRef,
        assignmentPanelRef: refs.assignmentPanelRef,
        setSelectedCourseId,
        refreshBackendState: async () => undefined,
        resetFeedback: () => undefined,
        setFeedback: () => undefined,
        setErrorMessage: () => undefined,
      });

      return {
        ...actions,
        access: { canRead: true, canManage: state.canManage, canDelete: state.canManage, isStepLocked: false },
        loading: state.loading,
        loadError: null,
        refresh: async () => undefined,
        filters: { courseFilterId: "" },
        filterOptions: {},
        filterLocks: {},
        refs,
        cycles: [cycle],
        courses,
        courseRows: state.hasCourseRows ? [{ course }] : [],
        selectedCycle: cycle,
        selectedCourse,
        selectedCourseAssignments: noAssignments,
        courseCompetencias,
        measurements: noMeasurements,
        feedback: "",
        errorMessage: "",
        pendingCourseIds,
        getCourseStatus: () => undefined,
      };
    },
  };
});

afterEach(cleanup);
beforeEach(() => {
  state.loading = false;
  state.canManage = true;
  state.hasCourseRows = true;
  state.tours.clear();
  state.startListTour.mockReset();
  state.startDetailTour.mockReset();
});

const detailTour = () => state.tours.get("tour_asignar_ra_detalle_v1");
const listTour = () => state.tours.get("tour_asignar_ra_v1");

async function openCourse() {
  render(<AsignarRAPage />);
  await userEvent.click(screen.getByRole("button", { name: "Abrir curso" }));
}

describe("Asignar RA: tour del detalle", () => {
  it("al abrir un curso deja la primera competencia abierta y habilita el tour automático", async () => {
    await openCourse();
    expect(screen.getByText("Abiertas: comp-1,comp-2")).toBeInTheDocument();
    expect(detailTour()?.enabled).toBe(true);
    expect(detailTour()?.autoStart).toBe(true);
  });

  it("al repetir la guía con la primera competencia cerrada, la abre y luego inicia", async () => {
    await openCourse();
    await userEvent.click(screen.getByRole("button", { name: "Alternar comp-1" }));
    expect(screen.getByText("Abiertas: comp-2")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Ver guía" }));
    expect(screen.getByText("Abiertas: comp-2,comp-1")).toBeInTheDocument();
    expect(state.startDetailTour).toHaveBeenCalledTimes(1);
  });

  it("al repetir la guía con la primera competencia abierta, inicia de inmediato", async () => {
    await openCourse();
    await userEvent.click(screen.getByRole("button", { name: "Ver guía" }));
    expect(screen.getByText("Abiertas: comp-1,comp-2")).toBeInTheDocument();
    expect(state.startDetailTour).toHaveBeenCalledTimes(1);
  });

  it("no invita a seleccionar RA a usuarios de solo consulta", async () => {
    state.canManage = false;
    await openCourse();
    const contents = detailTour()?.steps.map((step) => step.content).join(" ");
    expect(contents).not.toMatch(/Selecciona/);
  });
});

describe("Asignar RA: tour de la lista de cursos", () => {
  it("explica la acción que abre el detalle del curso", () => {
    render(<AsignarRAPage />);
    expect(listTour()?.steps.map((step) => step.target)).toEqual([
      "#asignar-ra-courses-panel",
      '[data-tour="asignar-ra-course-action"]',
    ]);
    expect(listTour()?.allowPartialTargets).toBe(true);
  });

  it("no se habilita mientras la página está cargando", () => {
    state.loading = true;
    render(<AsignarRAPage />);
    expect(listTour()?.enabled).toBe(false);
    expect(listTour()?.autoStart).toBe(false);
  });

  it("espera a que haya cursos para iniciar solo, pero deja repetir la guía", () => {
    state.hasCourseRows = false;
    render(<AsignarRAPage />);
    expect(listTour()?.autoStart).toBe(false);
    expect(listTour()?.enabled).toBe(true);
    expect(screen.getByRole("button", { name: "Ver guía" })).toBeInTheDocument();
  });

  it("inicia solo cuando ya hay cursos para señalar la acción", () => {
    render(<AsignarRAPage />);
    expect(listTour()?.autoStart).toBe(true);
  });
});
