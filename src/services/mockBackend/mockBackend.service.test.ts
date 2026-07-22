import { beforeEach, describe, expect, it } from "vitest";
import { mockBackend } from "./mockBackend.service";

describe("mockBackend upsert for mapeosCompetencias", () => {
  beforeEach(() => {
    mockBackend.clearDemoData();
  });

  it("mantiene una sola instancia por programa y plan al guardar varias veces", () => {
    const user = {
      id: "user-1",
      role: "direccionPrograma",
      scope: { seccionalId: "sec-1", facultadId: "fac-1", programaId: "prog-1", planId: "plan-1" },
    };

    const initialRecord = {
      id: "mapeo-legacy-id",
      programaId: "prog-1",
      planId: "plan-1",
      seccionalId: "sec-1",
      facultadId: "fac-1",
      lugarId: "lugar-1",
      estado: "activo" as const,
      descripcion: "Mapa inicial",
      competenciaRaIds: [],
      semestresClasificados: [],
      nivelesCompromiso: [],
      cursosMapeados: [],
    };

    mockBackend.create("mapeosCompetencias", initialRecord as never, user as never);

    mockBackend.upsert("mapeosCompetencias", {
      id: "mapeo-nuevo-id",
      programaId: "prog-1",
      planId: "plan-1",
      seccionalId: "sec-1",
      facultadId: "fac-1",
      lugarId: "lugar-1",
      estado: "activo" as const,
      descripcion: "Mapa actualizado",
      competenciaRaIds: [],
      semestresClasificados: [],
      nivelesCompromiso: [],
      cursosMapeados: [],
    } as never, user as never);

    const records = mockBackend.list("mapeosCompetencias", user as never) as Array<{ descripcion?: string }>;

    expect(records).toHaveLength(1);
    expect(records[0].descripcion).toBe("Mapa actualizado");
  });
  it("rechaza escrituras académicas de roles de consulta", () => {
    const adminUser = { id: "admin-1", role: "admin", scope: {} };

    expect(() =>
      mockBackend.create(
        "perfilEgreso",
        { id: "perfil-no-autorizado", descripcion: "No debe guardarse" } as never,
        adminUser as never,
      ),
    ).toThrow("La operación solicitada no está disponible");
  });

});
