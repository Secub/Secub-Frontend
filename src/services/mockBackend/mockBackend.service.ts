import { MAX_RA_PER_COMPETENCIA } from "../../utils/learningResultsRules";

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
  role: string;
  scope?: MockUserScope;
}

const MOCK_BACKEND_ROOT_KEY = "secub:mock-backend:v1";
const DEMO_INTRO_ROOT_KEY = "secub:demo-intro-flags:v1";

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

type MockBackendDatabase = typeof DEFAULT_COLLECTIONS;

type IntroFlags = Record<string, boolean>;

function canUseLocalStorage() {
  try {
    return typeof window !== "undefined" && "localStorage" in window;
  } catch {
    return false;
  }
}

function readDatabase(): MockBackendDatabase {
  if (!canUseLocalStorage()) {
    return { ...DEFAULT_COLLECTIONS };
  }

  try {
    const rawDatabase = window.localStorage.getItem(MOCK_BACKEND_ROOT_KEY);
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

  window.localStorage.setItem(MOCK_BACKEND_ROOT_KEY, JSON.stringify(database));
  window.dispatchEvent(new CustomEvent("secub:mock-backend-updated"));
}

function isAdminLike(user?: MockBackendUser | null) {
  return user?.role === "admin" || user?.role === "super-admin";
}

function isVisibleForUser<T extends MockBackendRecord>(
  entityKey: MockBackendEntityKey,
  record: T,
  user?: MockBackendUser | null,
) {
  if (!user || isAdminLike(user)) return true;

  const scope = user.scope ?? {};

  // En modo demo, la Medición RA conserva progreso por usuario/ciclo/asignación.
  // TODO: cuando exista backend, reemplazar esta regla por permisos reales del servicio.
  if (entityKey === "medicionesRa" && record.userId && record.userId !== user.id) {
    return false;
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


function assertValidRecordForWrite<T extends MockBackendRecord>(
  entityKey: MockBackendEntityKey,
  record: T,
) {
  if (entityKey !== "competenciasRa") return;

  const maybeCompetencia = record as T & { resultadosAprendizaje?: unknown[] };
  const raCount = Array.isArray(maybeCompetencia.resultadosAprendizaje)
    ? maybeCompetencia.resultadosAprendizaje.length
    : 0;

  if (raCount > MAX_RA_PER_COMPETENCIA) {
    throw new Error("Máximo 4 Resultados de Aprendizaje por competencia.");
  }
}

function decorateRecord<T extends MockBackendRecord>(record: T, user?: MockBackendUser | null): T {
  const now = new Date().toISOString();
  const scope = user?.scope ?? {};

  return {
    ...record,
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
  const competencia = (database.competenciasRa ?? []).find((record) => record.id === competenciaId) as
    | (MockBackendRecord & { resultadosAprendizaje?: Array<{ id?: string }> })
    | undefined;
  const resultadoAprendizajeIds = (competencia?.resultadosAprendizaje ?? [])
    .map((ra) => ra.id)
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
    return JSON.parse(window.localStorage.getItem(DEMO_INTRO_ROOT_KEY) ?? "{}") as IntroFlags;
  } catch {
    return {};
  }
}

function writeIntroFlags(flags: IntroFlags) {
  if (!canUseLocalStorage()) return;
  window.localStorage.setItem(DEMO_INTRO_ROOT_KEY, JSON.stringify(flags));
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

  getById<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, id: string): T | null {
    const database = readDatabase();
    return ((database[entityKey] ?? []).find((record) => record.id === id && !record.deletedAt) as T) ?? null;
  },

  create<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, record: T, user?: MockBackendUser | null): T[] {
    assertValidRecordForWrite(entityKey, record);
    const database = readDatabase();
    const nextRecord = decorateRecord(record, user);
    const nextRecords = [nextRecord, ...(database[entityKey] ?? [])];

    writeDatabase({
      ...database,
      [entityKey]: nextRecords,
    });

    return mockBackend.list<T>(entityKey, user);
  },

  update<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, record: T, user?: MockBackendUser | null): T[] {
    assertValidRecordForWrite(entityKey, record);
    const database = readDatabase();
    const nextRecord = decorateRecord(record, user);
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
    return mockBackend.getById<T>(entityKey, record.id)
      ? mockBackend.update<T>(entityKey, record, user)
      : mockBackend.create<T>(entityKey, record, user);
  },

  remove<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, id: string, user?: MockBackendUser | null): T[] {
    const database = readDatabase();
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

  replaceCollection<T extends MockBackendRecord>(entityKey: MockBackendEntityKey, records: T[]) {
    const database = readDatabase();
    writeDatabase({
      ...database,
      [entityKey]: records,
    });
  },

  count(entityKey: MockBackendEntityKey, user?: MockBackendUser | null) {
    return this.list(entityKey, user).length;
  },

  clearDemoData() {
    // Uso exclusivo para desarrollo/demo. No mostrar esta acción a usuarios finales.
    writeDatabase({ ...DEFAULT_COLLECTIONS });
    writeIntroFlags({});
  },

  seedDemoData(seed: Partial<MockBackendDatabase>) {
    // TODO: eliminar o reemplazar esta semilla cuando el CRUD real entregue datos desde backend.
    const database = readDatabase();
    writeDatabase({
      ...database,
      ...seed,
    });
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

  return () => {
    window.removeEventListener("secub:mock-backend-updated", handler);
    window.removeEventListener("storage", handler);
  };
}
