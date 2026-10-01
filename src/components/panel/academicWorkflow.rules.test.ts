import { describe, expect, it } from "vitest";
import type { AcademicCourse, AcademicRecord } from "./academicWorkflow.rules";
import { hasCompleteAsignarRaWorkflow } from "./academicWorkflow.rules";

const cycles: AcademicRecord[] = [
  {
    id: "cycle-archived",
    estado: "finalizado",
    programaId: "program-1",
    planId: "plan-1",
    cursoIds: ["course-1"],
  },
  {
    id: "cycle-current",
    estado: "activo",
    programaId: "program-1",
    planId: "plan-1",
    cursoIds: ["course-1"],
  },
];

const mapeos: AcademicRecord[] = [
  {
    id: "mapping-1",
    programaId: "program-1",
    planId: "plan-1",
    cursosMapeados: [{ cursoId: "course-1", competenciaRaId: "competence-1", nivel: "I" }],
  },
];

const competencias: AcademicRecord[] = [
  { id: "competence-1", programaId: "program-1", planId: "plan-1" },
];

const courses: AcademicCourse[] = [
  { id: "course-1", nucleo: "Síntesis", asignadoANucleoSintesis: true },
];

const archivedCycleAssignment: AcademicRecord = {
  id: "assignment-archived",
  cicloId: "cycle-archived",
  cursoId: "course-1",
  competenciaRaId: "competence-1",
  resultadoAprendizajeId: "ra-1",
  programaId: "program-1",
  planId: "plan-1",
};

const currentCycleAssignment: AcademicRecord = {
  ...archivedCycleAssignment,
  id: "assignment-current",
  cicloId: "cycle-current",
};

describe("hasCompleteAsignarRaWorkflow", () => {
  it("keeps the step pending until the active cycle receives its own assignments", () => {
    expect(
      hasCompleteAsignarRaWorkflow(
        cycles,
        mapeos,
        competencias,
        [archivedCycleAssignment],
        courses,
      ),
    ).toBe(false);

    expect(
      hasCompleteAsignarRaWorkflow(
        cycles,
        mapeos,
        competencias,
        [archivedCycleAssignment, currentCycleAssignment],
        courses,
      ),
    ).toBe(true);
  });
});
