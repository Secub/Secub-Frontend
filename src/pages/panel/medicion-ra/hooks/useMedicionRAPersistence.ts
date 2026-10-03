import { useCallback, useEffect } from "react";
import type { getCurrentUser } from "../../../../services/auth/currentUser";
import type {
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
} from "../medicion-ra.types";
import type { CourseMeasurementState } from "../types/medicionRA.persistence.types";
import { saveCourseMeasurement } from "../../../../services/measurements";
import type { resolveMedicionRaContextForCourse } from "../utils/medicionRA.assignments";
import {
  pickCourseCompetenceState,
  pickCourseEvaluationState,
  pickCourseInstrumentState,
} from "../utils/medicionRA.persistence";

function hasEvaluationProgress(evaluationsByCourse: Record<string, EvaluationMatrix>) {
  return Object.values(evaluationsByCourse).some((evaluations) =>
    Object.values(evaluations).some((raValues) =>
      Object.values(raValues).some((level) => Boolean(level)),
    ),
  );
}

function hasInstrumentProgress(instrumentsByCourse: Record<string, InstrumentByRa>) {
  return Object.values(instrumentsByCourse).some((instruments) =>
    Object.values(instruments).some((instrument) =>
      Boolean(instrument.description?.trim() || instrument.fileName?.trim()),
    ),
  );
}

function hasTextStateProgress<T extends object>(records: Record<string, T>) {
  return Object.values(records).some((record) =>
    Object.values(record as Record<string, unknown>).some(
      (value) => typeof value === "string" && Boolean(value.trim()),
    ),
  );
}

interface PersistSelectedCourseOptions {
  completedCompetenceIds?: string[];
  isEvaluationLocked?: boolean;
  completed?: boolean;
}

export function useMedicionRAPersistence({
  activeCompetenceId,
  completedCompetenceIds,
  currentUser,
  evaluationsByCourse,
  evidenceByCompetence,
  hydratedStateId,
  improvementByCompetence,
  instrumentsByCourse,
  isSelectedCourseLocked,
  medicionRaContext,
  courseMeasurementStateId,
  selectedCourse,
  selectedCourseId,
}: {
  activeCompetenceId: string;
  completedCompetenceIds: string[];
  currentUser: ReturnType<typeof getCurrentUser>;
  evaluationsByCourse: Record<string, EvaluationMatrix>;
  evidenceByCompetence: Record<string, EvidenceState>;
  hydratedStateId: string;
  improvementByCompetence: Record<string, ImprovementPlanState>;
  instrumentsByCourse: Record<string, InstrumentByRa>;
  isSelectedCourseLocked: boolean;
  medicionRaContext: ReturnType<typeof resolveMedicionRaContextForCourse>;
  courseMeasurementStateId: string;
  selectedCourse: CourseRecord;
  selectedCourseId: string;
}) {
  const persistSelectedCourse = useCallback(
    async (options: PersistSelectedCourseOptions = {}) => {
      if (hydratedStateId !== courseMeasurementStateId) return false;

      const courseEvaluations = pickCourseEvaluationState(
        evaluationsByCourse,
        selectedCourse.id,
      );
      const courseInstruments = pickCourseInstrumentState(
        instrumentsByCourse,
        selectedCourse.id,
      );
      const courseEvidence = pickCourseCompetenceState(
        evidenceByCompetence,
        selectedCourse.id,
      );
      const courseImprovementPlans = pickCourseCompetenceState(
        improvementByCompetence,
        selectedCourse.id,
      );
      const { cicloId, asignacionRaIds } = medicionRaContext;
      const nextCompletedCompetenceIds =
        options.completedCompetenceIds ?? completedCompetenceIds;
      const nextIsEvaluationLocked =
        options.isEvaluationLocked ?? isSelectedCourseLocked;
      const nextCompleted = options.completed ?? nextIsEvaluationLocked;

      const measurement: CourseMeasurementState =
      {
          id: courseMeasurementStateId,
          cicloId,
          asignacionRaId: asignacionRaIds[0],
          asignacionRaIds,
          selectedCourseId,
          activeCompetenceId,
          evaluationsByCourse: courseEvaluations,
          instrumentsByCourse: courseInstruments,
          evidenceByCompetence: courseEvidence,
          improvementByCompetence: courseImprovementPlans,
          completedCompetenceIds: nextCompletedCompetenceIds,
          isEvaluationLocked: nextIsEvaluationLocked,
          completed: nextCompleted,
          userId: currentUser.id,
          seccionalId: selectedCourse.seccionalId,
          facultadId: selectedCourse.facultadId,
          programaId: selectedCourse.programaId,
          planId: selectedCourse.planId,
        };
      if (!cicloId) return false;
      await saveCourseMeasurement(cicloId, selectedCourse.id, measurement);

      return true;
    },
    [
      activeCompetenceId,
      completedCompetenceIds,
      currentUser,
      evaluationsByCourse,
      evidenceByCompetence,
      hydratedStateId,
      improvementByCompetence,
      instrumentsByCourse,
      isSelectedCourseLocked,
      medicionRaContext,
      courseMeasurementStateId,
      selectedCourse,
      selectedCourseId,
    ],
  );

  useEffect(() => {
    const courseEvaluations = pickCourseEvaluationState(
      evaluationsByCourse,
      selectedCourse.id,
    );
    const courseInstruments = pickCourseInstrumentState(
      instrumentsByCourse,
      selectedCourse.id,
    );
    const courseEvidence = pickCourseCompetenceState(
      evidenceByCompetence,
      selectedCourse.id,
    );
    const courseImprovementPlans = pickCourseCompetenceState(
      improvementByCompetence,
      selectedCourse.id,
    );
    const hasProgress =
      completedCompetenceIds.length > 0 ||
      hasEvaluationProgress(courseEvaluations) ||
      hasInstrumentProgress(courseInstruments) ||
      hasTextStateProgress(courseEvidence) ||
      hasTextStateProgress(courseImprovementPlans) ||
      isSelectedCourseLocked;

    if (!hasProgress || hydratedStateId !== courseMeasurementStateId) return;

    const timeoutId = window.setTimeout(
      () => {
        void persistSelectedCourse().catch(() => undefined);
      },
      isSelectedCourseLocked ? 0 : 500,
    );

    return () => window.clearTimeout(timeoutId);
  }, [
    completedCompetenceIds,
    evaluationsByCourse,
    evidenceByCompetence,
    hydratedStateId,
    improvementByCompetence,
    instrumentsByCourse,
    isSelectedCourseLocked,
    courseMeasurementStateId,
    persistSelectedCourse,
    selectedCourse.id,
  ]);

  return {
    persistSelectedCourse,
  };
}
