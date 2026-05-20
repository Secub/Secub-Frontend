import type { EvidenceState, EvaluationMatrix, ImprovementPlanState, InstrumentByRa } from "../medicion-ra.types";

export function buildMedicionRaDemoStateId({
  userId,
  cicloId,
  courseId,
}: {
  userId: string;
  cicloId?: string;
  courseId?: string;
}) {
  return ["medicion-ra-demo-state", userId, cicloId, courseId]
    .filter(Boolean)
    .join("-");
}

export function pickCourseEvaluationState(
  evaluationsByCourse: Record<string, EvaluationMatrix>,
  courseId: string,
) {
  const courseEvaluations = evaluationsByCourse[courseId];
  return courseEvaluations ? { [courseId]: courseEvaluations } : {};
}

export function pickCourseInstrumentState(
  instrumentsByCourse: Record<string, InstrumentByRa>,
  courseId: string,
) {
  const courseInstruments = instrumentsByCourse[courseId];
  return courseInstruments ? { [courseId]: courseInstruments } : {};
}

export function pickCourseCompetenceState<T extends EvidenceState | ImprovementPlanState>(
  state: Record<string, T>,
  courseId: string,
) {
  const coursePrefix = `${courseId}__`;

  return Object.entries(state).reduce<Record<string, T>>((acc, [key, value]) => {
    if (key.startsWith(coursePrefix)) acc[key] = value;
    return acc;
  }, {});
}
