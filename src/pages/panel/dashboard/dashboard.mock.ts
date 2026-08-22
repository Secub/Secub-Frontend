import {
  DEMO_DOCENTE_SECUB,
  buildDemoDocenteIdFromName,
  getCurrentMockUser,
  resolveDemoDocenteByName,
} from "../../../services/auth/mockUser";
import { getStudentsByCourse } from "../../../data/secubAcademicPrograms";
import { mockBackend } from "../../../services/mockBackend";
import { getCicloCatalogs } from "../ciclo/ciclo.mock";
import type {
  CourseMeasurement,
  DashboardCatalogs,
  DashboardData,
  DashboardUser,
  MeasurementCycle,
} from "./dashboard.types";
import { getBrowserSearchParams } from "../../../shared/browser";


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
  titulo?: string;
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
      const courseMeasurement = courseAssignments
        .map((assignment) => getMedicionForAssignment(mediciones, assignment, courseId, cycle.id))
        .find((measurement): measurement is PersistedMedicionDemo => Boolean(measurement));
      const expectedStudentIds = getStudentsByCourse(courseId).map((student) => student.id);
      const courseEvaluations = courseMeasurement?.evaluationsByCourse?.[courseId] ?? {};
      const evaluatedRa = assignedRaIds.filter(
        (raId) =>
          expectedStudentIds.length > 0 &&
          expectedStudentIds.every((studentId) => Boolean(courseEvaluations[studentId]?.[raId])),
      ).length;
      const measurementCompleted = Boolean(
        courseMeasurement?.completed || courseMeasurement?.isEvaluationLocked,
      );
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
        evaluatedRa,
        measurementCompleted,
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

//se comenta para evitar errores de build, ya que es una funcion no usada.
/* function getPersistedDashboardCycles(): MeasurementCycle[] {
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
} */

//se comenta para evitar errores de build, ya que es una funcion no usada.
/* function mergePersistedCycles(baseCycles: MeasurementCycle[]) {
  const persistedCycles = getPersistedDashboardCycles();
  const existingIds = new Set(baseCycles.map((cycle) => cycle.id));
  return [
    ...persistedCycles.filter((cycle) => !existingIds.has(cycle.id)),
    ...baseCycles,
  ];
} */

export const TARGET_COMPLIANCE = 70;

export const dashboardCatalogs: DashboardCatalogs = {
  seccionales: [],
  facultades: [],
  programas: [],
  planes: [],
  teachers: [],
  competences: [],
};

export const measurementCycles: MeasurementCycle[] = [];
export const courseMeasurements: CourseMeasurement[] = [];

export function getCurrentDashboardUser(): DashboardUser {
  const demoUser = getCurrentMockUser();

  return {
    id: demoUser.id,
    name: demoUser.nombre,
    email: demoUser.email,
    role: demoUser.role,
    label: demoUser.cargo,
    scope: {
      seccionalId: demoUser.scope.seccionalId,
      facultadId: demoUser.scope.facultadId,
      programaIds: demoUser.scope.programaId ? [demoUser.scope.programaId] : undefined,
      programaId: demoUser.scope.programaId,
      planId: demoUser.scope.planId,
      docenteId: demoUser.role === "docente" ? demoUser.id : undefined,
    },
  };
}

export function getDashboardData(): DashboardData {
  const params = getBrowserSearchParams();
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
      courses: courseMeasurements.filter((course) => course.teacherId !== DEMO_DOCENTE_SECUB.id),
    };
  }

  const persistedDashboardData = getPersistedDashboardData();

  if (persistedDashboardData) {
    return persistedDashboardData;
  }

  return {
    catalogs: dashboardCatalogs,
    cycles: [],
    courses: [],
  };
}
