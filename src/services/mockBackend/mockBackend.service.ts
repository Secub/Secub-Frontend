import {
  getActiveAcademicPlanInstanceId,
  isRecordFromActiveAcademicPlan,
  markActiveAcademicPlanInProgress,
  resetAcademicPlanState,
} from "./academicPlanState";
import { DEMO_DOCENTE_SECUB, LEGACY_DEMO_DOCENTE_IDS } from "../auth/mockUser";
import type { SecubRole } from "../../config/access/roles";
import {
  canWriteEntity,
  getWriteAccessDeniedMessage,
  type SecubWriteAction,
} from "../../config/access/permissions";
import { MAX_RA_PER_COMPETENCIA } from "../../utils/learningResultsRules";
import { DESCRIPTION_MAX_LENGTH_MESSAGE, isDescriptionLengthValid } from "../../utils/descriptionValidation";
import { storageClient } from "../../shared/browser";

export type MockBackendEntityKey =
  | "perfilEgreso"
  | "propositosFormacion"
  | "competenciasRa"
  | "mapeosCompetencias"
  | "ciclosMedicion"
  | "asignacionesRa"
  | "medicionesRa"
  | "planesMejora";

export interface MockBackendRecord {
  id: string;
  userId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
  academicPlanInstanceId?: string;
  inheritedFromAcademicPlanInstanceId?: string;
  inheritedFromRecordId?: string;
  isInheritedAcademicBase?: boolean;
  readonlyInherited?: boolean;
  cicloId?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface MockUserScope {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  academicProgramId?: string;
  planId?: string;
}

export interface MockBackendUser {
  id: string;
  role: SecubRole;
  scope?: MockUserScope;
}

const MOCK_BACKEND_ROOT_KEY = "secub:mock-backend:v2";
const DEMO_INTRO_ROOT_KEY = "secub:demo-intro-flags:v2";

const DEFAULT_COLLECTIONS: Record<MockBackendEntityKey, MockBackendRecord[]> = {
  perfilEgreso: [],
  propositosFormacion: [],
  competenciasRa: [],
  mapeosCompetencias: [],
  ciclosMedicion: [],
  asignacionesRa: [],
  medicionesRa: [],
  planesMejora: [],
};

const legacyDemoDocenteIds = new Set<string>(LEGACY_DEMO_DOCENTE_IDS);

type MockBackendDatabase = typeof DEFAULT_COLLECTIONS;

type IntroFlags = Record<string, boolean>;

function canUseLocalStorage() {
  return storageClient.isAvailable();
}

function readDatabase(): MockBackendDatabase {
  if (!canUseLocalStorage()) {
    return { ...DEFAULT_COLLECTIONS };
  }

  try {
    const rawDatabase = storageClient.get(MOCK_BACKEND_ROOT_KEY);
    if (!rawDatabase) return { ...DEFAULT_COLLECTIONS };

    const parsed = JSON.parse(rawDatabase) as Partial<MockBackendDatabase>;

    return {
      ...DEFAULT_COLLECTIONS,
      ...parsed,
    };
  } catch {
    return { ...DEFAULT_COLLECTIONS };
  }
}

function writeDatabase(database: MockBackendDatabase) {
  if (!canUseLocalStorage()) return;

  storageClient.set(MOCK_BACKEND_ROOT_KEY, JSON.stringify(database));
  window.dispatchEvent(new CustomEvent("secub:mock-backend-updated"));
}

function isAdminLike(user?: MockBackendUser | null) {
  return user?.role === "administrador";
}

function isAcademicWorkflowEntity(entityKey: MockBackendEntityKey) {
  return (
    entityKey === "perfilEgreso" ||
    entityKey === "propositosFormacion" ||
    entityKey === "competenciasRa" ||
    entityKey === "mapeosCompetencias" ||
    entityKey === "ciclosMedicion" ||
    entityKey === "asignacionesRa"
  );
}

function isVisibleForUser<T extends MockBackendRecord>(
  entityKey: MockBackendEntityKey,
  record: T,
  user?: MockBackendUser | null,
) {
  if (isAcademicWorkflowEntity(entityKey) && !isRecordFromActiveAcademicPlan(record)) {
    return false;
  }

  if (!user || isAdminLike(user)) return true;

  const scope = user.scope ?? {};

  // En modo demo, la Medición RA conserva progreso por usuario/ciclo/asignación.
  // TODO: cuando exista backend, reemplazar esta regla por permisos reales del servicio.
  if (
    entityKey === "medicionesRa" &&
    user.role === "docente" &&
    record.userId &&
    record.userId !== user.id
  ) {
    const isCurrentDocenteSecubDemo = user.role === "docente" && user.id === DEMO_DOCENTE_SECUB.id;
    const isLegacyDocenteMeasurement = legacyDemoDocenteIds.has(record.userId);

    if (!isCurrentDocenteSecubDemo || !isLegacyDocenteMeasurement) return false;
  }

  if (scope.seccionalId && record.seccionalId && record.seccionalId !== scope.seccionalId) {
    return false;
  }

  if (scope.facultadId && record.facultadId && record.facultadId !== scope.facultadId) {
    return false;
  }

  const userProgramId = scope.programaId ?? scope.academicProgramId;
  const recordProgramId = record.programaId ?? record.academicProgramId;

  if (userProgramId && recordProgramId && recordProgramId !== userProgramId) {
    return false;
  }

  if (scope.planId && record.planId && record.planId !== scope.planId) {
    return false;
  }

  return true;
}


function assertAuthorizedWrite(
  entityKey: MockBackendEntityKey,
  action: SecubWriteAction,
  user?: MockBackendUser | null,
) {
  if (!user || !canWriteEntity(user.role, entityKey, action)) {
    throw new Error(getWriteAccessDeniedMessage(entityKey));
  }
}

function assertRecordWithinUserScope(
  record: MockBackendRecord,
  user?: MockBackendUser | null,
) {
  if (!user) throw new Error("No fue posible validar el usuario actual.");

  const scope = user.scope ?? {};
  const recordProgramId = record.programaId ?? record.academicProgramId;
  const userProgramId = scope.programaId ?? scope.academicProgramId;

  if (scope.seccionalId && record.seccionalId && record.seccionalId !== scope.seccionalId) {
    throw new Error("La operación solicitada no está disponible para este registro.");
  }

  if (scope.facultadId && record.facultadId && record.facultadId !== scope.facultadId) {
    throw new Error("La operación solicitada no está disponible para este registro.");
  }

  if (userProgramId && recordProgramId && recordProgramId !== userProgramId) {
    throw new Error("La operación solicitada no está disponible para este registro.");
  }

  if (scope.planId && record.planId && record.planId !== scope.planId) {
    throw new Error("La operación solicitada no está disponible para este registro.");
  }

  if (user.role === "docente" && record.userId && record.userId !== user.id) {
    throw new Error("La operación solicitada no está disponible para este registro.");
  }
}

function assertExistingRecordCanBeModified(
  entityKey: MockBackendEntityKey,
  record: MockBackendRecord | undefined,
  user?: MockBackendUser | null,
) {
  if (!record || record.deletedAt) {
    throw new Error("El registro que intentas modificar no existe.");
  }

  if (!isVisibleForUser(entityKey, record, user)) {
    throw new Error("No tienes acceso al registro solicitado.");
  }

  if (record.readonlyInherited || record.isInheritedAcademicBase) {
    throw new Error("La información heredada es de solo lectura.");
  }

  assertRecordWithinUserScope(record, user);
}

function assertValidRecordForWrite<T extends MockBackendRecord>(
  entityKey: MockBackendEntityKey,
  record: T,
) {
  const validateDescriptions = (value: unknown): void => {
    if (!value || typeof value !== "object") return;

    Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
      if (
        /^(descripcion|description)$/i.test(key) &&
        typeof nestedValue === "string" &&
        !isDescriptionLengthValid(nestedValue)
      ) {
        throw new Error(DESCRIPTION_MAX_LENGTH_MESSAGE);
      }

      if (nestedValue && typeof nestedValue === "object") validateDescriptions(nestedValue);
    });
  };

  validateDescriptions(record);

  if (entityKey !== "competenciasRa") return;

  const maybeCompetencia = record as T & { resultadosAprendizaje?: unknown[] };
  const raCount = Array.isArray(maybeCompetencia.resultadosAprendizaje)
    ? maybeCompetencia.resultadosAprendizaje.length
    : 0;

  if (raCount > MAX_RA_PER_COMPETENCIA) {
    throw new Error("Ya alcanzaste el máximo de 4 resultados de aprendizaje permitidos.");
  }
}

function decorateRecord<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, record: T, user?: MockBackendUser | null): T {
  const now = new Date().toISOString();
  const scope = user?.scope ?? {};

  if (isAcademicWorkflowEntity(entityKey) && !record.isInheritedAcademicBase) {
    markActiveAcademicPlanInProgress();
  }

  return {
    ...record,
    academicPlanInstanceId: isAcademicWorkflowEntity(entityKey)
      ? record.academicPlanInstanceId ?? getActiveAcademicPlanInstanceId()
      : record.academicPlanInstanceId,
    userId: record.userId ?? user?.id,
    seccionalId: record.seccionalId ?? scope.seccionalId,
    facultadId: record.facultadId ?? scope.facultadId,
    programaId: record.programaId ?? scope.programaId ?? scope.academicProgramId,
    academicProgramId: record.academicProgramId ?? scope.academicProgramId ?? scope.programaId,
    planId: record.planId ?? scope.planId,
    createdAt: record.createdAt ?? now,
    updatedAt: now,
  };
}

function shouldDeleteRelatedToCompetencia(record: MockBackendRecord, competenciaId: string, resultadoAprendizajeIds: string[]) {
  const relatedRecord = record as MockBackendRecord & {
    competenciaRaId?: string;
    competenciaRaIds?: string[];
    resultadoAprendizajeId?: string;
    resultadoAprendizajeIds?: string[];
  };
  const raIds = new Set(resultadoAprendizajeIds);

  return (
    relatedRecord.competenciaRaId === competenciaId ||
    Boolean(relatedRecord.competenciaRaIds?.includes(competenciaId)) ||
    Boolean(relatedRecord.resultadoAprendizajeId && raIds.has(relatedRecord.resultadoAprendizajeId)) ||
    Boolean(relatedRecord.resultadoAprendizajeIds?.some((id) => raIds.has(id)))
  );
}

function cascadeDeleteCompetenciaRelations(database: MockBackendDatabase, competenciaId: string, now: string) {
  const competencia = (database.competenciasRa ?? []).find(
    (record) => record.id === competenciaId,
  );
  const resultadosAprendizaje =
    competencia &&
    "resultadosAprendizaje" in competencia &&
    Array.isArray(competencia.resultadosAprendizaje)
      ? competencia.resultadosAprendizaje
      : [];
  const resultadoAprendizajeIds = resultadosAprendizaje
    .map((resultado) => {
      if (typeof resultado !== "object" || resultado === null || !("id" in resultado)) {
        return undefined;
      }

      return typeof resultado.id === "string" ? resultado.id : undefined;
    })
    .filter((id): id is string => Boolean(id));

  const markRelatedAsDeleted = (records: MockBackendRecord[]) =>
    records.map((record) =>
      shouldDeleteRelatedToCompetencia(record, competenciaId, resultadoAprendizajeIds)
        ? { ...record, deletedAt: record.deletedAt ?? now, updatedAt: now }
        : record,
    );

  return {
    ...database,
    // En modo demo se hace limpieza defensiva para no dejar mapeos/asignaciones/mediciones
    // apuntando a una competencia o RA eliminado. TODO: reemplazar por reglas de integridad
    // referencial del backend cuando exista CRUD real.
    mapeosCompetencias: markRelatedAsDeleted(database.mapeosCompetencias),
    asignacionesRa: markRelatedAsDeleted(database.asignacionesRa),
    medicionesRa: markRelatedAsDeleted(database.medicionesRa),
  };
}

function readIntroFlags(): IntroFlags {
  if (!canUseLocalStorage()) return {};

  try {
    return JSON.parse(storageClient.get(DEMO_INTRO_ROOT_KEY) ?? "{}") as IntroFlags;
  } catch {
    return {};
  }
}

function writeIntroFlags(flags: IntroFlags) {
  if (!canUseLocalStorage()) return;
  storageClient.set(DEMO_INTRO_ROOT_KEY, JSON.stringify(flags));
}

function getIntroKey(userId: string, moduleKey: string) {
  return `${userId}:${moduleKey}`;
}

export const mockBackend = {
  list<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, user?: MockBackendUser | null): T[] {
    const database = readDatabase();
    const records = (database[entityKey] ?? []) as T[];
    return records.filter((record) => !record.deletedAt && isVisibleForUser(entityKey, record, user));
  },

  getById<T extends MockBackendRecord>(
    entityKey: MockBackendEntityKey,
    id: string,
    user?: MockBackendUser | null,
  ): T | null {
    const database = readDatabase();
    const record = (database[entityKey] ?? []).find((item) => item.id === id && !item.deletedAt) as T | undefined;

    if (!record || (user && !isVisibleForUser(entityKey, record, user))) return null;
    return record;
  },

  create<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, record: T, user?: MockBackendUser | null): T[] {
    assertAuthorizedWrite(entityKey, "create", user);
    assertRecordWithinUserScope(record, user);
    assertValidRecordForWrite(entityKey, record);
    const database = readDatabase();
    const nextRecord = decorateRecord(entityKey, record, user);
    const nextRecords = [nextRecord, ...(database[entityKey] ?? [])];

    writeDatabase({
      ...database,
      [entityKey]: nextRecords,
    });

    return mockBackend.list<T>(entityKey, user);
  },

  update<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, record: T, user?: MockBackendUser | null): T[] {
    assertAuthorizedWrite(entityKey, "update", user);
    assertValidRecordForWrite(entityKey, record);
    const database = readDatabase();
    const existingRecord = (database[entityKey] ?? []).find((item) => item.id === record.id);
    assertExistingRecordCanBeModified(entityKey, existingRecord, user);
    assertRecordWithinUserScope(record, user);
    const nextRecord = decorateRecord(entityKey, record, user);
    const nextRecords = (database[entityKey] ?? []).map((item) =>
      item.id === record.id ? nextRecord : item,
    );

    writeDatabase({
      ...database,
      [entityKey]: nextRecords,
    });

    return mockBackend.list<T>(entityKey, user);
  },

  upsert<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, record: T, user?: MockBackendUser | null): T[] {
    assertAuthorizedWrite(entityKey, "upsert", user);
    assertRecordWithinUserScope(record, user);

    if (entityKey === "mapeosCompetencias") {
      const database = readDatabase();
      const matchingRecords = (database[entityKey] ?? []).filter((item) => {
        if (item.deletedAt) return false;
        if (item.id === record.id) return true;

        const itemProgramId = item.programaId ?? item.academicProgramId;
        const itemPlanId = item.planId;
        const recordProgramId = (record as T & { programaId?: string; academicProgramId?: string }).programaId ?? (record as T & { programaId?: string; academicProgramId?: string }).academicProgramId;
        const recordPlanId = (record as T & { planId?: string }).planId;

        return Boolean(itemProgramId && itemPlanId && itemProgramId === recordProgramId && itemPlanId === recordPlanId);
      });

      if (matchingRecords.length > 0) {
        const canonical = matchingRecords[0];
        assertExistingRecordCanBeModified(entityKey, canonical, user);
        const nextRecord = decorateRecord(entityKey, { ...record, id: canonical.id }, user);
        const recordProgramId = (record as T & { programaId?: string; academicProgramId?: string }).programaId ?? (record as T & { programaId?: string; academicProgramId?: string }).academicProgramId;
        const recordPlanId = (record as T & { planId?: string }).planId;

        const nextRecords = (database[entityKey] ?? []).flatMap((item) => {
          if (item.deletedAt) return [item];

          const itemProgramId = item.programaId ?? item.academicProgramId;
          const sameIdentity = Boolean(
            itemProgramId &&
            item.planId &&
            itemProgramId === recordProgramId &&
            item.planId === recordPlanId,
          );

          if (sameIdentity && item.id !== canonical.id) return [];
          return item.id === canonical.id ? nextRecord : item;
        });

        writeDatabase({ ...database, [entityKey]: nextRecords });
        return mockBackend.list<T>(entityKey, user);
      }
    }

    return mockBackend.getById<T>(entityKey, record.id, user)
      ? mockBackend.update<T>(entityKey, record, user)
      : mockBackend.create<T>(entityKey, record, user);
  },

  remove<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, id: string, user?: MockBackendUser | null): T[] {
    assertAuthorizedWrite(entityKey, "delete", user);
    const database = readDatabase();
    const existingRecord = (database[entityKey] ?? []).find((item) => item.id === id);
    assertExistingRecordCanBeModified(entityKey, existingRecord, user);
    const now = new Date().toISOString();
    const nextRecords = (database[entityKey] ?? []).map((item) =>
      item.id === id ? { ...item, deletedAt: now, updatedAt: now } : item,
    );
    const databaseWithRemovedRecord = {
      ...database,
      [entityKey]: nextRecords,
    } as MockBackendDatabase;

    const nextDatabase =
      entityKey === "competenciasRa"
        ? cascadeDeleteCompetenciaRelations(databaseWithRemovedRecord, id, now)
        : databaseWithRemovedRecord;

    writeDatabase(nextDatabase);

    return mockBackend.list<T>(entityKey, user);
  },

  count(entityKey: MockBackendEntityKey, user?: MockBackendUser | null) {
    return this.list(entityKey, user).length;
  },

  clearDemoData() {
    // Uso exclusivo para desarrollo/demo. No mostrar esta acción a usuarios finales.
    writeDatabase({ ...DEFAULT_COLLECTIONS });
    writeIntroFlags({});
    resetAcademicPlanState();

    if (canUseLocalStorage()) {
      storageClient.remove("secub:mock-backend:v1");
      storageClient.remove("secub:demo-intro-flags:v1");
      storageClient.remove("secub:active-academic-plan:v1");
      storageClient.remove("secub:archived-academic-plans:v1");
      storageClient.remove("secub:selected-program-id:v1");
      storageClient.remove("secub:selected-program-id:v2");
    }
  },

  seedDemoData(seed: Partial<MockBackendDatabase>) {
    // TODO: eliminar o reemplazar esta semilla cuando el CRUD real entregue datos desde backend.
    const database = readDatabase();
    writeDatabase({
      ...database,
      ...seed,
    });
  },

  removeDemoSeedRecords(
    recordIdsByEntity: Partial<Record<MockBackendEntityKey, readonly string[]>>,
  ) {
    const database = readDatabase();
    let changed = false;
    const nextDatabase = { ...database };

    (Object.keys(recordIdsByEntity) as MockBackendEntityKey[]).forEach(
      (entityKey) => {
        const recordIds = new Set(recordIdsByEntity[entityKey] ?? []);
        if (!recordIds.size) return;

        const currentRecords = database[entityKey] ?? [];
        const nextRecords = currentRecords.filter(
          (record) => !recordIds.has(record.id),
        );

        if (nextRecords.length !== currentRecords.length) {
          nextDatabase[entityKey] = nextRecords;
          changed = true;
        }
      },
    );

    if (changed) {
      writeDatabase(nextDatabase);
    }

    return changed;
  },

  hasSeenIntro(userId: string, moduleKey: string) {
    // Banderas de introducción separadas del estado vacío de datos.
    // TODO: reemplazar por preferencia persistida en backend cuando exista perfil de usuario real.
    const flags = readIntroFlags();
    return Boolean(flags[getIntroKey(userId, moduleKey)]);
  },

  markIntroAsSeen(userId: string, moduleKey: string) {
    // Usar solo para pantallas introductorias de una vez; no usar para decidir si hay datos del módulo.
    const flags = readIntroFlags();
    flags[getIntroKey(userId, moduleKey)] = true;
    writeIntroFlags(flags);
  },
};

export function subscribeToMockBackendChanges(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handler = () => callback();
  window.addEventListener("secub:mock-backend-updated", handler);
  window.addEventListener("storage", handler);
  window.addEventListener("secub:academic-plan-updated", handler);

  return () => {
    window.removeEventListener("secub:mock-backend-updated", handler);
    window.removeEventListener("storage", handler);
    window.removeEventListener("secub:academic-plan-updated", handler);
  };
}
