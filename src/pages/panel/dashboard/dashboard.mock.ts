import {
  buildDemoDocenteIdFromName,
  getCurrentMockUser,
  resolveDemoDocenteByName,
} from "../../../services/auth/mockUser";
import { mockBackend } from "../../../services/mockBackend";
import { getCicloCatalogs } from "../ciclo/ciclo.mock";
import type {
  CourseMeasurement,
  DashboardCatalogs,
  DashboardData,
  DashboardRole,
  DashboardUser,
  MeasurementCycle,
} from "./dashboard.types";


interface PersistedCycleDemo {
  id: string;
  nombre?: string;
  name?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  periodo?: string;
  fechaInicio?: string;
  fechaFin?: string;
  cursoIds?: string[];
  courseIds?: string[];
}

interface PersistedAssignmentDemo {
  id: string;
  cicloId?: string;
  cursoId?: string;
  cursoIds?: string[];
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  resultadoAprendizajeId?: string;
  resultadoAprendizajeIds?: string[];
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  docenteId?: string;
  docenteNombre?: string;
  docenteEmail?: string;
}

interface PersistedCompetenciaDemo {
  id: string;
  nombre?: string;
  descripcion?: string;
  programaId?: string;
  planId?: string;
  resultadosAprendizaje?: Array<{
    id: string;
    numero?: number;
    descripcion?: string;
  }>;
}


interface PersistedPlanMejoraDemo {
  id: string;
  cicloId?: string;
  programaId?: string;
  planId?: string;
  descripcion?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PersistedMedicionDemo {
  id: string;
  cicloId?: string;
  asignacionRaId?: string;
  asignacionRaIds?: string[];
  selectedCourseId?: string;
  evaluationsByCourse?: Record<string, Record<string, Record<string, string>>>;
  instrumentsByCourse?: Record<string, Record<string, { fileName?: string; description?: string }>>;
  evidenceByCompetence?: Record<string, { fileName?: string; link?: string }>;
  improvementByCompetence?: Record<string, { analysis?: string; actions?: string }>;
  completedCompetenceIds?: string[];
  isEvaluationLocked?: boolean;
  completed?: boolean;
  userId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  updatedAt?: string;
}

function buildTeacherIdFromName(value?: string) {
  const docente = resolveDemoDocenteByName(value);
  if (docente) return docente.id;

  return buildDemoDocenteIdFromName(value);
}

function resolveTeacherEmail(value?: string) {
  return resolveDemoDocenteByName(value)?.email ?? "";
}

function isAchievedDashboardLevel(value?: string) {
  return value === "sobresaliente" || value === "satisfactorio" || value === "en-desarrollo";
}

function uniqueValues(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function getAssignmentCourseId(assignment: PersistedAssignmentDemo) {
  return assignment.cursoId ?? assignment.cursoIds?.[0] ?? "";
}

function getAssignmentCompetenceId(assignment: PersistedAssignmentDemo) {
  return assignment.competenciaRaId ?? assignment.competenciaRaIds?.[0] ?? "";
}

function getAssignmentRaId(assignment: PersistedAssignmentDemo) {
  return assignment.resultadoAprendizajeId ?? assignment.resultadoAprendizajeIds?.[0] ?? "";
}

function getMedicionForAssignment(
  mediciones: PersistedMedicionDemo[],
  assignment: PersistedAssignmentDemo,
  courseId: string,
  cycleId: string,
) {
  return mediciones.find((medicion) => {
    const sameCourse = medicion.selectedCourseId === courseId;
    const sameCycle = !medicion.cicloId || !cycleId || medicion.cicloId === cycleId;
    const sameAssignment =
      medicion.asignacionRaId === assignment.id || medicion.asignacionRaIds?.includes(assignment.id);

    return (sameCourse && sameCycle) || sameAssignment;
  });
}

function buildRealCatalogs(
  persistedCompetences: PersistedCompetenciaDemo[],
  assignments: PersistedAssignmentDemo[],
): DashboardCatalogs {
  const cicloCatalogs = getCicloCatalogs();
  const teachersFromCourses = cicloCatalogs.cursos.map((course) => ({
    id: buildTeacherIdFromName(course.docente),
    name: course.docente,
    email: resolveTeacherEmail(course.docente),
  }));
  const teachersFromAssignments = assignments.map((assignment) => ({
    id: assignment.docenteId ?? buildTeacherIdFromName(assignment.docenteNombre),
    name: assignment.docenteNombre ?? "Docente sin nombre",
    email: assignment.docenteEmail ?? resolveTeacherEmail(assignment.docenteNombre),
  }));
  const teacherMap = new Map<string, { id: string; name: string; email: string }>();

  [...teachersFromCourses, ...teachersFromAssignments, ...dashboardCatalogs.teachers].forEach((teacher) => {
    if (!teacherMap.has(teacher.id)) teacherMap.set(teacher.id, teacher);
  });

  const realCompetences = persistedCompetences.map((competence, competenceIndex) => ({
    id: competence.id,
    code: `C${competenceIndex + 1}`,
    name: competence.nombre ?? `Competencia ${competenceIndex + 1}`,
    description: competence.descripcion ?? "Sin descripción registrada.",
    learningResults: (competence.resultadosAprendizaje ?? []).map((ra, raIndex) => ({
      id: ra.id,
      code: `RA ${String(ra.numero ?? raIndex + 1).padStart(2, "0")}`,
      name: `Resultado de Aprendizaje ${ra.numero ?? raIndex + 1}`,
      description: ra.descripcion ?? "Sin descripción registrada.",
    })),
  }));

  return {
    seccionales: cicloCatalogs.seccionales.map((item) => ({ id: item.id, name: item.nombre })),
    facultades: cicloCatalogs.facultades.map((item) => ({
      id: item.id,
      name: item.nombre,
      seccionalId: item.seccionalId,
    })),
    programas: cicloCatalogs.programas.map((item) => ({
      id: item.id,
      name: item.nombre,
      facultadId: item.facultadId,
      seccionalId: item.seccionalId,
    })),
    planes: cicloCatalogs.planes.map((item) => ({
      id: item.id,
      name: item.nombre,
      programaId: item.programaId,
      estado: item.estado,
    })),
    teachers: Array.from(teacherMap.values()),
    competences: realCompetences.length > 0 ? realCompetences : dashboardCatalogs.competences,
  };
}

function buildPersistedCycles(
  cycles: PersistedCycleDemo[],
  assignments: PersistedAssignmentDemo[],
  plansMejora: PersistedPlanMejoraDemo[] = [],
): MeasurementCycle[] {
  const cicloCatalogs = getCicloCatalogs();
  const cyclesFromAssignments: PersistedCycleDemo[] = assignments
    .filter((assignment) => assignment.cicloId && !cycles.some((cycle) => cycle.id === assignment.cicloId))
    .map((assignment) => ({
      id: assignment.cicloId as string,
      nombre: `Ciclo ${assignment.cicloId}`,
      seccionalId: assignment.seccionalId,
      facultadId: assignment.facultadId,
      programaId: assignment.programaId,
      planId: assignment.planId,
      periodo: "Periodo del ciclo",
      cursoIds: uniqueValues(assignments
        .filter((item) => item.cicloId === assignment.cicloId)
        .map(getAssignmentCourseId)),
    }));

  return [...cycles, ...cyclesFromAssignments].map((cycle) => {
    const programa = cicloCatalogs.programas.find((item) => item.id === cycle.programaId);
    const plan = cicloCatalogs.planes.find((item) => item.id === cycle.planId);
    const courseIds = cycle.cursoIds ?? cycle.courseIds ?? [];

    return {
      id: cycle.id,
      name: cycle.nombre ?? cycle.name ?? "Ciclo de medición",
      seccionalId: cycle.seccionalId ?? programa?.seccionalId ?? "",
      facultadId: cycle.facultadId ?? programa?.facultadId ?? "",
      programaId: cycle.programaId ?? plan?.programaId ?? "",
      planId: cycle.planId ?? "",
      period: cycle.periodo ?? "Periodo del ciclo",
      startDate: (cycle.fechaInicio ?? new Date().toISOString()).slice(0, 10),
      endDate: (cycle.fechaFin ?? new Date().toISOString()).slice(0, 10),
      courseIds,
      hasImprovementPlan: plansMejora.some((planMejora) => planMejora.cicloId === cycle.id),
    };
  });
}

function buildCourseResultsFromMeasurements({
  cycleId,
  courseId,
  assignments,
  mediciones,
}: {
  cycleId: string;
  courseId: string;
  assignments: PersistedAssignmentDemo[];
  mediciones: PersistedMedicionDemo[];
}): CourseMeasurement["results"] {
  const seenRaIds = new Set<string>();

  return assignments.flatMap((assignment) => {
    const raId = getAssignmentRaId(assignment);
    const competenceId = getAssignmentCompetenceId(assignment);
    if (!raId || seenRaIds.has(raId)) return [];
    seenRaIds.add(raId);

    const medicion = getMedicionForAssignment(mediciones, assignment, courseId, cycleId);
    if (!medicion?.completed && !medicion?.isEvaluationLocked) return [];

    const evaluationsByStudent = medicion?.evaluationsByCourse?.[courseId] ?? {};
    const values = Object.values(evaluationsByStudent).map((row) => row?.[raId] ?? "");
    const totalStudents = values.length;
    const hasFullEvaluation = totalStudents > 0 && values.every(Boolean);

    if (!hasFullEvaluation) return [];

    const approvedStudents = values.filter(isAchievedDashboardLevel).length;
    const evidenceKey = `${courseId}__${competenceId}`;
    const courseInstruments = medicion?.instrumentsByCourse?.[courseId] ?? {};
    const instrument = courseInstruments[raId] ?? courseInstruments[evidenceKey];
    const evidence = medicion?.evidenceByCompetence?.[evidenceKey];
    const improvement = medicion?.improvementByCompetence?.[evidenceKey];
    const improvementSummary = [improvement?.analysis, improvement?.actions]
      .filter(Boolean)
      .join("\n");

    return [{
      competenciaId: competenceId,
      raId,
      totalStudents,
      approvedStudents,
      notApprovedStudents: Math.max(totalStudents - approvedStudents, 0),
      // En la estructura nueva de Medición RA no existe archivo por RA.
      // Se conserva instrumentFile como cadena vacía por compatibilidad visual con datos demo antiguos.
      instrumentFile: instrument?.fileName ?? "",
      instrumentDescription: instrument?.description,
      evidenceFile: evidence?.fileName ?? "Evidencia pendiente de repositorio",
      improvementPlanSummary: improvementSummary || undefined,
    }];
  });
}

function buildPersistedCourses({
  cycles,
  assignments,
  mediciones,
}: {
  cycles: MeasurementCycle[];
  assignments: PersistedAssignmentDemo[];
  mediciones: PersistedMedicionDemo[];
}): CourseMeasurement[] {
  const cicloCatalogs = getCicloCatalogs();

  return cycles.flatMap((cycle) => {
    const courseIds = uniqueValues([
      ...cycle.courseIds,
      ...assignments
        .filter((assignment) => assignment.cicloId === cycle.id)
        .map(getAssignmentCourseId),
    ]);

    return courseIds.flatMap((courseId) => {
      const course = cicloCatalogs.cursos.find((item) => item.id === courseId);
      if (!course) return [];

      const courseAssignments = assignments.filter(
        (assignment) => assignment.cicloId === cycle.id && getAssignmentCourseId(assignment) === courseId,
      );
      const assignedRaIds = uniqueValues(courseAssignments.map(getAssignmentRaId));
      const competenceIds = uniqueValues(courseAssignments.map(getAssignmentCompetenceId));
      const results = buildCourseResultsFromMeasurements({
        cycleId: cycle.id,
        courseId,
        assignments: courseAssignments,
        mediciones,
      });
      const firstAssignment = courseAssignments[0];
      const teacherName = firstAssignment?.docenteNombre ?? course.docente;

      return [{
        id: course.id,
        code: course.codigo,
        name: course.nombre,
        cycleId: cycle.id,
        seccionalId: cycle.seccionalId,
        facultadId: cycle.facultadId,
        programaId: cycle.programaId || course.programaId,
        planId: cycle.planId || course.planId,
        teacherId: firstAssignment?.docenteId ?? buildTeacherIdFromName(teacherName),
        competenceIds,
        assignedRaIds,
        totalRa: assignedRaIds.length,
        evaluatedRa: results.length,
        results,
      }];
    });
  });
}

function getPersistedDashboardData(): DashboardData | null {
  const persistedCycles = mockBackend.list<PersistedCycleDemo>("ciclosMedicion");
  const assignments = mockBackend.list<PersistedAssignmentDemo>("asignacionesRa");
  const persistedCompetences = mockBackend.list<PersistedCompetenciaDemo>("competenciasRa");
  const mediciones = mockBackend.list<PersistedMedicionDemo>("medicionesRa");
  const plansMejora = mockBackend.list<PersistedPlanMejoraDemo>("planesMejora");

  if (
    persistedCycles.length === 0 &&
    assignments.length === 0 &&
    persistedCompetences.length === 0 &&
    mediciones.length === 0 &&
    plansMejora.length === 0
  ) {
    return null;
  }

  const cycles = buildPersistedCycles(persistedCycles, assignments, plansMejora);
  const courses = buildPersistedCourses({ cycles, assignments, mediciones });

  return {
    catalogs: buildRealCatalogs(persistedCompetences, assignments),
    cycles,
    courses,
  };
}

function getPersistedDashboardCycles(): MeasurementCycle[] {
  const user = getCurrentMockUser();

  return mockBackend.list<PersistedCycleDemo>("ciclosMedicion", user).map((cycle) => ({
    id: cycle.id,
    name: cycle.nombre ?? cycle.name ?? "Ciclo de medición demo",
    seccionalId: cycle.seccionalId ?? user.scope.seccionalId ?? "",
    facultadId: cycle.facultadId ?? user.scope.facultadId ?? "",
    programaId: cycle.programaId ?? user.scope.programaId ?? "",
    planId: cycle.planId ?? user.scope.planId ?? "",
    period: cycle.periodo ?? "Periodo demo",
    startDate: cycle.fechaInicio ?? new Date().toISOString(),
    endDate: cycle.fechaFin ?? new Date().toISOString(),
    courseIds: cycle.cursoIds ?? cycle.courseIds ?? [],
    hasImprovementPlan: mockBackend
      .list<PersistedPlanMejoraDemo>("planesMejora", user)
      .some((planMejora) => planMejora.cicloId === cycle.id),
  }));
}

function mergePersistedCycles(baseCycles: MeasurementCycle[]) {
  const persistedCycles = getPersistedDashboardCycles();
  const existingIds = new Set(baseCycles.map((cycle) => cycle.id));
  return [
    ...persistedCycles.filter((cycle) => !existingIds.has(cycle.id)),
    ...baseCycles,
  ];
}

export const TARGET_COMPLIANCE = 70;

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: [
    { id: "cali", name: "Seccional Cali" },
    { id: "bogota", name: "Sede Bogotá" },
    { id: "medellin", name: "Seccional Medellín" },
    { id: "cartagena", name: "Seccional Cartagena" },
  ],
  facultades: [
    { id: "ing-cali", name: "Facultad de Ingeniería", seccionalId: "cali" },
    { id: "artes-cali", name: "Facultad de Artes y Diseño", seccionalId: "cali" },
    { id: "ing-bog", name: "Facultad de Ingeniería", seccionalId: "bogota" },
    { id: "salud-bog", name: "Facultad de Salud", seccionalId: "bogota" },
    { id: "ing-med", name: "Facultad de Ingeniería", seccionalId: "medellin" },
  ],
  programas: [
    { id: "sis-cali", name: "Ingeniería de Sistemas", facultadId: "ing-cali", seccionalId: "cali" },
    { id: "ind-cali", name: "Ingeniería Industrial", facultadId: "ing-cali", seccionalId: "cali" },
    { id: "sis-bog", name: "Ingeniería de Sistemas", facultadId: "ing-bog", seccionalId: "bogota" },
    { id: "multimedia-bog", name: "Ingeniería Multimedia", facultadId: "ing-bog", seccionalId: "bogota" },
    { id: "agro-med", name: "Ingeniería Agroindustrial", facultadId: "ing-med", seccionalId: "medellin" },
  ],
  planes: [
    { id: "sis-cali-2024-2", name: "Plan 2024-2", programaId: "sis-cali", estado: "activo" },
    { id: "sis-cali-2024-1", name: "Plan 2024-1", programaId: "sis-cali", estado: "activo" },
    { id: "sis-cali-2018-2", name: "Plan 2018-2", programaId: "sis-cali", estado: "inactivo" },
    { id: "ind-cali-2024-2", name: "Plan 2024-2", programaId: "ind-cali", estado: "activo" },
    { id: "sis-bog-2024-2", name: "Plan 2024-2", programaId: "sis-bog", estado: "activo" },
    { id: "sis-bog-2015-1", name: "Plan 2015-1", programaId: "sis-bog", estado: "inactivo" },
    { id: "multimedia-bog-2024-2", name: "Plan 2024-2", programaId: "multimedia-bog", estado: "activo" },
    { id: "agro-med-2024-2", name: "Plan 2024-2", programaId: "agro-med", estado: "activo" },
  ],
  teachers: [
    { id: "doc-santiago", name: "Santiago Torres", email: "santiago.torres@usb.edu.co" },
    { id: "doc-antonio", name: "Antonio Rodríguez", email: "antonio.rodriguez@usb.edu.co" },
    { id: "doc-camilo", name: "Camilo Castro", email: "camilo.castro@usb.edu.co" },
    { id: "doc-marcela", name: "Marcela Ruiz", email: "marcela.ruiz@usb.edu.co" },
    { id: "doc-paula", name: "Paula Ríos", email: "paula.rios@usb.edu.co" },
    { id: "doc-diana", name: "Diana Cardona", email: "diana.cardona@usb.edu.co" },
  ],
  competences: [
    {
      id: "comp-analisis",
      code: "C1",
      name: "Análisis y diseño de soluciones",
      description:
        "Analiza problemas del contexto, formula alternativas de solución y sustenta decisiones de diseño con criterios técnicos y académicos.",
      learningResults: [
        {
          id: "ra-01",
          code: "RA 01",
          name: "Comprende el problema",
          description:
            "El curso introduce la competencia al estudiante. Se presentan los conceptos fundamentales y se inicia la familiarización con los componentes del análisis.",
        },
        {
          id: "ra-02",
          code: "RA 02",
          name: "Propone alternativas de solución",
          description:
            "El estudiante propone alternativas pertinentes y argumenta la selección de una solución de acuerdo con las necesidades del contexto.",
        },
      ],
    },
    {
      id: "comp-construccion",
      code: "C2",
      name: "Construcción y validación",
      description:
        "Construye productos, valida resultados y documenta evidencias trazables para el seguimiento académico del programa.",
      learningResults: [
        {
          id: "ra-03",
          code: "RA 03",
          name: "Implementa la solución",
          description:
            "El estudiante desarrolla la solución definida aplicando criterios de calidad, integración y documentación técnica.",
        },
        {
          id: "ra-04",
          code: "RA 04",
          name: "Evalúa resultados",
          description:
            "El estudiante analiza resultados, evidencias y oportunidades de mejora para fortalecer el desempeño del curso.",
        },
      ],
    },
    {
      id: "comp-investigacion",
      code: "C3",
      name: "Investigación aplicada",
      description:
        "Integra métodos de investigación, evidencias y comunicación académica para resolver situaciones propias del campo profesional.",
      learningResults: [
        {
          id: "ra-05",
          code: "RA 05",
          name: "Formula ruta investigativa",
          description:
            "El estudiante delimita preguntas, objetivos y fuentes de información con coherencia metodológica.",
        },
        {
          id: "ra-06",
          code: "RA 06",
          name: "Comunica hallazgos",
          description:
            "El estudiante comunica hallazgos de forma clara, sustentada y coherente con los criterios del programa.",
        },
      ],
    },
  ],
};

export const measurementCycles: MeasurementCycle[] = [
  {
    id: "ciclo-2026-1",
    name: "Ciclo 2026 1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    period: "2026-1",
    startDate: "2026-01-15",
    endDate: "2027-07-15",
    courseIds: ["curso-intro-programacion", "curso-bases-datos", "curso-optimizacion-industrial"],
  },
  {
    id: "ciclo-2024-2",
    name: "Ciclo 2024 2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    period: "2024-2",
    startDate: "2024-07-15",
    endDate: "2026-01-15",
    courseIds: ["curso-proyecto-integrador", "curso-practica-profesional"],
  },
  {
    id: "ciclo-bog-2024-2",
    name: "Ciclo Bogotá 2024 2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "sis-bog-2024-2",
    period: "2024-2",
    startDate: "2024-07-15",
    endDate: "2026-01-15",
    courseIds: ["curso-bog-proyecto-software", "curso-bog-trabajo-grado"],
  },
  {
    id: "ciclo-med-2024-2",
    name: "Ciclo Medellín 2024 2",
    seccionalId: "medellin",
    facultadId: "ing-med",
    programaId: "agro-med",
    planId: "agro-med-2024-2",
    period: "2024-2",
    startDate: "2024-07-15",
    endDate: "2026-01-15",
    courseIds: ["curso-agro-proyecto"],
  },
];

export const courseMeasurements: CourseMeasurement[] = [
  {
    id: "curso-intro-programacion",
    code: "SIS-701",
    name: "Introducción a la programación",
    cycleId: "ciclo-2026-1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-santiago",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 1,
    results: [
      { raId: "ra-01", totalStudents: 30, approvedStudents: 4, notApprovedStudents: 26, instrumentFile: "instrumento-ra01.docx", evidenceFile: "evidencia-ra01.zip", improvementPlanFile: "plan-mejora-ra01.pdf", improvementPlanSummary: "Reforzar conceptos base y proponer ejercicios guiados antes de la siguiente medición." },
    ],
  },
  {
    id: "curso-bases-datos",
    code: "SIS-702",
    name: "Bases de Datos",
    cycleId: "ciclo-2026-1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-santiago",
    competenceIds: ["comp-analisis", "comp-investigacion"],
    totalRa: 4,
    evaluatedRa: 2,
    results: [
      { raId: "ra-01", totalStudents: 28, approvedStudents: 20, notApprovedStudents: 8, instrumentFile: "rubrica-bases-ra01.docx", evidenceFile: "evidencias-bases-ra01.zip" },
      { raId: "ra-05", totalStudents: 28, approvedStudents: 17, notApprovedStudents: 11, instrumentFile: "instrumento-bases-ra05.docx", evidenceFile: "evidencias-bases-ra05.zip", improvementPlanFile: "plan-mejora-bases-ra05.pdf", improvementPlanSummary: "Fortalecer la formulación de preguntas y el análisis de fuentes académicas." },
    ],
  },
  {
    id: "curso-optimizacion-industrial",
    code: "IND-701",
    name: "Resolución de Problemas Computacionales",
    cycleId: "ciclo-2026-1",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "ind-cali",
    planId: "ind-cali-2024-2",
    teacherId: "doc-marcela",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 1,
    results: [
      { raId: "ra-02", totalStudents: 24, approvedStudents: 12, notApprovedStudents: 12, instrumentFile: "instrumento-ind-ra02.docx", evidenceFile: "evidencia-ind-ra02.zip", improvementPlanFile: "plan-mejora-ind-ra02.pdf", improvementPlanSummary: "Ajustar acompañamiento y retroalimentación en la fase de diseño de alternativas." },
    ],
  },
  {
    id: "curso-proyecto-integrador",
    code: "SIS-801",
    name: "Proyecto Integrador I",
    cycleId: "ciclo-2024-2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-santiago",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 4,
    results: [
      { raId: "ra-01", totalStudents: 20, approvedStudents: 16, notApprovedStudents: 4, instrumentFile: "instrumento-proyecto-ra01.docx", evidenceFile: "evidencia-proyecto-ra01.zip" },
      { raId: "ra-02", totalStudents: 20, approvedStudents: 12, notApprovedStudents: 8, instrumentFile: "instrumento-proyecto-ra02.docx", evidenceFile: "evidencia-proyecto-ra02.zip", improvementPlanFile: "plan-mejora-proyecto-ra02.pdf", improvementPlanSummary: "Acompañar la argumentación de alternativas con sesiones de retroalimentación por equipos." },
      { raId: "ra-03", totalStudents: 20, approvedStudents: 5, notApprovedStudents: 15, instrumentFile: "instrumento-proyecto-ra03.docx", evidenceFile: "evidencia-proyecto-ra03.zip", improvementPlanFile: "plan-mejora-proyecto-ra03.pdf", improvementPlanSummary: "Reforzar criterios de implementación y validación de entregables parciales." },
      { raId: "ra-04", totalStudents: 20, approvedStudents: 10, notApprovedStudents: 10, instrumentFile: "instrumento-proyecto-ra04.docx", evidenceFile: "evidencia-proyecto-ra04.zip", improvementPlanFile: "plan-mejora-proyecto-ra04.pdf", improvementPlanSummary: "Definir talleres de análisis de resultados y cierre de evidencias." },
    ],
  },
  {
    id: "curso-practica-profesional",
    code: "SIS-802",
    name: "Práctica Profesional",
    cycleId: "ciclo-2024-2",
    seccionalId: "cali",
    facultadId: "ing-cali",
    programaId: "sis-cali",
    planId: "sis-cali-2024-2",
    teacherId: "doc-antonio",
    competenceIds: ["comp-analisis", "comp-investigacion"],
    totalRa: 4,
    evaluatedRa: 4,
    results: [
      { raId: "ra-01", totalStudents: 22, approvedStudents: 18, notApprovedStudents: 4, instrumentFile: "instrumento-practica-ra01.docx", evidenceFile: "evidencia-practica-ra01.zip" },
      { raId: "ra-02", totalStudents: 22, approvedStudents: 19, notApprovedStudents: 3, instrumentFile: "instrumento-practica-ra02.docx", evidenceFile: "evidencia-practica-ra02.zip" },
      { raId: "ra-05", totalStudents: 22, approvedStudents: 14, notApprovedStudents: 8, instrumentFile: "instrumento-practica-ra05.docx", evidenceFile: "evidencia-practica-ra05.zip", improvementPlanFile: "plan-mejora-practica-ra05.pdf", improvementPlanSummary: "Mejorar la formulación de objetivos y la trazabilidad de fuentes." },
      { raId: "ra-06", totalStudents: 22, approvedStudents: 20, notApprovedStudents: 2, instrumentFile: "instrumento-practica-ra06.docx", evidenceFile: "evidencia-practica-ra06.zip" },
    ],
  },
  {
    id: "curso-bog-proyecto-software",
    code: "SIS-701",
    name: "Proyecto Integrador de Software",
    cycleId: "ciclo-bog-2024-2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "sis-bog-2024-2",
    teacherId: "doc-antonio",
    competenceIds: ["comp-analisis", "comp-construccion"],
    totalRa: 4,
    evaluatedRa: 4,
    results: [
      { raId: "ra-01", totalStudents: 26, approvedStudents: 21, notApprovedStudents: 5, instrumentFile: "bog-ra01.docx", evidenceFile: "bog-ra01.zip" },
      { raId: "ra-02", totalStudents: 26, approvedStudents: 20, notApprovedStudents: 6, instrumentFile: "bog-ra02.docx", evidenceFile: "bog-ra02.zip" },
      { raId: "ra-03", totalStudents: 26, approvedStudents: 19, notApprovedStudents: 7, instrumentFile: "bog-ra03.docx", evidenceFile: "bog-ra03.zip" },
      { raId: "ra-04", totalStudents: 26, approvedStudents: 22, notApprovedStudents: 4, instrumentFile: "bog-ra04.docx", evidenceFile: "bog-ra04.zip" },
    ],
  },
  {
    id: "curso-bog-trabajo-grado",
    code: "SIS-703",
    name: "Trabajo de Grado",
    cycleId: "ciclo-bog-2024-2",
    seccionalId: "bogota",
    facultadId: "ing-bog",
    programaId: "sis-bog",
    planId: "sis-bog-2024-2",
    teacherId: "doc-paula",
    competenceIds: ["comp-investigacion"],
    totalRa: 2,
    evaluatedRa: 2,
    results: [
      { raId: "ra-05", totalStudents: 18, approvedStudents: 13, notApprovedStudents: 5, instrumentFile: "trabajo-grado-ra05.docx", evidenceFile: "trabajo-grado-ra05.zip" },
      { raId: "ra-06", totalStudents: 18, approvedStudents: 16, notApprovedStudents: 2, instrumentFile: "trabajo-grado-ra06.docx", evidenceFile: "trabajo-grado-ra06.zip" },
    ],
  },
  {
    id: "curso-agro-proyecto",
    code: "AGR-701",
    name: "Proyecto Agroindustrial Aplicado",
    cycleId: "ciclo-med-2024-2",
    seccionalId: "medellin",
    facultadId: "ing-med",
    programaId: "agro-med",
    planId: "agro-med-2024-2",
    teacherId: "doc-diana",
    competenceIds: ["comp-analisis"],
    totalRa: 2,
    evaluatedRa: 2,
    results: [
      { raId: "ra-01", totalStudents: 21, approvedStudents: 18, notApprovedStudents: 3, instrumentFile: "agro-ra01.docx", evidenceFile: "agro-ra01.zip" },
      { raId: "ra-02", totalStudents: 21, approvedStudents: 17, notApprovedStudents: 4, instrumentFile: "agro-ra02.docx", evidenceFile: "agro-ra02.zip" },
    ],
  },
];

const roleLabels: Record<DashboardRole, string> = {
  admin: "Admin / Empresa",
  vice: "Vicerrectoría de seccional",
  decano: "Decanatura",
  director: "Dirección de programa",
  docente: "Docencia",
};

const mockUsers: Record<DashboardRole, DashboardUser> = {
  admin: {
    id: "usr-admin",
    name: "Juliana Mejía",
    role: "admin",
    label: roleLabels.admin,
    scope: {},
  },
  vice: {
    id: "usr-vice",
    name: "Ana María Restrepo",
    role: "vice",
    label: roleLabels.vice,
    scope: { seccionalId: "bogota" },
  },
  decano: {
    id: "usr-decano",
    name: "Carlos Medina",
    role: "decano",
    label: roleLabels.decano,
    scope: { seccionalId: "bogota", facultadId: "ing-bog" },
  },
  director: {
    id: "usr-director",
    name: "Laura Gómez",
    role: "director",
    label: roleLabels.director,
    scope: { seccionalId: "cali", facultadId: "ing-cali", programaIds: ["sis-cali", "ind-cali"] },
  },
  docente: {
    id: "usr-docente",
    name: "Santiago Torres",
    role: "docente",
    label: roleLabels.docente,
    scope: { seccionalId: "cali", facultadId: "ing-cali", programaIds: ["sis-cali"], docenteId: "doc-santiago" },
  },
};

export const DEFAULT_DASHBOARD_ROLE: DashboardRole = "docente";

export function normalizeDashboardRole(rawRole: string | null | undefined): DashboardRole {
  const normalized = String(rawRole ?? "").trim().toLowerCase();

  const aliases: Record<string, DashboardRole> = {
    admin: "admin",
    administrador: "admin",
    superadmin: "admin",
    empresa: "admin",
    vice: "vice",
    vicerrector: "vice",
    vicerrectoria: "vice",
    vicerrectoría: "vice",
    decano: "decano",
    director: "director",
    directorprograma: "director",
    director_de_programa: "director",
    docente: "docente",
  };

  return aliases[normalized] ?? DEFAULT_DASHBOARD_ROLE;
}

export function getCurrentDashboardUser(): DashboardUser {
  const demoUser = getCurrentMockUser();
  const fallbackUser = mockUsers[demoUser.role as keyof typeof mockUsers] ?? mockUsers.admin;

  return {
    ...fallbackUser,
    id: demoUser.id,
    name: demoUser.nombre,
    email: demoUser.email,
    role: demoUser.role as DashboardUser["role"],
    label: demoUser.cargo || fallbackUser.label,
    scope: {
      ...fallbackUser.scope,
      seccionalId: demoUser.scope.seccionalId ?? fallbackUser.scope.seccionalId,
      facultadId: demoUser.scope.facultadId ?? fallbackUser.scope.facultadId,
      programaIds: demoUser.scope.programaId
        ? [demoUser.scope.programaId]
        : fallbackUser.scope.programaIds,
      programaId: demoUser.scope.programaId,
      planId: demoUser.scope.planId,
      docenteId: demoUser.role === "docente" ? demoUser.id : fallbackUser.scope.docenteId,
    },
  };
}

export function getDashboardData(): DashboardData {
  const params = new URLSearchParams(window.location.search);
  const scenario = params.get("scenario");

  if (scenario === "sin-ciclos") {
    return {
      catalogs: dashboardCatalogs,
      cycles: [],
      courses: [],
    };
  }

  if (scenario === "sin-cursos") {
    return {
      catalogs: dashboardCatalogs,
      cycles: measurementCycles,
      courses: courseMeasurements.filter((course) => course.teacherId !== "doc-santiago"),
    };
  }

  const persistedDashboardData = getPersistedDashboardData();

  if (persistedDashboardData) {
    return persistedDashboardData;
  }

  // Fallback demo: solo se usa cuando todavía no existe información real persistida
  // en mockBackend desde Ciclo, Asignar RA o Medición RA.
  return {
    catalogs: dashboardCatalogs,
    cycles: measurementCycles,
    courses: courseMeasurements,
  };
}
