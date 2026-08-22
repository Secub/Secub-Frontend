import { describe, expect, it } from "vitest";
import {
  getActivePlansByProgram,
  getDefaultLugarBySeccional,
  validateAcademicScope,
} from "./academicScope.utils";

const catalogs = {
  planes: [
    { id: "plan-activo", nombre: "Plan activo", programaId: "programa-1", estado: "activo" as const },
    { id: "plan-inactivo", nombre: "Plan anterior", programaId: "programa-1", estado: "inactivo" as const },
    { id: "otro-plan", nombre: "Otro plan", programaId: "programa-2", estado: "activo" as const },
  ],
};

describe("academic scope utilities", () => {
  it("conserva el plan inactivo únicamente cuando ya está seleccionado", () => {
    expect(getActivePlansByProgram(catalogs, "programa-1").map((plan) => plan.id)).toEqual([
      "plan-activo",
    ]);
    expect(
      getActivePlansByProgram(catalogs, "programa-1", "plan-inactivo").map(
        (plan) => plan.id,
      ),
    ).toEqual(["plan-activo", "plan-inactivo"]);
  });

  it("valida el alcance académico obligatorio", () => {
    expect(
      validateAcademicScope(
        {
          seccionalId: "",
          lugarId: "",
          facultadId: "",
          programaId: "",
          planId: "",
        },
        catalogs,
      ),
    ).toEqual({
      seccionalId: "Selecciona una seccional.",
      lugarId: "Selecciona un lugar de desarrollo.",
      facultadId: "Selecciona una facultad.",
      programaId: "Selecciona un programa.",
      planId: "Selecciona un plan de estudios.",
    });
    expect(getDefaultLugarBySeccional("cali")).toBe("cali");
  });
});
