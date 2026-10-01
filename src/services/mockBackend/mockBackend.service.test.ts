import { beforeEach, describe, expect, it } from "vitest";
import { mockBackend } from "./mockBackend.service";
import type { MockBackendRecord, MockBackendUser } from "./mockBackend.service";

const activePlanId = "academic-plan-current";
const currentUser: MockBackendUser = {
  id: "director-1",
  role: "director",
  scope: { programaId: "programa-1", planId: "plan-1" },
};

function mapeoRecord(id: string, academicPlanInstanceId: string): MockBackendRecord {
  return {
    id,
    academicPlanInstanceId,
    programaId: "programa-1",
    planId: "plan-1",
  };
}

function cicloRecord(
  id: string,
  academicPlanInstanceId: string,
): MockBackendRecord & { estado: string } {
  return {
    id,
    academicPlanInstanceId,
    programaId: "programa-1",
    planId: "plan-1",
    estado: "finalizado",
  };
}

function setActivePlan() {
  localStorage.setItem(
    "secub:active-academic-plan:v2",
    JSON.stringify({
      id: activePlanId,
      title: "Plan académico actual",
      status: "inProgress",
      createdAt: "2026-01-01T00:00:00.000Z",
    }),
  );
}

describe("mockBackend mapeo upsert", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePlan();
  });

  it("creates a current-plan mapeo instead of updating a matching archived one", () => {
    localStorage.setItem(
      "secub:mock-backend:v2",
      JSON.stringify({
        mapeosCompetencias: [mapeoRecord("mapeo-archived", "academic-plan-archived")],
      }),
    );

    expect(() =>
      mockBackend.upsert(
        "mapeosCompetencias",
        mapeoRecord("mapeo-current", activePlanId),
        currentUser,
      ),
    ).not.toThrow();

    expect(mockBackend.list("mapeosCompetencias", currentUser).map(({ id }) => id)).toEqual([
      "mapeo-current",
    ]);
  });

  it("updates the matching mapeo in the active academic plan", () => {
    localStorage.setItem(
      "secub:mock-backend:v2",
      JSON.stringify({
        mapeosCompetencias: [mapeoRecord("mapeo-current", activePlanId)],
      }),
    );

    mockBackend.upsert(
      "mapeosCompetencias",
      { ...mapeoRecord("mapeo-next-id", activePlanId), descripcion: "Actualizado" },
      currentUser,
    );

    expect(mockBackend.list("mapeosCompetencias", currentUser)).toMatchObject([
      { id: "mapeo-current", descripcion: "Actualizado" },
    ]);
  });
});

describe("mockBackend cycle history", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePlan();
  });

  it("includes finalized cycles from archived plans without changing the active-plan list", () => {
    localStorage.setItem(
      "secub:mock-backend:v2",
      JSON.stringify({
        ciclosMedicion: [
          cicloRecord("cycle-current", activePlanId),
          cicloRecord("cycle-archived", "academic-plan-archived"),
        ],
      }),
    );

    expect(mockBackend.list("ciclosMedicion", currentUser).map(({ id }) => id)).toEqual([
      "cycle-current",
    ]);
    expect(mockBackend.listCycleHistory(currentUser).map(({ id }) => id)).toEqual([
      "cycle-current",
      "cycle-archived",
    ]);
  });
});