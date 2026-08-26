import { beforeEach, describe, expect, it } from "vitest";
import { readAcademicWorkflowProgress } from "../../components/panel/academicWorkflow.repository";
import {
  getCoursesByProgramPlan,
  getProgramById,
  secubFacultades,
  secubLugares,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
  SIMPLE_DEMO_IDS,
} from "../../data/secubAcademicPrograms";
import { readSelectedProgramId } from "../programSelection";
import { getActiveAcademicPlanInstance } from "./academicPlanState";
import {
  DEMO_SEED_STORAGE_KEY,
  DEMO_SEED_VERSION,
  ensureSimpleAcademicDemoData,
  LEGACY_ACADEMIC_DEMO_RECORD_IDS,
} from "./demoSeed";
import {
  mockBackend,
  type MockBackendEntityKey,
  type MockBackendRecord,
  type MockBackendUser,
} from "./mockBackend.service";

const ACTIVE_ACADEMIC_PLAN_KEY = "secub:active-academic-plan:v2";

const academicEntityKeys = Object.keys(
  LEGACY_ACADEMIC_DEMO_RECORD_IDS,
) as MockBackendEntityKey[];

describe("academic demo initialization", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("conserva la estructura académica y deja vacío todo el flujo del Director", () => {
    ensureSimpleAcademicDemoData();

    academicEntityKeys.forEach((entityKey) => {
      expect(mockBackend.list(entityKey)).toHaveLength(0);
    });
    expect(readAcademicWorkflowProgress()).toEqual({
      "perfil-egreso": false,
      "proposito-formacion": false,
      "competencias-ra": false,
      "mapeo-competencias": false,
      ciclo: false,
      "asignar-ra": false,
    });

    const program = getProgramById(readSelectedProgramId());
    const courses = getCoursesByProgramPlan(program?.id, program?.planId);

    expect(program?.id).toBe(SIMPLE_DEMO_IDS.programaId);
    expect(secubSeccionales.some((item) => item.id === program?.seccionalId)).toBe(true);
    expect(secubLugares.find((item) => item.id === program?.lugarId)?.nombre).toBe("Cali");
    expect(secubFacultades.some((item) => item.id === program?.facultyId)).toBe(true);
    expect(secubProgramas.some((item) => item.id === program?.id)).toBe(true);
    expect(secubPlanes.some((item) => item.id === program?.planId)).toBe(true);
    expect(courses.map((course) => course.name)).toEqual(
      expect.arrayContaining([
        "Fundamentos de Programación",
        "Programación Orientada a Objetos",
        "Diseño de Medios Digitales",
      ]),
    );
    expect(window.localStorage.getItem(DEMO_SEED_STORAGE_KEY)).toBe(
      DEMO_SEED_VERSION,
    );
  });

  it("elimina todos los IDs legacy sin borrar registros ajenos ni otras preferencias", () => {
    const customRecord: MockBackendRecord = {
      id: "perfil-creado-por-usuario",
      programaId: SIMPLE_DEMO_IDS.programaId,
      planId: SIMPLE_DEMO_IDS.planId,
    };

    mockBackend.seedDemoData({
      perfilEgreso: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.perfilEgreso[0] },
        customRecord,
      ],
      propositosFormacion: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.propositosFormacion[0] },
      ],
      competenciasRa: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.competenciasRa[0] },
      ],
      mapeosCompetencias: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.mapeosCompetencias[0] },
      ],
      ciclosMedicion: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.ciclosMedicion[0] },
      ],
      asignacionesRa: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.asignacionesRa[0] },
      ],
      medicionesRa: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.medicionesRa[0] },
      ],
      planesMejora: [
        { id: LEGACY_ACADEMIC_DEMO_RECORD_IDS.planesMejora[0] },
      ],
    });
    window.localStorage.setItem(DEMO_SEED_STORAGE_KEY, "version-anterior");
    window.localStorage.setItem("secub:preferencia-no-relacionada", "conservar");
    window.localStorage.setItem(
      ACTIVE_ACADEMIC_PLAN_KEY,
      JSON.stringify({
        id: "academic-plan-empty-default",
        title: "Plan académico actual",
        status: "completed",
        createdAt: "2026-01-15T14:00:00.000Z",
      }),
    );

    ensureSimpleAcademicDemoData();

    (
      Object.entries(LEGACY_ACADEMIC_DEMO_RECORD_IDS) as Array<
        [MockBackendEntityKey, readonly string[]]
      >
    ).forEach(([entityKey, recordIds]) => {
      recordIds.forEach((recordId) => {
        expect(mockBackend.getById(entityKey, recordId)).toBeNull();
      });
    });
    expect(mockBackend.getById("perfilEgreso", customRecord.id)).toEqual(
      customRecord,
    );
    expect(getActiveAcademicPlanInstance().status).toBe("inProgress");
    expect(window.localStorage.getItem("secub:preferencia-no-relacionada")).toBe(
      "conservar",
    );
  });

  it("conserva después de una recarga los registros guardados por el Director", () => {
    ensureSimpleAcademicDemoData();

    const director: MockBackendUser = {
      id: "usr-director",
      role: "director",
      scope: {
        seccionalId: SIMPLE_DEMO_IDS.seccionalId,
        facultadId: SIMPLE_DEMO_IDS.facultadId,
        programaId: SIMPLE_DEMO_IDS.programaId,
        planId: SIMPLE_DEMO_IDS.planId,
      },
    };
    const savedProfile = {
      id: "perfil-creado-manualmente",
      seccionalId: SIMPLE_DEMO_IDS.seccionalId,
      lugarId: SIMPLE_DEMO_IDS.lugarId,
      facultadId: SIMPLE_DEMO_IDS.facultadId,
      programaId: SIMPLE_DEMO_IDS.programaId,
      planId: SIMPLE_DEMO_IDS.planId,
      estado: "activo",
      descripcion: "Perfil escrito por el Director.",
    };

    mockBackend.create("perfilEgreso", savedProfile, director);
    ensureSimpleAcademicDemoData();

    expect(mockBackend.getById("perfilEgreso", savedProfile.id, director)).toMatchObject(
      savedProfile,
    );
  });
});
