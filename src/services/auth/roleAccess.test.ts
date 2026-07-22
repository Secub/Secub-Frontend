import { describe, expect, it } from "vitest";
import {
  canAccessPanelModule,
  canStartNewAcademicPlan,
  canWriteSecubEntity,
  getRoleScopedProgramSelection,
} from "./roleAccess";

describe("roleAccess", () => {
  it("limita Docencia a Dashboard, ajustes, accesibilidad y Medición RA", () => {
    expect(canAccessPanelModule("docente", "dashboard")).toBe(true);
    expect(canAccessPanelModule("docente", "medicionRa")).toBe(true);
    expect(canAccessPanelModule("docente", "perfilEgreso")).toBe(false);
    expect(canAccessPanelModule("docente", "mapeoCompetencias")).toBe(false);
    expect(canAccessPanelModule("docente", "asignarRa")).toBe(false);
  });

  it("permite que solo Dirección de programa inicie planes y gestione el flujo", () => {
    expect(canStartNewAcademicPlan("direccionPrograma")).toBe(true);
    expect(canStartNewAcademicPlan("admin")).toBe(false);
    expect(canStartNewAcademicPlan("vice")).toBe(false);
    expect(canStartNewAcademicPlan("decano")).toBe(false);

    expect(canWriteSecubEntity("direccionPrograma", "perfilEgreso", "create")).toBe(true);
    expect(canWriteSecubEntity("admin", "perfilEgreso", "create")).toBe(false);
    expect(canWriteSecubEntity("vice", "ciclosMedicion", "update")).toBe(false);
    expect(canWriteSecubEntity("decano", "asignacionesRa", "delete")).toBe(false);
  });

  it("reserva las mediciones para Docencia y la limpieza relacionada para Dirección", () => {
    expect(canWriteSecubEntity("docente", "medicionesRa", "upsert")).toBe(true);
    expect(canWriteSecubEntity("docente", "medicionesRa", "delete")).toBe(false);
    expect(canWriteSecubEntity("direccionPrograma", "medicionesRa", "delete")).toBe(true);
    expect(canWriteSecubEntity("direccionPrograma", "medicionesRa", "update")).toBe(false);
  });

  it("mantiene el alcance jerárquico al seleccionar un programa", () => {
    const selectedScope = {
      seccionalId: "sec-1",
      facultadId: "fac-1",
      programaId: "prog-1",
      academicProgramId: "prog-1",
      planId: "plan-1",
    };

    expect(getRoleScopedProgramSelection("admin", selectedScope)).toEqual({});
    expect(getRoleScopedProgramSelection("vice", selectedScope)).toEqual({ seccionalId: "sec-1" });
    expect(getRoleScopedProgramSelection("decano", selectedScope)).toEqual({
      seccionalId: "sec-1",
      facultadId: "fac-1",
    });
    expect(getRoleScopedProgramSelection("direccionPrograma", selectedScope)).toEqual(selectedScope);
  });
});
