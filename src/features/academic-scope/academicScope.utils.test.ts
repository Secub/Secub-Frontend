import { describe, expect, it } from "vitest";
import {
  getActivePlansByProgram,
  getDefaultLugarBySeccional,
  validateAcademicScope,
} from "./academicScope.utils";
import {
  getProgramById,
  secubLugares,
  SIMPLE_DEMO_IDS,
} from "../../data/secubAcademicPrograms";

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
  });

  it("resuelve el lugar desde la relación del catálogo académico", () => {
    const program = getProgramById(SIMPLE_DEMO_IDS.programaId);

    expect(program?.lugarId).toBe(SIMPLE_DEMO_IDS.lugarId);
    expect(
      getDefaultLugarBySeccional(program?.seccionalId ?? "", secubLugares),
    ).toBe(program?.lugarId);
    expect(
      secubLugares.find((lugar) => lugar.id === program?.lugarId)?.nombre,
    ).toBe("Cali");
  });

  it.each([
    ["sec-cali", "lugar-cali"],
    ["sec-bogota", "lugar-bogota"],
    ["sec-medellin", "lugar-medellin"],
    ["sec-cartagena", "lugar-cartagena"],
  ])("resuelve %s sin depender de un valor visual hardcodeado", (seccionalId, lugarId) => {
    const lugares = [
      { id: "lugar-cali", nombre: "Cali", seccionalId: "sec-cali" },
      { id: "lugar-bogota", nombre: "Bogotá", seccionalId: "sec-bogota" },
      { id: "lugar-medellin", nombre: "Medellín", seccionalId: "sec-medellin" },
      { id: "lugar-cartagena", nombre: "Cartagena", seccionalId: "sec-cartagena" },
    ];

    expect(getDefaultLugarBySeccional(seccionalId, lugares)).toBe(lugarId);
  });
});
