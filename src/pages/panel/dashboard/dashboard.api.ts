import type { MeasurementContext } from "../../../services/measurements";
import type { DashboardData } from "./dashboard.types";

export function buildDashboardDataFromApi(
  context: MeasurementContext,
): DashboardData {
  const teachers = new Map<string, { id: string; name: string; email: string }>();
  context.courses.forEach((course) => {
    if (!course.teacherId) return;
    teachers.set(course.teacherId, {
      id: course.teacherId,
      name: course.teacherName,
      email: course.teacherEmail,
    });
  });

  return {
    catalogs: {
      seccionales: [{ id: context.scope.seccionalId, name: context.scope.seccionalNombre }],
      facultades: [{
        id: context.scope.facultadId,
        name: context.scope.facultadNombre,
        seccionalId: context.scope.seccionalId,
      }],
      programas: [{
        id: context.scope.programaId,
        name: context.scope.programaNombre,
        facultadId: context.scope.facultadId,
        seccionalId: context.scope.seccionalId,
      }],
      planes: context.planes.map((plan) => ({
        id: plan.id,
        name: plan.nombre,
        programaId: plan.programaId,
        estado: plan.estado,
      })),
      teachers: [...teachers.values()],
      competences: context.competencias.map((competence, competenceIndex) => ({
        id: competence.id,
        code: `C${competenceIndex + 1}`,
        name: competence.nombre ?? `Competencia ${competenceIndex + 1}`,
        description: competence.descripcion ?? "Sin descripción registrada.",
        learningResults: (competence.resultadosAprendizaje ?? []).flatMap((ra, raIndex) =>
          ra.id
            ? [{
                id: ra.id,
                code: `RA ${String(ra.numero ?? raIndex + 1).padStart(2, "0")}`,
                name: `Resultado de Aprendizaje ${ra.numero ?? raIndex + 1}`,
                description: ra.descripcion ?? "Sin descripción registrada.",
              }]
            : [],
        ),
      })),
    },
    cycles: context.ciclos.map((cycle) => ({
      id: cycle.id,
      name: cycle.nombre,
      seccionalId: cycle.seccionalId,
      facultadId: cycle.facultadId,
      programaId: cycle.programaId,
      planId: cycle.planId,
      period: cycle.periodo,
      startDate: cycle.fechaInicio,
      endDate: cycle.fechaFin,
      courseIds: cycle.cursoIds,
      hasImprovementPlan: cycle.hasImprovementPlan ?? false,
    })),
    courses: context.courses,
  };
}
