import { SIMPLE_DEMO_IDS } from "../../data/secubAcademicPrograms";
import { DEMO_DOCENTE_SECUB } from "../auth/mockUser";
import { readSelectedProgramId, persistSelectedProgramId } from "../programSelection";
import { storageClient } from "../../shared/browser";
import {
  mockBackend,
  type MockBackendEntityKey,
  type MockBackendRecord,
} from "./mockBackend.service";

const CREATED_AT = "2026-01-15T14:00:00.000Z";
const UPDATED_AT = "2026-07-15T14:00:00.000Z";
const DEMO_SEED_STORAGE_KEY = "secub:simple-academic-demo-seed:v1";
const DEMO_SEED_VERSION = "2026-07-22-semestres-3";

export const SIMPLE_DEMO_RECORD_IDS = {
  perfilId: "perfil-egreso-demo-001",
  propositoId: "proposito-formacion-demo-001",
  competenciaId: "competencia-demo-001",
  raId: "ra-demo-001",
  mapeoId: "mapeo-demo-001",
  cicloId: "ciclo-demo-2026",
} as const;

const assignmentId = [
  "asignacion",
  SIMPLE_DEMO_RECORD_IDS.cicloId,
  SIMPLE_DEMO_IDS.courseId,
  SIMPLE_DEMO_RECORD_IDS.competenciaId,
  SIMPLE_DEMO_RECORD_IDS.raId,
].join("-");

const measurementId = [
  "medicion-ra-demo-state",
  DEMO_DOCENTE_SECUB.id,
  SIMPLE_DEMO_RECORD_IDS.cicloId,
  SIMPLE_DEMO_IDS.courseId,
].join("-");

type DemoRecord = MockBackendRecord & Record<string, unknown>;

const perfilEgreso = {
  id: SIMPLE_DEMO_RECORD_IDS.perfilId,
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  lugarId: SIMPLE_DEMO_IDS.lugarId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  estado: "activo",
  descripcion:
    "El egresado de Ingeniería Multimedia integra diseño, tecnología y comunicación para crear soluciones digitales accesibles, éticas y centradas en las personas.",
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

const propositoFormacion = {
  id: SIMPLE_DEMO_RECORD_IDS.propositoId,
  perfilEgresoId: SIMPLE_DEMO_RECORD_IDS.perfilId,
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  lugarId: SIMPLE_DEMO_IDS.lugarId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  estado: "activo",
  descripcion:
    "Formar profesionales capaces de diseñar y desarrollar experiencias multimedia útiles, inclusivas y sostenibles, aplicando metodologías de investigación, diseño y desarrollo tecnológico.",
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

const competencia = {
  id: SIMPLE_DEMO_RECORD_IDS.competenciaId,
  propositoFormacionId: SIMPLE_DEMO_RECORD_IDS.propositoId,
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  lugarId: SIMPLE_DEMO_IDS.lugarId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  estado: "activo",
  nombre: "C01 - Diseño y desarrollo de soluciones multimedia",
  numero: 1,
  descripcion:
    "Diseña y desarrolla soluciones multimedia que responden a necesidades reales mediante procesos iterativos, criterios de usabilidad y fundamentos técnicos.",
  resultadosAprendizaje: [
    {
      id: SIMPLE_DEMO_RECORD_IDS.raId,
      numero: 1,
      descripcion:
        "Construye un prototipo multimedia funcional y argumenta las decisiones de diseño a partir de las necesidades de los usuarios.",
    },
  ],
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

const mapeoCompetencias = {
  id: SIMPLE_DEMO_RECORD_IDS.mapeoId,
  userId: "usr-director",
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  lugarId: SIMPLE_DEMO_IDS.lugarId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  estado: "activo",
  descripcion:
    "Mapeo simplificado de una progresión curricular de tres semestres con niveles Introduce, Refuerza y Afianza.",
  competenciaRaIds: [SIMPLE_DEMO_RECORD_IDS.competenciaId],
  semestresClasificados: [
    {
      semestreId: "semestre-1",
      semestreNumero: 1,
      nucleo: "fundamentacion",
    },
    {
      semestreId: "semestre-2",
      semestreNumero: 2,
      nucleo: "profesionalizacion",
    },
    {
      semestreId: "semestre-3",
      semestreNumero: 3,
      nucleo: "sintesis",
    },
  ],
  nivelesCompromiso: [
    {
      programaId: SIMPLE_DEMO_IDS.programaId,
      planId: SIMPLE_DEMO_IDS.planId,
      semestreId: "semestre-1",
      semestreNumero: 1,
      nucleo: "fundamentacion",
      cursoId: SIMPLE_DEMO_IDS.semester1CourseId,
      cursoNombre: "Fundamentos de Programación",
      cursoCodigo: "IM-101",
      competenciaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
      competenciaNombre: competencia.nombre,
      nivelCompromiso: "introduce",
    },
    {
      programaId: SIMPLE_DEMO_IDS.programaId,
      planId: SIMPLE_DEMO_IDS.planId,
      semestreId: "semestre-2",
      semestreNumero: 2,
      nucleo: "profesionalizacion",
      cursoId: SIMPLE_DEMO_IDS.semester2CourseId,
      cursoNombre: "Programación Orientada a Objetos",
      cursoCodigo: "IM-201",
      competenciaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
      competenciaNombre: competencia.nombre,
      nivelCompromiso: "refuerza",
    },
    {
      programaId: SIMPLE_DEMO_IDS.programaId,
      planId: SIMPLE_DEMO_IDS.planId,
      semestreId: "semestre-3",
      semestreNumero: 3,
      nucleo: "sintesis",
      cursoId: SIMPLE_DEMO_IDS.courseId,
      cursoNombre: "Diseño de Medios Digitales",
      cursoCodigo: "IM-301",
      competenciaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
      competenciaNombre: competencia.nombre,
      nivelCompromiso: "afianza",
    },
  ],
  cursosMapeados: [
    {
      cursoId: SIMPLE_DEMO_IDS.semester1CourseId,
      cursoNombre: "Fundamentos de Programación",
      cursoCodigo: "IM-101",
      semestre: 1,
      nucleo: "Fundamentación",
      competenciaRaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
      competenciaRaIds: [SIMPLE_DEMO_RECORD_IDS.competenciaId],
      competenciaNombre: competencia.nombre,
      nivel: "I",
    },
    {
      cursoId: SIMPLE_DEMO_IDS.semester2CourseId,
      cursoNombre: "Programación Orientada a Objetos",
      cursoCodigo: "IM-201",
      semestre: 2,
      nucleo: "Profesionalización",
      competenciaRaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
      competenciaRaIds: [SIMPLE_DEMO_RECORD_IDS.competenciaId],
      competenciaNombre: competencia.nombre,
      nivel: "R",
    },
    {
      cursoId: SIMPLE_DEMO_IDS.courseId,
      cursoNombre: "Diseño de Medios Digitales",
      cursoCodigo: "IM-301",
      semestre: 3,
      nucleo: "Síntesis",
      competenciaRaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
      competenciaRaIds: [SIMPLE_DEMO_RECORD_IDS.competenciaId],
      competenciaNombre: competencia.nombre,
      nivel: "A",
    },
  ],
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

const cicloMedicion = {
  id: SIMPLE_DEMO_RECORD_IDS.cicloId,
  mapeoCompetenciasId: SIMPLE_DEMO_RECORD_IDS.mapeoId,
  nombre: "Ciclo de medición 2026",
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  periodo: "2026-1",
  duracionAnios: 1.5,
  fechaInicio: "2026-01-20",
  fechaFin: "2027-07-20",
  estado: "activo",
  cursoIds: [SIMPLE_DEMO_IDS.courseId],
  progreso: 100,
  responsableId: "usr-director",
  responsableNombre: "Dirección de Ingeniería Multimedia",
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

const asignacionRa = {
  id: assignmentId,
  cicloId: SIMPLE_DEMO_RECORD_IDS.cicloId,
  periodoId: "2026-1",
  cursoId: SIMPLE_DEMO_IDS.courseId,
  cursoIds: [SIMPLE_DEMO_IDS.courseId],
  competenciaRaId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
  competenciaRaIds: [SIMPLE_DEMO_RECORD_IDS.competenciaId],
  resultadoAprendizajeId: SIMPLE_DEMO_RECORD_IDS.raId,
  resultadoAprendizajeIds: [SIMPLE_DEMO_RECORD_IDS.raId],
  estado: "activo",
  estadoMedicion: "medido",
  userId: "usr-director",
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  docenteNombre: DEMO_DOCENTE_SECUB.nombre,
  docenteId: DEMO_DOCENTE_SECUB.id,
  docenteEmail: DEMO_DOCENTE_SECUB.email,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

const competenceStorageKey = `${SIMPLE_DEMO_IDS.courseId}__${SIMPLE_DEMO_RECORD_IDS.competenciaId}`;

const medicionRa = {
  id: measurementId,
  cicloId: SIMPLE_DEMO_RECORD_IDS.cicloId,
  asignacionRaId: assignmentId,
  asignacionRaIds: [assignmentId],
  selectedCourseId: SIMPLE_DEMO_IDS.courseId,
  activeCompetenceId: SIMPLE_DEMO_RECORD_IDS.competenciaId,
  evaluationsByCourse: {
    [SIMPLE_DEMO_IDS.courseId]: {
      "estudiante-demo-001": { [SIMPLE_DEMO_RECORD_IDS.raId]: "sobresaliente" },
      "estudiante-demo-002": { [SIMPLE_DEMO_RECORD_IDS.raId]: "satisfactorio" },
      "estudiante-demo-003": { [SIMPLE_DEMO_RECORD_IDS.raId]: "deficiente" },
    },
  },
  instrumentsByCourse: {
    [SIMPLE_DEMO_IDS.courseId]: {
      [SIMPLE_DEMO_RECORD_IDS.raId]: {
        description:
          "Rúbrica analítica aplicada al prototipo, la sustentación y la documentación de la solución multimedia.",
      },
    },
  },
  evidenceByCompetence: {
    [competenceStorageKey]: {
      fileName: "evidencia-diseno-medios-digitales.pdf",
      link: "https://example.edu.co/evidencias/proyecto-integrador",
    },
  },
  improvementByCompetence: {
    [competenceStorageKey]: {
      analysis:
        "El grupo demuestra dominio general del RA, aunque un estudiante requiere fortalecer la argumentación de decisiones de diseño.",
      actions:
        "Realizar una retroalimentación individual y una actividad corta de validación con usuarios antes del siguiente cierre.",
    },
  },
  completedCompetenceIds: [SIMPLE_DEMO_RECORD_IDS.competenciaId],
  isEvaluationLocked: true,
  completed: true,
  userId: DEMO_DOCENTE_SECUB.id,
  seccionalId: SIMPLE_DEMO_IDS.seccionalId,
  facultadId: SIMPLE_DEMO_IDS.facultadId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
} satisfies DemoRecord;

interface DemoImprovementPlanRecord extends MockBackendRecord {
  cicloId: string;
  programaId: string;
  planId: string;
  directorId: string;
  userId: string;
  titulo: string;
  descripcion: string;
  fechaCreacion: string;
}

const planMejora: DemoImprovementPlanRecord = {
  id: `plan-mejora-${SIMPLE_DEMO_RECORD_IDS.cicloId}`,
  cicloId: SIMPLE_DEMO_RECORD_IDS.cicloId,
  programaId: SIMPLE_DEMO_IDS.programaId,
  planId: SIMPLE_DEMO_IDS.planId,
  directorId: "usr-director",
  userId: "usr-director",
  titulo: "Plan de mejora demo",
  descripcion:
    "Fortalecer la validación con usuarios y realizar seguimiento individual a los estudiantes que no alcanzaron el resultado de aprendizaje.",
  fechaCreacion: UPDATED_AT,
  createdAt: CREATED_AT,
  updatedAt: UPDATED_AT,
};

export const optionalAcademicDemoSeed = {
  perfilEgreso: [perfilEgreso],
  propositosFormacion: [propositoFormacion],
  competenciasRa: [competencia],
  mapeosCompetencias: [mapeoCompetencias],
  ciclosMedicion: [cicloMedicion],
  asignacionesRa: [asignacionRa],
  medicionesRa: [medicionRa],
  planesMejora: [planMejora],
} satisfies Partial<Record<MockBackendEntityKey, MockBackendRecord[]>>;

const academicEntityKeys = Object.keys(optionalAcademicDemoSeed) as MockBackendEntityKey[];

function hasAcademicData() {
  return academicEntityKeys.some((entityKey) => mockBackend.count(entityKey) > 0);
}

export function seedAcademicDemoData() {
  mockBackend.seedDemoData(optionalAcademicDemoSeed);
}

/**
 * Carga la semilla una sola vez y únicamente cuando la base simulada está vacía.
 * No sobrescribe cambios realizados por el usuario durante las pruebas.
 */
export function ensureSimpleAcademicDemoData() {
  if (typeof window === "undefined") return;

  if (!readSelectedProgramId()) {
    persistSelectedProgramId(SIMPLE_DEMO_IDS.programaId);
  }

  const installedSeedVersion = storageClient.get(DEMO_SEED_STORAGE_KEY);
  if (installedSeedVersion === DEMO_SEED_VERSION) return;

  // Si existía una versión anterior de esta semilla controlada, se actualiza para
  // que los nuevos semestres aparezcan incluso cuando el navegador conserva localStorage.
  if (!hasAcademicData() || Boolean(installedSeedVersion)) {
    seedAcademicDemoData();
  }

  storageClient.set(DEMO_SEED_STORAGE_KEY, DEMO_SEED_VERSION);
}
