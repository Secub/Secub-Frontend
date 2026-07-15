import { describe, expect, it } from "vitest";
import { isSemesterFlowComplete, shouldRequireSemesterConfirmation } from "./MapeoCompetencias.semestres";

describe("isSemesterFlowComplete", () => {
  it("no marca un semestre como completo solo por tener valores por defecto", () => {
    const coursesBySemester = {
      1: [{ id: "curso-1", nombre: "Curso 1", codigo: "C1", creditos: 1, semestre: 1, programaId: "prog-1", planId: "plan-1" }],
    };
    const competencias = [{ id: "comp-1", nombre: "Competencia", descripcion: "" }];
    const nivelesDraft = { "curso-1__comp-1": "no-aplica" as const };

    expect(isSemesterFlowComplete(1, coursesBySemester, competencias, nivelesDraft, false)).toBe(false);
  });

  it("marca un semestre como completo cuando está confirmado y todas las celdas están cubiertas", () => {
    const coursesBySemester = {
      1: [{ id: "curso-1", nombre: "Curso 1", codigo: "C1", creditos: 1, semestre: 1, programaId: "prog-1", planId: "plan-1" }],
    };
    const competencias = [{ id: "comp-1", nombre: "Competencia", descripcion: "" }];
    const nivelesDraft = { "curso-1__comp-1": "no-aplica" as const };

    expect(isSemesterFlowComplete(1, coursesBySemester, competencias, nivelesDraft, true)).toBe(true);
  });

  it("requiere confirmación cuando el semestre tiene todos los niveles pero no está confirmado", () => {
    expect(shouldRequireSemesterConfirmation(false)).toBe(true);
  });

  it("no requiere confirmación cuando el semestre está confirmado", () => {
    expect(shouldRequireSemesterConfirmation(true)).toBe(false);
  });
});
