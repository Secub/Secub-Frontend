import { describe, expect, it } from "vitest";
import { canAssignNucleo, getTotalSemestersForPlan, isNucleoSequenceValid } from "./MapeoCompetencias.semestres";
import type { NucleosDraft, PlanEstudio } from "./MapeoCompetencias.types";

describe("clasificación de núcleos", () => {
  it("usa el número de semestres del plan académico", () => {
    const plan: PlanEstudio = { id: "plan", nombre: "Plan", programaId: "programa", estado: "activo", totalSemestres: 8 };
    expect(getTotalSemestersForPlan(plan)).toBe(8);
  });

  it("permite repetir un núcleo o avanzar solo al siguiente", () => {
    const draft: NucleosDraft = { 1: "fundamentacion", 2: null, 3: "profesionalizacion", 4: null };

    expect(canAssignNucleo(draft, 2, "fundamentacion")).toBe(true);
    expect(canAssignNucleo(draft, 2, "profesionalizacion")).toBe(true);
    expect(canAssignNucleo(draft, 2, "sintesis")).toBe(false);
    expect(canAssignNucleo(draft, 4, "fundamentacion")).toBe(false);
    expect(canAssignNucleo(draft, 4, "sintesis")).toBe(true);
  });

  it("detecta retrocesos y saltos en una clasificación guardada", () => {
    expect(isNucleoSequenceValid({ 1: "fundamentacion", 2: "profesionalizacion", 3: "sintesis" }, 3)).toBe(true);
    expect(isNucleoSequenceValid({ 1: "fundamentacion", 2: "sintesis", 3: "sintesis" }, 3)).toBe(false);
    expect(isNucleoSequenceValid({ 1: "profesionalizacion", 2: "fundamentacion", 3: "sintesis" }, 3)).toBe(false);
  });
});
