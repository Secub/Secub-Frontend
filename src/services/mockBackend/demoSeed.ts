import { SIMPLE_DEMO_IDS } from "../../data/secubAcademicPrograms";
import { storageClient } from "../../shared/browser";
import { readSelectedProgramId, persistSelectedProgramId } from "../programSelection";
import { resetCompletedDefaultAcademicPlan } from "./academicPlanState";
import { mockBackend, type MockBackendEntityKey } from "./mockBackend.service";

export const DEMO_SEED_STORAGE_KEY = "secub:simple-academic-demo-seed:v1";
export const DEMO_SEED_VERSION = "2026-08-26-empty-academic-workflow";

export const LEGACY_ACADEMIC_DEMO_RECORD_IDS = {
  perfilEgreso: ["perfil-egreso-demo-001"],
  propositosFormacion: ["proposito-formacion-demo-001"],
  competenciasRa: ["competencia-demo-001"],
  mapeosCompetencias: ["mapeo-demo-001"],
  ciclosMedicion: ["ciclo-demo-2026"],
  asignacionesRa: [
    "asignacion-ciclo-demo-2026-curso-diseno-medios-digitales-competencia-demo-001-ra-demo-001",
  ],
  medicionesRa: [
    "medicion-ra-demo-state-docente-secub-ciclo-demo-2026-curso-diseno-medios-digitales",
  ],
  planesMejora: ["plan-mejora-ciclo-demo-2026"],
} as const satisfies Partial<Record<MockBackendEntityKey, readonly string[]>>;


export function ensureSimpleAcademicDemoData() {
  if (typeof window === "undefined") return;

  if (!readSelectedProgramId()) {
    persistSelectedProgramId(SIMPLE_DEMO_IDS.programaId);
  }

  const installedSeedVersion = storageClient.get(DEMO_SEED_STORAGE_KEY);
  if (installedSeedVersion === DEMO_SEED_VERSION) return;

  const removedLegacyAcademicData = mockBackend.removeDemoSeedRecords(
    LEGACY_ACADEMIC_DEMO_RECORD_IDS,
  );

  if (removedLegacyAcademicData || Boolean(installedSeedVersion)) {
    resetCompletedDefaultAcademicPlan();
  }

  storageClient.set(DEMO_SEED_STORAGE_KEY, DEMO_SEED_VERSION);
}
