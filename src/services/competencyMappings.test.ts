import { beforeEach, describe, expect, it, vi } from "vitest";
import { httpClient } from "../infrastructure/api";
import { listCompetencyMappings, saveCompetencyMapping } from "./competencyMappings";
import { canAssignNucleo, readNucleosFromRecord } from "../pages/panel/mapeo-competencias/MapeoCompetencias.semestres";

vi.mock("../infrastructure/api", () => ({ httpClient: { get: vi.fn(), put: vi.fn() } }));

function apiRecord() {
  return {
    id: "mapping",
    semestresClasificados: [
      { semestreId: "s1", semestreNumero: 1, nucleo: "fundamentacion" },
      { semestreId: "s2", semestreNumero: 2, nucleo: "profesional" },
      { semestreId: "s3", semestreNumero: 3, nucleo: "sintesis" },
      { semestreId: "s4", semestreNumero: 4, nucleo: null },
    ],
    nivelesCompromiso: [{ cursoId: "course", competenciaId: "competency", nucleo: "profesional", nivelCompromiso: "refuerza" }],
    cursosMapeados: [{ cursoId: "course", nucleo: "profesional" }],
  };
}

describe("competency mapping API nuclei", () => {
  beforeEach(() => vi.resetAllMocks());

  it("loads saved professional semesters as editable UI nuclei", async () => {
    vi.mocked(httpClient.get).mockResolvedValue([apiRecord()]);
    const [record] = await listCompetencyMappings();
    expect(record.semestresClasificados[1].nucleo).toBe("profesional");
    expect(record.nivelesCompromiso[0].nucleo).toBe("profesional");
    expect(record.cursosMapeados[0].nucleo).toBe("profesional");
    expect(canAssignNucleo(readNucleosFromRecord(record, 4), 2, "profesional")).toBe(true);
  });

  it.each([false, true])("sends API nuclei and preserves the response for finalizar=%s", async (finalizar) => {
    vi.mocked(httpClient.get).mockResolvedValue([apiRecord()]);
    vi.mocked(httpClient.put).mockResolvedValue(apiRecord());
    const [loaded] = await listCompetencyMappings();
    const saved = await saveCompetencyMapping("plan", {
      semestresClasificados: loaded.semestresClasificados,
      nivelesCompromiso: loaded.nivelesCompromiso,
      finalizar,
    });
    expect(httpClient.put).toHaveBeenCalledWith("/competency-mappings/plan", {
      semestresClasificados: apiRecord().semestresClasificados,
      nivelesCompromiso: apiRecord().nivelesCompromiso,
      finalizar,
    });
    expect(saved).toEqual(loaded);
  });
});
