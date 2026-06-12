import {
  buildDemoDocenteIdFromName,
  getCurrentMockUser,
  resolveDemoDocenteByName,
} from "../../../services/auth/mockUser";
import { mockBackend } from "../../../services/mockBackend";
import { getCicloCatalogs } from "../ciclo/ciclo.mock";
import {
  secubAcademicCourses,
  secubAcademicPrograms,
  secubFacultades,
  secubPlanes,
  secubProgramas,
  secubSeccionales,
} from "../../../data/secubAcademicPrograms";
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

function getAcademicCourseOrThrow(courseId: string) {
  const course = secubAcademicCourses.find((item) => item.id === courseId);
  if (!course) throw new Error(`Curso académico no encontrado: ${courseId}`);
  return course;
}

const dashboardTeacherCatalog = [
  { id: "usr-docente-psicologia", name: "Docente Psicología", email: "docente.psicologia@usb.edu.co" },
  { id: "usr-docente-derecho", name: "Docente Derecho", email: "docente.derecho@usb.edu.co" },
  { id: "usr-docente-investigacion", name: "Docente Investigación", email: "docente.investigacion@usb.edu.co" },
  { id: "usr-docente-practica", name: "Docente Práctica", email: "docente.practica@usb.edu.co" },
];

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: secubSeccionales.map((item) => ({ id: item.id, name: item.nombre })),
  facultades: secubFacultades.map((item) => ({ id: item.id, name: item.nombre, seccionalId: item.seccionalId })),
  programas: secubProgramas.map((item) => ({ id: item.id, name: item.nombre, facultadId: item.facultadId, seccionalId: item.seccionalId })),
  planes: secubPlanes.map((item) => ({ id: item.id, name: item.nombre, programaId: item.programaId, estado: item.estado })),
  teachers: dashboardTeacherCatalog,
  competences: [
    {
      id: "comp-investigacion-contexto",
      code: "C1",
      name: "Investigación y análisis del contexto",
      description: "Analiza problemas del contexto disciplinar y sustenta decisiones académicas con evidencias pertinentes.",
      learningResults: [
        { id: "ra-investigacion-01", code: "RA 01", name: "Reconoce el contexto", description: "Identifica elementos del contexto académico, social o jurídico asociados al problema de estudio." },
        { id: "ra-investigacion-02", code: "RA 02", name: "Sustenta con evidencias", description: "Argumenta decisiones con fuentes, datos y criterios propios del programa académico." },
      ],
    },
    {
      id: "comp-intervencion-argumentacion",
      code: "C2",
      name: "Intervención y argumentación profesional",
      description: "Propone alternativas de intervención, acompañamiento o gestión del conflicto con criterios éticos y disciplinares.",
      learningResults: [
        { id: "ra-intervencion-01", code: "RA 03", name: "Propone alternativas", description: "Formula alternativas coherentes con las necesidades del contexto y del programa." },
        { id: "ra-intervencion-02", code: "RA 04", name: "Evalúa resultados", description: "Valora resultados y oportunidades de mejora a partir de evidencias de aprendizaje." },
      ],
    },
    {
      id: "comp-etica-responsabilidad",
      code: "C3",
      name: "Ética y responsabilidad social",
      description: "Integra criterios éticos, humanísticos y de responsabilidad social en el desempeño académico y profesional.",
      learningResults: [
        { id: "ra-etica-01", code: "RA 05", name: "Aplica criterios éticos", description: "Reconoce implicaciones éticas de sus decisiones en escenarios académicos y profesionales." },
        { id: "ra-etica-02", code: "RA 06", name: "Comunica decisiones", description: "Comunica hallazgos y decisiones de forma clara, respetuosa y sustentada." },
      ],
    },
  ],
};

export const measurementCycles: MeasurementCycle[] = secubAcademicPrograms.map((program) => {
  const synthesisCourses = secubAcademicCourses
    .filter((course) => course.programId === program.id && course.cycle === "Síntesis")
    .slice(0, 3)
    .map((course) => course.id);

  return {
    id: `ciclo-${program.id}-2026-1`,
    name: `Ciclo ${program.name} 2026-1`,
    seccionalId: program.seccionalId,
    facultadId: program.facultyId,
    programaId: program.id,
    planId: program.planId,
    period: "2026-1",
    startDate: "2026-01-15",
    endDate: "2027-07-15",
    courseIds: synthesisCourses,
  };
});

const fallbackCourseIds = [
  "psicologia-sem8-practica-profesional-i",
  "psicologia-sem8-modalidad-de-grado-i",
  "psicologia-sem9-practica-profesional-ii",
  "derecho-sem7-procesal-civil-ii",
  "derecho-sem7-arbitraje",
  "derecho-sem8-programa-complementario-de-formacion-avanzada",
];

export const courseMeasurements: CourseMeasurement[] = fallbackCourseIds.map((courseId, index) => {
  const course = getAcademicCourseOrThrow(courseId);
  const program = secubAcademicPrograms.find((item) => item.id === course.programId)!;
  const cycleId = `ciclo-${program.id}-2026-1`;
  const teacherId = course.programId === "psicologia" ? "usr-docente-psicologia" : "usr-docente-derecho";
  const competenceIds = index % 2 === 0
    ? ["comp-investigacion-contexto", "comp-etica-responsabilidad"]
    : ["comp-intervencion-argumentacion", "comp-etica-responsabilidad"];
  const evaluatedRa = index % 3 === 0 ? 2 : 1;

  return {
    id: `medicion-${course.id}`,
    code: course.code,
    name: course.name,
    cycleId,
    seccionalId: program.seccionalId,
    facultadId: program.facultyId,
    programaId: program.id,
    planId: program.planId,
    teacherId,
    competenceIds,
    totalRa: 4,
    evaluatedRa,
    results: [
      {
        competenciaId: competenceIds[0],
        raId: competenceIds[0] === "comp-investigacion-contexto" ? "ra-investigacion-01" : "ra-intervencion-01",
        totalStudents: course.programId === "psicologia" ? 28 : 32,
        approvedStudents: course.programId === "psicologia" ? 22 : 25,
        notApprovedStudents: course.programId === "psicologia" ? 6 : 7,
        instrumentFile: `instrumento-${course.id}.docx`,
        evidenceFile: `evidencias-${course.id}.zip`,
        improvementPlanSummary: "Reforzar acompañamiento y retroalimentación con evidencias de aprendizaje del programa seleccionado.",
      },
    ],
  };
});

const roleLabels: Record<DashboardRole, string> = {
  admin: "Admin / Empresa",
  vice: "Vicerrectoría de seccional",
  decano: "Decanatura",
  director: "Jefatura de programa",
  docente: "Docencia",
};

const mockUsers: Record<DashboardRole, DashboardUser> = {
  admin: {
    id: "usr-admin",
    name: "Juliana Mejía",
    role: "admin",
    label: roleLabels.admin,
    scope: { seccionalId: "cali" },
  },
  vice: {
    id: "usr-vice",
    name: "Ana María Restrepo",
    role: "vice",
    label: roleLabels.vice,
    scope: { seccionalId: "cali" },
  },
  decano: {
    id: "usr-decano",
    name: "Carlos Medina",
    role: "decano",
    label: roleLabels.decano,
    scope: { seccionalId: "cali" },
  },
  director: {
    id: "usr-director",
    name: "Jefatura SECUB",
    role: "director",
    label: roleLabels.director,
    scope: { seccionalId: "cali", programaIds: ["psicologia", "derecho"] },
  },
  docente: {
    id: "usr-docente",
    name: "Docente SECUB",
    role: "docente",
    label: roleLabels.docente,
    scope: { seccionalId: "cali", docenteId: "usr-docente-psicologia" },
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
      courses: courseMeasurements.filter((course) => course.teacherId !== "usr-docente-psicologia"),
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
