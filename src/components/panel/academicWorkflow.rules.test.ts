import { describe, expect, it } from "vitest";
import {
  calculateAcademicWorkflowProgress,
  isAcademicWorkflowDataComplete,
  isAcademicWorkflowStepLockedForProgress,
  type WorkflowSnapshot,
} from "./academicWorkflow.rules";

function createEmptySnapshot(): WorkflowSnapshot {
  return {
    perfiles: [],
    propositos: [],
    competencias: [],
    mapeos: [],
    ciclos: [],
    asignaciones: [],
    cursos: [],
  };
}

describe("academicWorkflow rules", () => {
  it("calcula un flujo vacío sin marcar pasos completos", () => {
    const progress = calculateAcademicWorkflowProgress(createEmptySnapshot());

    expect(progress).toEqual({
      "perfil-egreso": false,
      "proposito-formacion": false,
      "competencias-ra": false,
      "mapeo-competencias": false,
      ciclo: false,
      "asignar-ra": false,
    });
    expect(isAcademicWorkflowDataComplete(progress)).toBe(false);
  });

  it("bloquea pasos posteriores cuando falta completar uno anterior", () => {
    const progress = {
      "perfil-egreso": true,
      "proposito-formacion": false,
    };

    expect(
      isAcademicWorkflowStepLockedForProgress(
        "competencias-ra",
        progress,
      ),
    ).toBe(true);
    expect(
      isAcademicWorkflowStepLockedForProgress(
        "competencias-ra",
        progress,
        true,
      ),
    ).toBe(false);
  });
});
