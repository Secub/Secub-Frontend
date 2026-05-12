import { TARGET_RA_PERCENTAGE } from "./dashboard-ra.mock";
import type {
  CourseMeasurement,
  CourseSummary,
  CycleSummary,
  DashboardCatalogs,
  DashboardFiltersState,
  DashboardUser,
  MeasurementCycle,
  RaResultRecord,
  RaResultSummary,
} from "./dashboard-ra.types";

export const INITIAL_DASHBOARD_FILTERS: DashboardFiltersState = {
  seccionalId: "",
  facultadId: "",
  programaId: "",
  cycleId: "",
  status: "",
  competenceId: "",
  teacherId: "",
};

export function calculatePercentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function getCourseStatus(course: CourseMeasurement) {
  return course.evaluatedRa >= course.totalRa ? "finalizado" : "pendiente";
}

export function isReportAvailable(progress: number) {
  return progress >= 100;
}

export function canViewMeasurementResult(course: CourseSummary) {
  return course.status === "finalizado";
}

export function getPendingRaCount(course: CourseMeasurement) {
  return Math.max(course.totalRa - course.evaluatedRa, 0);
}

export function applyRoleScopeToCycles(cycles: MeasurementCycle[], user: DashboardUser) {
  return cycles.filter((cycle) => {
    if (user.role === "admin") return true;
    if (user.scope.seccionalId && cycle.seccionalId !== user.scope.seccionalId) return false;
    if (user.scope.facultadId && cycle.facultadId !== user.scope.facultadId) return false;
    if (user.scope.programaIds?.length && !user.scope.programaIds.includes(cycle.programaId)) {
      return false;
    }
    return true;
  });
}

export function applyRoleScopeToCourses(courses: CourseMeasurement[], user: DashboardUser) {
  return courses.filter((course) => {
    if (user.role === "docente") {
      return course.teacherId === user.scope.teacherId;
    }

    if (user.role === "admin") return true;
    if (user.scope.seccionalId && course.seccionalId !== user.scope.seccionalId) return false;
    if (user.scope.facultadId && course.facultadId !== user.scope.facultadId) return false;
    if (user.scope.programaIds?.length && !user.scope.programaIds.includes(course.programaId)) {
      return false;
    }
    return true;
  });
}

export function applyDashboardFiltersToCycles(
  cycles: MeasurementCycle[],
  filters: DashboardFiltersState,
) {
  return cycles.filter((cycle) => {
    if (filters.seccionalId && cycle.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && cycle.facultadId !== filters.facultadId) return false;
    if (filters.programaId && cycle.programaId !== filters.programaId) return false;
    if (filters.cycleId && cycle.id !== filters.cycleId) return false;
    if (filters.status && cycle.status !== filters.status) return false;
    return true;
  });
}

export function applyDashboardFiltersToCourses(
  courses: CourseMeasurement[],
  cycles: MeasurementCycle[],
  filters: DashboardFiltersState,
) {
  const visibleCycleIds = new Set(cycles.map((cycle) => cycle.id));

  return courses.filter((course) => {
    if (!visibleCycleIds.has(course.cycleId)) return false;
    if (filters.teacherId && course.teacherId !== filters.teacherId) return false;
    if (filters.competenceId && !course.competenceIds.includes(filters.competenceId)) return false;
    return true;
  });
}

export function buildCourseSummaries(
  courses: CourseMeasurement[],
  cycles: MeasurementCycle[],
): CourseSummary[] {
  return courses.map((course) => {
    const cycle = cycles.find((item) => item.id === course.cycleId);

    return {
      ...course,
      cycleName: cycle?.name ?? "Ciclo no encontrado",
      cyclePeriod: cycle?.period ?? "Sin periodo",
      progress: calculatePercentage(course.evaluatedRa, course.totalRa),
      status: getCourseStatus(course),
    };
  });
}

export function buildCycleSummaries(
  cycles: MeasurementCycle[],
  courses: CourseMeasurement[],
): CycleSummary[] {
  return cycles.map((cycle) => {
    const cycleCourses = courses.filter((course) => course.cycleId === cycle.id);
    const totalRa = cycleCourses.reduce((sum, course) => sum + course.totalRa, 0);
    const evaluatedRa = cycleCourses.reduce((sum, course) => sum + course.evaluatedRa, 0);
    const progress = calculatePercentage(evaluatedRa, totalRa);
    const pendingCourses = cycleCourses.filter((course) => getCourseStatus(course) === "pendiente").length;
    const finishedCourses = cycleCourses.filter((course) => getCourseStatus(course) === "finalizado").length;

    return {
      ...cycle,
      progress,
      totalRa,
      evaluatedRa,
      totalCourses: cycleCourses.length,
      pendingCourses,
      finishedCourses,
      status: progress >= 100 ? "finalizado" : "pendiente",
    };
  });
}

export function buildRaResultSummaries(
  records: RaResultRecord[],
  courses: CourseMeasurement[],
  catalogs: DashboardCatalogs,
): RaResultSummary[] {
  return records.flatMap((record) => {
    const course = courses.find((item) => item.id === record.courseId);
    const competence = catalogs.competences.find((item) => item.id === record.competenceId);
    const ra = catalogs.learningResults.find((item) => item.id === record.raId);

    if (!course || !competence || !ra) return [];

    const fulfillment = calculatePercentage(record.approvedStudents, record.totalStudents);

    return {
      ...record,
      courseName: course.name,
      courseCode: course.code,
      teacherName: course.teacherName,
      competenceCode: competence.code,
      competenceName: competence.name,
      raCode: ra.code,
      raName: ra.name,
      raDescription: ra.description,
      fulfillment,
      status: fulfillment >= TARGET_RA_PERCENTAGE ? "aprobado" : "no-aprobado",
    };
  });
}

export function getScopedCatalogs(
  catalogs: DashboardCatalogs,
  cycles: MeasurementCycle[],
  courses: CourseMeasurement[],
) {
  const seccionalIds = new Set(cycles.map((cycle) => cycle.seccionalId));
  const facultadIds = new Set(cycles.map((cycle) => cycle.facultadId));
  const programaIds = new Set(cycles.map((cycle) => cycle.programaId));
  const teacherIds = new Set(courses.map((course) => course.teacherId));
  const competenceIds = new Set(courses.flatMap((course) => course.competenceIds));

  return {
    seccionales: catalogs.seccionales.filter((item) => seccionalIds.has(item.id)),
    facultades: catalogs.facultades.filter((item) => facultadIds.has(item.id)),
    programas: catalogs.programas.filter((item) => programaIds.has(item.id)),
    teachers: catalogs.teachers.filter((item) => teacherIds.has(item.id)),
    competences: catalogs.competences.filter((item) => competenceIds.has(item.id)),
  };
}

export function filterOptionsByParent(
  catalogs: DashboardCatalogs,
  scopedCycles: MeasurementCycle[],
  scopedCourses: CourseMeasurement[],
  filters: DashboardFiltersState,
) {
  const scoped = getScopedCatalogs(catalogs, scopedCycles, scopedCourses);

  const seccionales = scoped.seccionales;
  const facultades = scoped.facultades.filter((facultad) => {
    if (filters.seccionalId && facultad.seccionalId !== filters.seccionalId) return false;
    return true;
  });
  const programas = scoped.programas.filter((programa) => {
    if (filters.seccionalId && programa.seccionalId !== filters.seccionalId) return false;
    if (filters.facultadId && programa.facultadId !== filters.facultadId) return false;
    return true;
  });
  const cycleIds = new Set(
    scopedCycles
      .filter((cycle) => {
        if (filters.seccionalId && cycle.seccionalId !== filters.seccionalId) return false;
        if (filters.facultadId && cycle.facultadId !== filters.facultadId) return false;
        if (filters.programaId && cycle.programaId !== filters.programaId) return false;
        return true;
      })
      .map((cycle) => cycle.id),
  );
  const teachers = scoped.teachers.filter((teacher) =>
    scopedCourses.some((course) => course.teacherId === teacher.id && cycleIds.has(course.cycleId)),
  );

  return {
    seccionales,
    facultades,
    programas,
    cycles: scopedCycles.filter((cycle) => cycleIds.has(cycle.id)),
    teachers,
    competences: scoped.competences,
  };
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function createMockDownload(fileName: string) {
  const blob = new Blob(
    [
      "SECUB - Simulación de descarga\n",
      `Archivo: ${fileName}\n`,
      "Esta acción queda preparada para conectar el servicio real de generación o descarga más adelante.\n",
    ],
    { type: "text/plain;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.replace(/\.pdf$/i, ".txt").replace(/\.zip$/i, ".txt");
  link.click();
  URL.revokeObjectURL(url);
}

export function getProgramName(catalogs: DashboardCatalogs, programaId: string) {
  return catalogs.programas.find((programa) => programa.id === programaId)?.nombre ?? "Programa no encontrado";
}

export function getFacultyName(catalogs: DashboardCatalogs, facultadId: string) {
  return catalogs.facultades.find((facultad) => facultad.id === facultadId)?.nombre ?? "Facultad no encontrada";
}
