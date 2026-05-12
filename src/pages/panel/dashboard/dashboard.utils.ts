import { TARGET_COMPLIANCE } from "./dashboard.mock";
import type {
  CourseMeasurement,
  CompetenceCatalog,
  DashboardCatalogs,
  DashboardFiltersState,
  DashboardUser,
  EnrichedCourse,
  EnrichedCycle,
  EnrichedRaResult,
  MeasurementCycle,
} from "./dashboard.types";

export const INITIAL_DASHBOARD_FILTERS: DashboardFiltersState = {
  seccionalId: "",
  facultadId: "",
  programaId: "",
  planId: "",
  cycleId: "",
  status: "",
  competenceId: "",
  teacherId: "",
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00`));
}

export function getCourseProgress(course: CourseMeasurement) {
  if (!course.totalRa) return 0;
  return Math.round((course.evaluatedRa / course.totalRa) * 100);
}

export function getCourseStatus(course: CourseMeasurement) {
  return getCourseProgress(course) >= 100 ? "finalizado" : "pendiente";
}

export function getCycleCourses(cycle: MeasurementCycle, courses: CourseMeasurement[]) {
  return cycle.courseIds
    .map((courseId) => courses.find((course) => course.id === courseId))
    .filter((course): course is CourseMeasurement => Boolean(course));
}

export function getCycleProgress(cycle: MeasurementCycle, courses: CourseMeasurement[]) {
  const cycleCourses = getCycleCourses(cycle, courses);
  const totalRa = cycleCourses.reduce((total, course) => total + course.totalRa, 0);
  const evaluatedRa = cycleCourses.reduce((total, course) => total + course.evaluatedRa, 0);

  return totalRa ? Math.round((evaluatedRa / totalRa) * 100) : 0;
}

export function enrichCycles(
  cycles: MeasurementCycle[],
  courses: CourseMeasurement[],
  catalogs: DashboardCatalogs,
): EnrichedCycle[] {
  return cycles.map((cycle) => {
    const cycleCourses = getCycleCourses(cycle, courses);
    const totalRa = cycleCourses.reduce((total, course) => total + course.totalRa, 0);
    const evaluatedRa = cycleCourses.reduce((total, course) => total + course.evaluatedRa, 0);
    const progress = totalRa ? Math.round((evaluatedRa / totalRa) * 100) : 0;
    const pendingCourses = cycleCourses.filter((course) => getCourseStatus(course) === "pendiente").length;

    return {
      ...cycle,
      seccionalName: catalogs.seccionales.find((item) => item.id === cycle.seccionalId)?.name ?? "Sin seccional",
      facultadName: catalogs.facultades.find((item) => item.id === cycle.facultadId)?.name ?? "Sin facultad",
      programaName: catalogs.programas.find((item) => item.id === cycle.programaId)?.name ?? "Sin programa",
      planName: catalogs.planes.find((item) => item.id === cycle.planId)?.name ?? "Sin plan",
      status: progress >= 100 ? "finalizado" : "pendiente",
      progress,
      totalRa,
      evaluatedRa,
      totalCourses: cycleCourses.length,
      pendingCourses,
      completedCourses: cycleCourses.length - pendingCourses,
    };
  });
}

export function enrichCourses(
  courses: CourseMeasurement[],
  cycles: MeasurementCycle[],
  catalogs: DashboardCatalogs,
): EnrichedCourse[] {
  return courses.map((course) => {
    const cycle = cycles.find((item) => item.id === course.cycleId);
    const teacher = catalogs.teachers.find((item) => item.id === course.teacherId);
    const progress = getCourseProgress(course);

    return {
      ...course,
      cycleName: cycle?.name ?? "Sin ciclo",
      period: cycle?.period ?? "Sin periodo",
      seccionalName: catalogs.seccionales.find((item) => item.id === course.seccionalId)?.name ?? "Sin seccional",
      facultadName: catalogs.facultades.find((item) => item.id === course.facultadId)?.name ?? "Sin facultad",
      programaName: catalogs.programas.find((item) => item.id === course.programaId)?.name ?? "Sin programa",
      planName: catalogs.planes.find((item) => item.id === course.planId)?.name ?? "Sin plan",
      teacherName: teacher?.name ?? "Sin docente",
      teacherEmail: teacher?.email ?? "",
      competences: course.competenceIds
        .map((competenceId) => catalogs.competences.find((item) => item.id === competenceId))
        .filter((item): item is CompetenceCatalog => Boolean(item)),
      status: progress >= 100 ? "finalizado" : "pendiente",
      pendingRa: Math.max(course.totalRa - course.evaluatedRa, 0),
      progress,
    };
  });
}

export function applyUserScopeToCycles(cycles: EnrichedCycle[], user: DashboardUser) {
  if (user.role === "admin") return cycles;

  return cycles.filter((cycle) => {
    if (user.scope.seccionalId && cycle.seccionalId !== user.scope.seccionalId) return false;
    if (user.scope.facultadId && cycle.facultadId !== user.scope.facultadId) return false;
    if (user.scope.programaIds?.length && !user.scope.programaIds.includes(cycle.programaId)) return false;
    return true;
  });
}

export function applyUserScopeToCourses(courses: EnrichedCourse[], user: DashboardUser) {
  if (user.role === "admin") return courses;

  if (user.role === "docente") {
    return courses.filter((course) => course.teacherId === user.scope.docenteId);
  }

  return courses.filter((course) => {
    if (user.scope.seccionalId && course.seccionalId !== user.scope.seccionalId) return false;
    if (user.scope.facultadId && course.facultadId !== user.scope.facultadId) return false;
    if (user.scope.programaIds?.length && !user.scope.programaIds.includes(course.programaId)) return false;
    return true;
  });
}

export function applyDashboardFiltersToCycles(
  cycles: EnrichedCycle[],
  filters: DashboardFiltersState,
) {
  return cycles.filter((cycle) => {
    if (filters.seccionalId && cycle.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && cycle.facultadId !== filters.facultadId) return false;
    if (filters.programaId && cycle.programaId !== filters.programaId) return false;
    if (filters.planId && cycle.planId !== filters.planId) return false;
    if (filters.cycleId && cycle.id !== filters.cycleId) return false;
    if (filters.status && cycle.status !== filters.status) return false;
    return true;
  });
}

export function applyDashboardFiltersToCourses(
  courses: EnrichedCourse[],
  filters: DashboardFiltersState,
) {
  return courses.filter((course) => {
    if (filters.seccionalId && course.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && course.facultadId !== filters.facultadId) return false;
    if (filters.programaId && course.programaId !== filters.programaId) return false;
    if (filters.planId && course.planId !== filters.planId) return false;
    if (filters.cycleId && course.cycleId !== filters.cycleId) return false;
    if (filters.status && course.status !== filters.status) return false;
    if (filters.competenceId && !course.competenceIds.includes(filters.competenceId)) return false;
    if (filters.teacherId && course.teacherId !== filters.teacherId) return false;
    return true;
  });
}

export function getRaResultsForCourses(
  courses: EnrichedCourse[],
  catalogs: DashboardCatalogs,
): EnrichedRaResult[] {
  return courses.flatMap((course) =>
    course.results.map((result) => {
      const competence = catalogs.competences.find((item) =>
        item.learningResults.some((ra) => ra.id === result.raId),
      );
      const ra = competence?.learningResults.find((item) => item.id === result.raId);
      const compliance = result.totalStudents
        ? Math.round((result.approvedStudents / result.totalStudents) * 100)
        : 0;
      const reachedTarget = compliance >= TARGET_COMPLIANCE;

      return {
        key: `${course.id}-${result.raId}`,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        teacherName: course.teacherName,
        competenceId: competence?.id ?? "sin-competencia",
        competenceCode: competence?.code ?? "SC",
        competenceName: competence?.name ?? "Sin competencia",
        raId: result.raId,
        raCode: ra?.code ?? "RA",
        raName: ra?.name ?? "Resultado de aprendizaje",
        raDescription: ra?.description ?? "Sin descripción registrada.",
        totalStudents: result.totalStudents,
        approvedStudents: result.approvedStudents,
        notApprovedStudents: result.notApprovedStudents,
        compliance,
        status: reachedTarget ? "aprobado" : "no-aprobado",
        reachedTarget,
        instrumentFile: result.instrumentFile,
        evidenceFile: result.evidenceFile,
        improvementPlanFile: result.improvementPlanFile,
        improvementPlanSummary: result.improvementPlanSummary,
      };
    }),
  );
}

export function getAvailableCompetences(courses: EnrichedCourse[], catalogs: DashboardCatalogs) {
  const competenceIds = new Set(courses.flatMap((course) => course.competenceIds));
  return catalogs.competences.filter((competence) => competenceIds.has(competence.id));
}

export function getDashboardMetrics(courses: EnrichedCourse[], cycles: EnrichedCycle[]) {
  const activeCycle = cycles.find((cycle) => cycle.status === "pendiente") ?? cycles[0];
  const totalRa = courses.reduce((total, course) => total + course.totalRa, 0);
  const evaluatedRa = courses.reduce((total, course) => total + course.evaluatedRa, 0);
  const advance = totalRa ? Math.round((evaluatedRa / totalRa) * 100) : 0;

  return {
    totalCourses: courses.length,
    completedCourses: courses.filter((course) => course.status === "finalizado").length,
    pendingCourses: courses.filter((course) => course.status === "pendiente").length,
    activeCycles: cycles.filter((cycle) => cycle.status === "pendiente").length,
    completedCycles: cycles.filter((cycle) => cycle.status === "finalizado").length,
    advance,
    activeCycleName: activeCycle?.name ?? "Sin ciclo activo",
  };
}

export function simulateReportDownload(label: string) {
  // Integración futura: conectar aquí jsPDF, endpoint de reportes o servicio documental institucional.
  window.alert(`${label}: descarga simulada. Aquí se conectará la generación real del PDF.`);
}

export function simulateEvidenceDownload(fileName: string) {
  // Integración futura: reemplazar por descarga real desde repositorio de evidencias.
  window.alert(`Descarga simulada: ${fileName}`);
}

export function simulateTeacherEmail(course: EnrichedCourse) {
  // Integración futura: POST /notifications/measurement-delay con course.id y teacherId.
  window.alert(`Correo simulado para ${course.teacherName}: ${course.pendingRa} RA pendientes en ${course.name}.`);
}
