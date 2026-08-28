import { describe, expect, it } from "vitest";
import {
  ACADEMIC_ACTION_MODULES,
  canDuplicateCycle,
  canEditAcademicRecord,
  canManageCycle,
  canManageMapeo,
  getAcademicModulePermissions,
  getCyclePermissions,
} from "./permissions";
import {
  DEFAULT_SECUB_ROLE,
  SECUB_ROLE_ORDER,
  normalizeSecubRole,
  type SecubRole,
} from "./roles";

const NON_DIRECTOR_ROLES = SECUB_ROLE_ORDER.filter((r) => r !== "director");

describe("normalizeSecubRole", () => {
  it("passes the five canonical roles through unchanged", () => {
    for (const role of SECUB_ROLE_ORDER) {
      expect(normalizeSecubRole(role)).toBe(role);
    }
  });

  it("is case-insensitive and trims", () => {
    expect(normalizeSecubRole("  Director ")).toBe("director");
    expect(normalizeSecubRole("ADMINISTRADOR")).toBe("administrador");
  });

  it("falls back to the default role for unknown, empty, or nullish input", () => {
    expect(normalizeSecubRole(null)).toBe(DEFAULT_SECUB_ROLE);
    expect(normalizeSecubRole(undefined)).toBe(DEFAULT_SECUB_ROLE);
    expect(normalizeSecubRole("")).toBe(DEFAULT_SECUB_ROLE);
    expect(normalizeSecubRole("superadmin")).toBe(DEFAULT_SECUB_ROLE);
    expect(normalizeSecubRole("'; DROP TABLE users; --")).toBe(DEFAULT_SECUB_ROLE);
  });

  it("honours an explicit fallback", () => {
    expect(normalizeSecubRole("nope", "docente")).toBe("docente");
  });
});

describe("academic module permissions", () => {
  it("grants write actions only to director", () => {
    for (const module of ACADEMIC_ACTION_MODULES) {
      const director = getAcademicModulePermissions(module, "director");
      expect(director.canCreate).toBe(true);
      expect(director.canUpdate).toBe(true);
      expect(director.canDelete).toBe(true);

      for (const role of NON_DIRECTOR_ROLES) {
        const p = getAcademicModulePermissions(module, role);
        expect(p.canCreate, `${module}/${role} canCreate`).toBe(false);
        expect(p.canUpdate, `${module}/${role} canUpdate`).toBe(false);
        expect(p.canDelete, `${module}/${role} canDelete`).toBe(false);
      }
    }
  });

  it("gives docente no access at all to mapeoCompetencias", () => {
    const p = getAcademicModulePermissions("mapeoCompetencias", "docente");
    expect(p.canRead).toBe(false);
    expect(p.canCreate).toBe(false);
  });

  it("lets non-director roles read the other academic modules", () => {
    for (const module of ACADEMIC_ACTION_MODULES.filter((m) => m !== "mapeoCompetencias")) {
      for (const role of NON_DIRECTOR_ROLES) {
        expect(getAcademicModulePermissions(module, role).canRead).toBe(true);
      }
    }
  });

  it("is defined for every module x role pair", () => {
    for (const module of ACADEMIC_ACTION_MODULES) {
      for (const role of SECUB_ROLE_ORDER) {
        expect(getAcademicModulePermissions(module, role)).toBeDefined();
      }
    }
  });
});

describe("canEditAcademicRecord", () => {
  it("allows director to edit an active record", () => {
    expect(canEditAcademicRecord("perfilEgreso", "director", "activo")).toBe(true);
  });

  it("blocks editing an inactive record even for director", () => {
    expect(canEditAcademicRecord("perfilEgreso", "director", "inactivo")).toBe(false);
  });

  it("blocks editing for any non-director role regardless of estado", () => {
    for (const role of NON_DIRECTOR_ROLES) {
      expect(canEditAcademicRecord("perfilEgreso", role, "activo")).toBe(false);
    }
  });
});

describe("canManageMapeo", () => {
  it("is true only for director with an active programa", () => {
    expect(canManageMapeo("director", "activo")).toBe(true);
    expect(canManageMapeo("director", "inactivo")).toBe(false);
    expect(canManageMapeo("director", undefined)).toBe(false);
    for (const role of NON_DIRECTOR_ROLES) {
      expect(canManageMapeo(role, "activo")).toBe(false);
    }
  });
});

describe("cycle permissions", () => {
  it("grants cycle management only to director", () => {
    const director = getCyclePermissions("director");
    expect(director.canCreateCycle).toBe(true);
    expect(director.canEditCycle).toBe(true);
    expect(director.canDeleteCycle).toBe(true);

    for (const role of NON_DIRECTOR_ROLES) {
      const p = getCyclePermissions(role);
      expect(p.canCreateCycle, `${role}`).toBe(false);
      expect(p.canEditCycle, `${role}`).toBe(false);
      expect(p.canDeleteCycle, `${role}`).toBe(false);
    }
  });

  it("denies docente even the read-only summary", () => {
    expect(getCyclePermissions("docente").canReadSummary).toBe(false);
  });

  it("scopes director cycle management to their own programa and an active plan", () => {
    const director = { role: "director" as SecubRole, scope: { programaId: "prog-1" } };
    const own = { programaId: "prog-1", estado: "activo" as const, planEstado: "activo" as const };
    const foreign = { ...own, programaId: "prog-2" };
    const inactivePlan = { ...own, planEstado: "inactivo" as const };
    const finalized = { ...own, estado: "finalizado" as const };

    expect(canManageCycle(director, own)).toBe(true);
    expect(canManageCycle(director, foreign)).toBe(false);
    expect(canManageCycle(director, inactivePlan)).toBe(false);
    expect(canManageCycle(director, finalized)).toBe(false);
  });

  it("only allows duplicating finalized cycles, scoped to the director's programa", () => {
    const director = { role: "director" as SecubRole, scope: { programaId: "prog-1" } };
    const finalizedOwn = {
      programaId: "prog-1",
      estado: "finalizado" as const,
      planEstado: "activo" as const,
    };
    expect(canDuplicateCycle(director, finalizedOwn)).toBe(true);
    expect(canDuplicateCycle(director, { ...finalizedOwn, estado: "activo" })).toBe(false);
    expect(canDuplicateCycle(director, { ...finalizedOwn, programaId: "prog-2" })).toBe(false);
  });
});
