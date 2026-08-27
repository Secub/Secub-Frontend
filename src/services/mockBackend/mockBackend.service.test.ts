import { beforeEach, describe, expect, it } from "vitest";
import {
  mockBackend,
  type MockBackendRecord,
  type MockBackendUser,
} from "./mockBackend.service";

describe("mockBackend upsert for mapeosCompetencias", () => {
  beforeEach(() => {
    mockBackend.clearDemoData();
  });

  it("mantiene una sola instancia por programa y plan al guardar varias veces", () => {
    const user: MockBackendUser = {
      id: "user-1",
      role: "director",
      scope: { seccionalId: "sec-1", facultadId: "fac-1", programaId: "prog-1", planId: "plan-1" },
    };

    interface MapeoTestRecord extends MockBackendRecord {
      descripcion: string;
      lugarId: string;
      estado: "activo";
      competenciaRaIds: string[];
      semestresClasificados: unknown[];
      nivelesCompromiso: unknown[];
      cursosMapeados: unknown[];
    }

    const initialRecord: MapeoTestRecord = {
      id: "mapeo-legacy-id",
      programaId: "prog-1",
      planId: "plan-1",
      seccionalId: "sec-1",
      facultadId: "fac-1",
      lugarId: "lugar-1",
      estado: "activo",
      descripcion: "Mapa inicial",
      competenciaRaIds: [],
      semestresClasificados: [],
      nivelesCompromiso: [],
      cursosMapeados: [],
    };

    mockBackend.create("mapeosCompetencias", initialRecord, user);

    mockBackend.upsert<MapeoTestRecord>("mapeosCompetencias", {
      id: "mapeo-nuevo-id",
      programaId: "prog-1",
      planId: "plan-1",
      seccionalId: "sec-1",
      facultadId: "fac-1",
      lugarId: "lugar-1",
      estado: "activo",
      descripcion: "Mapa actualizado",
      competenciaRaIds: [],
      semestresClasificados: [],
      nivelesCompromiso: [],
      cursosMapeados: [],
    }, user);

    const records = mockBackend.list<MapeoTestRecord>("mapeosCompetencias", user);

    expect(records).toHaveLength(1);
    expect(records[0].descripcion).toBe("Mapa actualizado");
  });
  it("rechaza escrituras académicas de roles de consulta", () => {
    const adminUser: MockBackendUser = { id: "admin-1", role: "administrador", scope: {} };

    expect(() =>
      mockBackend.create(
        "perfilEgreso",
        { id: "perfil-no-autorizado", descripcion: "No debe guardarse" },
        adminUser,
      ),
    ).toThrow("La operación solicitada no está disponible");
  });

  it("rechaza descripciones superiores a 150 caracteres antes de persistir", () => {
    const directorUser: MockBackendUser = {
      id: "director-1",
      role: "director",
      scope: { programaId: "prog-1", planId: "plan-1" },
    };

    expect(() =>
      mockBackend.create(
        "perfilEgreso",
        {
          id: "perfil-descripcion-larga",
          programaId: "prog-1",
          planId: "plan-1",
          descripcion: "a".repeat(151),
        },
        directorUser,
      ),
    ).toThrow("La descripción no puede superar los 150 caracteres.");
  });

});
