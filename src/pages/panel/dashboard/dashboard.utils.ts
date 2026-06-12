import { TARGET_COMPLIANCE } from "./dashboard.mock";
import type {
  CourseMeasurement,
  CompetenceCatalog,
  DashboardCatalogs,
  DashboardFiltersState,
  DashboardUser,
  DirectorCycleCompletionNotificationPayload,
  EnrichedCourse,
  EnrichedCycle,
  EnrichedRaResult,
  MeasurementCycle,
  PlanCatalog,
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

export function formatPlanName(plan: PlanCatalog | undefined) {
  if (!plan) return "Sin plan";
  return plan.estado === "inactivo" ? `${plan.name} (Inactivo)` : plan.name;
}

export function getActivePlansByProgram(catalogs: DashboardCatalogs, programaId: string) {
  return catalogs.planes.filter(
    (plan) => plan.programaId === programaId && plan.estado === "activo",
  );
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
      planName: formatPlanName(catalogs.planes.find((item) => item.id === cycle.planId)),
      planEstado: catalogs.planes.find((item) => item.id === cycle.planId)?.estado ?? "inactivo",
      status: progress >= 100 && Boolean(cycle.hasImprovementPlan) ? "finalizado" : "pendiente",
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
      planName: formatPlanName(catalogs.planes.find((item) => item.id === course.planId)),
      planEstado: catalogs.planes.find((item) => item.id === course.planId)?.estado ?? "inactivo",
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

function normalizeTextForScope(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
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
    const normalizedUserName = normalizeTextForScope(user.name);
    return courses.filter((course) => {
      if (user.scope.docenteId && course.teacherId === user.scope.docenteId) return true;
      return Boolean(normalizedUserName && normalizeTextForScope(course.teacherName) === normalizedUserName);
    });
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
  return courses.flatMap((course) => {
    const measuredResults = course.results.map((result) => {
      const competence = result.competenciaId
        ? catalogs.competences.find((item) => item.id === result.competenciaId)
        : catalogs.competences.find((item) =>
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
        hasMeasurement: true,
        measurementStatus: "finalizado",
        instrumentFile: result.instrumentFile,
        instrumentDescription: result.instrumentDescription,
        evidenceFile: result.evidenceFile,
        improvementPlanFile: result.improvementPlanFile,
        improvementPlanSummary: result.improvementPlanSummary,
      } satisfies EnrichedRaResult;
    });

    const measuredRaIds = new Set(course.results.map((result) => result.raId));
    const assignedRaIds = course.assignedRaIds ?? course.results.map((result) => result.raId);
    const pendingResults = assignedRaIds
      .filter((raId) => !measuredRaIds.has(raId))
      .map((raId) => {
        const competence = catalogs.competences.find((item) =>
          course.competenceIds.includes(item.id) && item.learningResults.some((ra) => ra.id === raId),
        ) ?? catalogs.competences.find((item) => item.learningResults.some((ra) => ra.id === raId));
        const ra = competence?.learningResults.find((item) => item.id === raId);

        return {
          key: `${course.id}-${raId}-pendiente`,
          courseId: course.id,
          courseName: course.name,
          courseCode: course.code,
          teacherName: course.teacherName,
          competenceId: competence?.id ?? "sin-competencia",
          competenceCode: competence?.code ?? "SC",
          competenceName: competence?.name ?? "Sin competencia",
          raId,
          raCode: ra?.code ?? "RA",
          raName: ra?.name ?? "Resultado de aprendizaje",
          raDescription: ra?.description ?? "Sin descripción registrada.",
          totalStudents: 0,
          approvedStudents: 0,
          notApprovedStudents: 0,
          compliance: 0,
          status: "no-aprobado",
          reachedTarget: false,
          hasMeasurement: false,
          measurementStatus: "pendiente",
          instrumentFile: "Sin instrumento registrado",
          evidenceFile: "Sin evidencia registrada",
        } satisfies EnrichedRaResult;
      });

    return [...measuredResults, ...pendingResults];
  });
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

export interface MeasurementReminderEmailPayload {
  courseId: string;
  teacherId?: string;
  teacherEmail?: string;
  cicloId?: string;
  pendingRa?: number;
  courseName?: string;
}

export function requestMeasurementReminderEmail(payload: MeasurementReminderEmailPayload) {
  // TODO: reemplazar esta simulación por backend/directorio institucional cuando exista el servicio real.
  // El backend deberá resolver destinatario institucional, enviar recordatorio y registrar trazabilidad.
  window.alert(
    `Solicitud simulada de recordatorio: curso ${payload.courseName ?? payload.courseId}, ${payload.pendingRa ?? 0} RA pendientes.`,
  );
}

export function notifyTeacherMeasurementReminder(course: EnrichedCourse) {
  requestMeasurementReminderEmail({
    courseId: course.id,
    teacherId: course.teacherId,
    teacherEmail: course.teacherEmail || undefined,
    cicloId: course.cycleId,
    pendingRa: course.pendingRa,
    courseName: course.name,
  });
}


export function syncDashboardFiltersByPlan(
  filters: DashboardFiltersState,
  planId: string,
  catalogs: DashboardCatalogs,
): DashboardFiltersState {
  const plan = catalogs.planes.find((item) => item.id === planId);

  if (!plan || plan.estado !== "activo") {
    return {
      ...filters,
      planId,
      cycleId: "",
    };
  }

  const programa = catalogs.programas.find((item) => item.id === plan.programaId);

  return {
    ...filters,
    seccionalId: programa?.seccionalId ?? filters.seccionalId,
    facultadId: programa?.facultadId ?? filters.facultadId,
    programaId: plan.programaId,
    planId,
    cycleId: "",
  };
}

export function syncDashboardFiltersByCycle(
  filters: DashboardFiltersState,
  cycle: EnrichedCycle,
): DashboardFiltersState {
  return {
    ...filters,
    seccionalId: cycle.seccionalId,
    facultadId: cycle.facultadId,
    programaId: cycle.programaId,
    planId: cycle.planId,
    cycleId: cycle.id,
  };
}

const DIRECTOR_COMPLETION_NOTIFICATION_KEY = "secub-dashboard-director-cycle-completion";

function getDirectorCompletionNotificationKey(cycleId: string) {
  return `${DIRECTOR_COMPLETION_NOTIFICATION_KEY}:${cycleId}`;
}

function hasDirectorCompletionNotificationRequest(cycleId: string) {
  try {
    return Boolean(window.localStorage.getItem(getDirectorCompletionNotificationKey(cycleId)));
  } catch {
    // Si localStorage no está disponible, no se bloquea el Dashboard.
    return false;
  }
}

function markDirectorCompletionNotificationRequest(cycleId: string) {
  try {
    // Solución provisional de frontend para evitar múltiples llamadas mientras no exista backend.
    // A futuro debe reemplazarse por un estado persistido desde backend, por ejemplo:
    // completionNotificationSent, directorNotifiedAt o el campo institucional que defina la API.
    window.localStorage.setItem(getDirectorCompletionNotificationKey(cycleId), new Date().toISOString());
  } catch {
    // Si localStorage no está disponible, se permite continuar sin interrumpir la experiencia.
  }
}

export function shouldNotifyDirectorCycleCompletion(cycle: EnrichedCycle) {
  if (cycle.progress < 100 || cycle.hasImprovementPlan) return false;
  return !hasDirectorCompletionNotificationRequest(cycle.id);
}

export function buildDirectorCycleCompletionPayload(
  cycle: EnrichedCycle,
): DirectorCycleCompletionNotificationPayload {
  return {
    cycleId: cycle.id,
    academicProgramId: cycle.programaId,
    planId: cycle.planId,
    cycleName: cycle.name,
    period: cycle.period,
    progress: cycle.progress,
    totalCourses: cycle.totalCourses,
    completedCourses: cycle.completedCourses,
  };
}

export function notifyDirectorCycleCompletionService(
  payload: DirectorCycleCompletionNotificationPayload,
) {
  // Punto de integración futura con backend.
  // Cuando exista el endpoint/directorio institucional, esta función deberá:
  // 1. Consultar la Jefatura de programa asociada al programa académico usando payload.academicProgramId.
  // 2. Obtener su correo institucional desde el directorio o servicio de usuarios.
  // 3. Enviar la notificación de cierre de fase del ciclo completado.
  // 4. Registrar en backend que la notificación ya fue enviada para evitar duplicados
  //    mediante un campo persistido como completionNotificationSent o directorNotifiedAt.
  //
  // No se inventan correos ni se simula un envío real desde frontend.
  console.info(
    "[SECUB] Integración pendiente: notificación a la Jefatura de programa por ciclo completado.",
    payload,
  );
}

export function requestDirectorCycleCompletionNotification(cycle: EnrichedCycle) {
  const payload = buildDirectorCycleCompletionPayload(cycle);

  notifyDirectorCycleCompletionService(payload);
  markDirectorCompletionNotificationRequest(cycle.id);
}

export function simulateImprovementPlanAction(cycle: EnrichedCycle) {
  // Integración futura: reemplazar por navegación o endpoint real del módulo Plan de mejora.
  window.alert(
    `Plan de mejora - ${cycle.name}: integración pendiente con el módulo o endpoint institucional correspondiente.`,
  );
}
