import type { MeasurementContext } from "../../../../services/measurements";
import { getBrowserSearchParams } from "../../../../shared/browser";
import type { Competence, CourseRecord } from "../medicion-ra.types";

export function getSearchCourseId() {
  return typeof window === "undefined" ? "" : getBrowserSearchParams().get("courseId") ?? "";
}

export function getSearchCycleId() {
  return typeof window === "undefined" ? "" : getBrowserSearchParams().get("cycleId") ?? "";
}

export function resolveMedicionRaContextForCourse(course?: CourseRecord) {
  return { cicloId: course?.cycleId, asignacionRaIds: course?.assignmentIds ?? [] };
}

export function buildCoursesFromMeasurementContext(context: MeasurementContext): CourseRecord[] {
  return context.courses.flatMap((course) => {
    const cycle = context.ciclos.find((item) => item.id === course.cycleId);
    const assignedRaIds = new Set(course.assignedRaIds);
    const competences = course.competenceIds.flatMap((competenceId, index): Competence[] => {
      const competence = context.competencias.find((item) => item.id === competenceId);
      if (!competence) return [];
      const learningResults = (competence.resultadosAprendizaje ?? [])
        .filter((result) => result.id && assignedRaIds.has(result.id))
        .map((result, resultIndex) => ({
          id: result.id as string,
          code: `RA${String(result.numero ?? resultIndex + 1).padStart(2, "0")}`,
          title: `Resultado de Aprendizaje ${result.numero ?? resultIndex + 1}`,
          description: result.descripcion ?? "Sin descripción registrada.",
        }));
      if (!learningResults.length) return [];
      return [{
        id: competence.id,
        code: `C${index + 1}`,
        title: competence.nombre ?? `Competencia ${index + 1}`,
        description: competence.descripcion ?? "Sin descripción registrada.",
        learningResults,
      }];
    });
    if (!competences.length) return [];
    return [{
      id: course.id,
      name: course.name,
      code: course.code,
      group: "Grupo institucional",
      credits: course.credits,
      period: cycle?.periodo ?? "",
      program: context.scope.programaNombre,
      studyPlan: context.planes.find((plan) => plan.id === course.planId)?.nombre ?? course.planId,
      measurementCycle: cycle?.nombre ?? course.cycleId,
      teacher: course.teacherName,
      teacherId: course.teacherId,
      teacherEmail: course.teacherEmail,
      cycleId: course.cycleId,
      seccionalId: course.seccionalId,
      facultadId: course.facultadId,
      programaId: course.programaId,
      planId: course.planId,
      competences,
      students: course.students,
      measurementCompleted: course.measurementCompleted,
    } satisfies CourseRecord];
  });
}
