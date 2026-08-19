import { describe, expect, it } from "vitest";
import { isSecubRole, normalizeSecubRole } from "./roles";
import {
  canAccessModule,
  canStartAcademicPlan,
  canWriteEntity,
  getAcademicModulePermissions,
  shouldEnforceAcademicWorkflowLock,
  getAsignarRaPermissions,
  getCyclePermissions,
  getFilterPermissions,
  getRoleScopedProgramSelection,
} from "./permissions";

describe("SECUB - acceso centralizado", () => {
  it("acepta únicamente los cinco roles canónicos", () => {
    expect(isSecubRole("administrador")).toBe(true);
    expect(isSecubRole("vicerrector")).toBe(true);
    expect(isSecubRole("decano")).toBe(true);
    expect(isSecubRole("director")).toBe(true);
    expect(isSecubRole("docente")).toBe(true);

    expect(normalizeSecubRole("director")).toBe("director");
    expect(normalizeSecubRole("rol-obsoleto")).toBe("administrador");
    expect(normalizeSecubRole("Dirección de programa")).toBe("administrador");
  });

  it("centraliza permisos CRUD académicos y mantiene al Docente en solo lectura", () => {
    const director = getAcademicModulePermissions("competenciasRa", "director");
    const decano = getAcademicModulePermissions("competenciasRa", "decano");

    expect(director.canCreate).toBe(true);
    expect(director.canUpdate).toBe(true);
    expect(director.canDelete).toBe(true);
    expect(decano.canCreate).toBe(false);
    expect(decano.canUpdate).toBe(false);

    for (const module of ["perfilEgreso", "propositoFormacion", "competenciasRa"] as const) {
      const docente = getAcademicModulePermissions(module, "docente");

      expect(docente.canRead).toBe(true);
      expect(docente.canCreate).toBe(false);
      expect(docente.canUpdate).toBe(false);
      expect(docente.canDelete).toBe(false);
      expect(docente.canExportPdf).toBe(false);
      expect(docente.canExportExcel).toBe(false);
    }
  });

  it("limita los filtros académicos del Docente a Programa", () => {
    for (const module of ["perfilEgreso", "propositoFormacion", "competenciasRa"] as const) {
      const filters = getFilterPermissions(module, "docente");
      expect(filters.canFilterByPrograma).toBe(true);
      expect(filters.canFilterByFacultad).toBe(false);
      expect(filters.canFilterByLugar).toBe(false);
    }
  });

  it("mantiene el bloqueo secuencial para roles gestores, pero no para la consulta Docente", () => {
    expect(shouldEnforceAcademicWorkflowLock("docente")).toBe(false);
    expect(shouldEnforceAcademicWorkflowLock("director")).toBe(true);
  });

  it("mantiene Facultad oculta para Dirección en Competencias y RA", () => {
    expect(
      getAcademicModulePermissions("competenciasRa", "director").canFilterByFacultad,
    ).toBe(false);
  });

  it("mantiene Facultad exclusiva de Vicerrector en Mapeo de Competencias", () => {
    expect(getAcademicModulePermissions("mapeoCompetencias", "vicerrector").canFilterByFacultad).toBe(true);
    expect(getAcademicModulePermissions("mapeoCompetencias", "administrador").canFilterByFacultad).toBe(false);
    expect(getAcademicModulePermissions("mapeoCompetencias", "decano").canFilterByFacultad).toBe(false);
    expect(getAcademicModulePermissions("mapeoCompetencias", "director").canFilterByFacultad).toBe(false);
    expect(getAcademicModulePermissions("mapeoCompetencias", "docente").canFilterByFacultad).toBe(false);
    expect(getAcademicModulePermissions("mapeoCompetencias", "docente").canFilterByPrograma).toBe(true);
  });

  it("centraliza Ciclo y Asignar RA", () => {
    expect(getCyclePermissions("director").canCreateCycle).toBe(true);
    expect(getCyclePermissions("vicerrector").canCreateCycle).toBe(false);
    expect(getAsignarRaPermissions("director").canManage).toBe(true);
    expect(getAsignarRaPermissions("docente").canRead).toBe(false);
  });

  it("centraliza navegación y persistencia", () => {
    expect(canAccessModule("docente", "dashboard")).toBe(true);
    expect(canAccessModule("docente", "medicionRa")).toBe(true);
    expect(canAccessModule("docente", "perfilEgreso")).toBe(true);
    expect(canAccessModule("docente", "propositoFormacion")).toBe(true);
    expect(canAccessModule("docente", "competenciasRa")).toBe(true);
    expect(canAccessModule("docente", "mapeoCompetencias")).toBe(false);

    expect(canStartAcademicPlan("director")).toBe(true);
    expect(canStartAcademicPlan("administrador")).toBe(false);
    expect(canWriteEntity("director", "competenciasRa", "update")).toBe(true);
    expect(canWriteEntity("vicerrector", "competenciasRa", "update")).toBe(false);
    expect(canWriteEntity("docente", "medicionesRa", "upsert")).toBe(true);
    expect(canWriteEntity("docente", "medicionesRa", "delete")).toBe(false);
  });

  it("mantiene el alcance jerárquico del programa seleccionado", () => {
    const selectedScope = {
      seccionalId: "sec-1",
      facultadId: "fac-1",
      programaId: "prog-1",
      academicProgramId: "prog-1",
      planId: "plan-1",
    };

    expect(getRoleScopedProgramSelection("administrador", selectedScope)).toEqual({});
    expect(getRoleScopedProgramSelection("vicerrector", selectedScope)).toEqual({ seccionalId: "sec-1" });
    expect(getRoleScopedProgramSelection("decano", selectedScope)).toEqual({
      seccionalId: "sec-1",
      facultadId: "fac-1",
    });
    expect(getRoleScopedProgramSelection("director", selectedScope)).toEqual(selectedScope);
    expect(getRoleScopedProgramSelection("docente", selectedScope)).toEqual(selectedScope);
  });
});
