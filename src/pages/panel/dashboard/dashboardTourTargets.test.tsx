import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OnboardingTourStep } from "../../../components/OnboardingTour";
import { SECUB_ROLES } from "../../../config/access/roles";
import CompetenceResultsPanel from "./components/CompetenceResultsPanel";
import CoursesMeasurementTable from "./components/CoursesMeasurementTable";
import DashboardFilters from "./components/DashboardFilters";
import ResultsMeasurementPanel from "./components/ResultsMeasurementPanel";
import { DASHBOARD_TOUR_IDS } from "./dashboard.tour";
import type { EnrichedCourse, EnrichedRaResult } from "./dashboard.types";
import {
  coursesViewTourSteps,
  detailViewTourSteps,
  resultsViewTourSteps,
} from "./hooks/useDashboardViewTours";

// Contrato entre los tours de las vistas del dashboard y lo que realmente se renderiza:
// cada destino de un paso debe existir en el DOM (y los ids, una sola vez).

function makeResult(overrides: Partial<EnrichedRaResult> = {}): EnrichedRaResult {
  return {
    key: "course-1-ra-1",
    courseId: "course-1",
    courseName: "Curso de prueba",
    courseCode: "CUR-101",
    teacherName: "Docente Uno",
    competenceId: "comp-1",
    competenceCode: "C1",
    competenceName: "Competencia uno",
    raId: "ra-1",
    raCode: "RA1",
    raName: "Resultado de aprendizaje uno",
    raDescription: "Descripcion",
    totalStudents: 20,
    approvedStudents: 15,
    notApprovedStudents: 5,
    compliance: 75,
    status: "aprobado",
    reachedTarget: true,
    hasMeasurement: true,
    measurementStatus: "finalizado",
    instrumentFile: "instrumento.pdf",
    instrumentDescription: "Rubrica",
    evidenceFile: "evidencia.pdf",
    ...overrides,
  };
}

function makeCourse(overrides: Partial<EnrichedCourse> = {}): EnrichedCourse {
  return {
    id: "course-1",
    code: "CUR-101",
    name: "Curso de prueba",
    cycleId: "cycle-1",
    seccionalId: "sec-1",
    facultadId: "fac-1",
    programaId: "prog-1",
    planId: "plan-1",
    teacherId: "teacher-1",
    competenceIds: ["comp-1"],
    totalRa: 2,
    evaluatedRa: 0,
    results: [],
    cycleName: "Ciclo 1",
    period: "2026-1",
    seccionalName: "Seccional",
    facultadName: "Facultad",
    programaName: "Programa",
    planName: "Plan",
    planEstado: "activo",
    teacherName: "Docente Uno",
    teacherEmail: "docente@example.com",
    competences: [],
    status: "pendiente",
    pendingRa: 2,
    progress: 0,
    ...overrides,
  };
}

function expectTargetsToExist(container: HTMLElement, steps: OnboardingTourStep[]) {
  steps.forEach(({ target }) => {
    const matches = container.querySelectorAll(target);
    expect(matches.length, `missing tour target ${target}`).toBeGreaterThan(0);
    if (target.startsWith("#")) expect(matches, `duplicated id ${target}`).toHaveLength(1);
  });
}

describe("dashboard view tour targets", () => {
  it("renders every target of the results tour", () => {
    const { container } = render(
      <CompetenceResultsPanel
        results={[
          makeResult(),
          makeResult({ key: "course-1-ra-2", raId: "ra-2", raCode: "RA2" }),
          makeResult({ key: "course-2-ra-3", competenceId: "comp-2", raId: "ra-3", raCode: "RA3" }),
        ]}
        onDownloadFile={vi.fn()}
        onOpenRaDetail={vi.fn()}
      />,
    );

    expectTargetsToExist(container, resultsViewTourSteps);
  });

  it("renders every target of the detail tour", () => {
    const { container } = render(
      <ResultsMeasurementPanel
        results={[makeResult()]}
        courses={[makeCourse()]}
        selectedCourseId=""
        selectedCompetenceId=""
        onCourseChange={vi.fn()}
        onCompetenceChange={vi.fn()}
        onDownloadFile={vi.fn()}
        onOpenRaDetail={vi.fn()}
      />,
    );

    expectTargetsToExist(container, detailViewTourSteps);
  });

  it("renders every target of the courses tour", () => {
    const { container } = render(
      <>
        <DashboardFilters
          user={{
            id: "user-1",
            name: "Admin",
            role: SECUB_ROLES.ADMINISTRADOR,
            label: "Administrador",
            scope: {},
          }}
          catalogs={{
            seccionales: [],
            facultades: [],
            programas: [],
            planes: [],
            teachers: [],
            competences: [],
          }}
          cycles={[]}
          tourId={DASHBOARD_TOUR_IDS.coursesFilters}
          filters={{
            seccionalId: "",
            facultadId: "",
            programaId: "",
            planId: "",
            cycleId: "",
            status: "",
            competenceId: "",
            teacherId: "",
          }}
          onFilterChange={vi.fn()}
          onReset={vi.fn()}
        />
        <CoursesMeasurementTable
          courses={[makeCourse()]}
          mode="supervisor"
          onMeasureCourse={vi.fn()}
          onViewResults={vi.fn()}
          tableId={DASHBOARD_TOUR_IDS.coursesTable}
        />
      </>,
    );

    expectTargetsToExist(container, coursesViewTourSteps);
  });
});
