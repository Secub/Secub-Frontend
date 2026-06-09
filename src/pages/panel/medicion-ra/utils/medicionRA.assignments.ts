import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend } from "../../../../services/mockBackend";
import { getCicloCatalogs } from "../../ciclo/ciclo.mock";
import { mockCourses } from "../medicion-ra.mock";
import type { Competence, CourseRecord } from "../medicion-ra.types";
import type {
  AsignacionRaDemoRecord,
  CicloDemoRecord,
  CompetenciaDemoRecord,
} from "../types/medicionRA.persistence.types";

export function getCourseIdFromAssignment(asignacion: AsignacionRaDemoRecord) {
  return asignacion.cursoId ?? asignacion.cursoIds?.[0] ?? "";
}

export function getCompetenciaIdFromAssignment(asignacion: AsignacionRaDemoRecord) {
  return asignacion.competenciaRaId ?? asignacion.competenciaRaIds?.[0] ?? "";
}

export function getRaIdFromAssignment(asignacion: AsignacionRaDemoRecord) {
  return asignacion.resultadoAprendizajeId ?? asignacion.resultadoAprendizajeIds?.[0] ?? "";
}

function normalizeComparableText(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isAssignmentVisibleForDocente(
  asignacion: AsignacionRaDemoRecord,
  course: { docente?: string } | undefined,
  user: ReturnType<typeof getCurrentMockUser>,
) {
  if (asignacion.docenteId) return asignacion.docenteId === user.id;

  const docenteNombre = normalizeComparableText(asignacion.docenteNombre);
  const courseDocenteNombre = normalizeComparableText(course?.docente);
  const currentDocenteNombre = normalizeComparableText(user.nombre);

  // Fallback demo solo para asignaciones antiguas que todavía no tengan docenteId.
  // La lógica real debe depender del id institucional del docente.
  return Boolean(
    currentDocenteNombre &&
      (docenteNombre === currentDocenteNombre || courseDocenteNombre === currentDocenteNombre),
  );
}

export function getSearchCourseId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("courseId") ?? "";
}

export function resolveMedicionRaContextForCourse(course?: CourseRecord) {
  const cicloId = course?.cycleId;
  const relatedCiclo = cicloId ? mockBackend.getById<CicloDemoRecord>("ciclosMedicion", cicloId) : undefined;

  return {
    relatedCiclo,
    cicloId,
    asignacionRaIds: course?.assignmentIds ?? [],
  };
}

export function buildCoursesFromRealAssignments(user: ReturnType<typeof getCurrentMockUser>): CourseRecord[] {
  const assignments = mockBackend.list<AsignacionRaDemoRecord>("asignacionesRa", user);
  if (assignments.length === 0) return [];

  const cicloCatalogs = getCicloCatalogs();
  const competencias = mockBackend.list<CompetenciaDemoRecord>("competenciasRa", user);
  const cycles = mockBackend.list<CicloDemoRecord>("ciclosMedicion", user);
  const docenteAssignments = assignments.filter((assignment) => {
    const courseId = getCourseIdFromAssignment(assignment);
    const course = cicloCatalogs.cursos.find((item) => item.id === courseId);
    return isAssignmentVisibleForDocente(assignment, course, user);
  });

  const assignmentsByCourse = docenteAssignments.reduce<Record<string, AsignacionRaDemoRecord[]>>((acc, assignment) => {
    const courseId = getCourseIdFromAssignment(assignment);
    if (!courseId) return acc;
    const groupKey = `${assignment.cicloId ?? "sin-ciclo"}__${courseId}`;
    acc[groupKey] = [...(acc[groupKey] ?? []), assignment];
    return acc;
  }, {});

  const demoStudents = mockCourses[0]?.students ?? [];

  return Object.entries(assignmentsByCourse)
    .map(([, courseAssignments]): CourseRecord | null => {
      const courseId = getCourseIdFromAssignment(courseAssignments[0]);
      const course = cicloCatalogs.cursos.find((item) => item.id === courseId);
      if (!course) return null;

      const cycle = cycles.find((item) => item.id === courseAssignments[0]?.cicloId);
      const competenceGroups = courseAssignments.reduce<Record<string, AsignacionRaDemoRecord[]>>((acc, assignment) => {
        const competenciaId = getCompetenciaIdFromAssignment(assignment);
        if (!competenciaId) return acc;
        acc[competenciaId] = [...(acc[competenciaId] ?? []), assignment];
        return acc;
      }, {});

      const competences: Competence[] = Object.entries(competenceGroups)
        .map(([competenciaId, competenciaAssignments], index) => {
          const competencia = competencias.find((item) => item.id === competenciaId);
          if (!competencia) return null;

          const selectedRaIds = new Set(competenciaAssignments.map(getRaIdFromAssignment).filter(Boolean));
          const learningResults = (competencia.resultadosAprendizaje ?? [])
            .filter((ra) => selectedRaIds.has(ra.id))
            .map((ra, raIndex) => ({
              id: ra.id,
              code: `RA${String(ra.numero ?? raIndex + 1).padStart(2, "0")}`,
              title: `Resultado de Aprendizaje ${ra.numero ?? raIndex + 1}`,
              description: ra.descripcion ?? "Sin descripción registrada.",
            }));

          if (learningResults.length === 0) return null;

          return {
            id: competencia.id,
            code: `C${index + 1}`,
            title: competencia.nombre ?? `Competencia ${index + 1}`,
            description: competencia.descripcion ?? "Sin descripción registrada.",
            learningResults,
          } satisfies Competence;
        })
        .filter((item): item is Competence => Boolean(item));

      if (competences.length === 0) return null;

      return {
        id: course.id,
        name: course.nombre,
        code: course.codigo,
        group: "Grupo asignado",
        credits: course.creditos,
        period: cycle?.periodo ?? "Periodo del ciclo",
        program: course.programaId,
        studyPlan: course.planId,
        measurementCycle: cycle?.nombre ?? cycle?.id ?? "Ciclo de medición",
        teacher: courseAssignments[0]?.docenteNombre ?? course.docente,
        teacherId: courseAssignments[0]?.docenteId,
        teacherEmail: courseAssignments[0]?.docenteEmail,
        cycleId: cycle?.id ?? courseAssignments[0]?.cicloId,
        assignmentIds: courseAssignments.map((assignment) => assignment.id),
        seccionalId: courseAssignments[0]?.seccionalId ?? cycle?.seccionalId,
        facultadId: courseAssignments[0]?.facultadId ?? cycle?.facultadId,
        programaId: courseAssignments[0]?.programaId ?? course.programaId,
        planId: courseAssignments[0]?.planId ?? course.planId,
        competences,
        students: demoStudents,
      } satisfies CourseRecord;
    })
    .filter((item): item is CourseRecord => Boolean(item));
}
