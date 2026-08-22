import { useCallback, useEffect } from "react";
import type { MutableRefObject } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import type { getCurrentMockUser } from "../../../../services/auth/mockUser";
import type {
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
} from "../medicion-ra.types";
import type { MedicionRaDemoState } from "../types/medicionRA.persistence.types";
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
  ignoreNextBackendChangeRef,
  improvementByCompetence,
  instrumentsByCourse,
  isSelectedCourseLocked,
  medicionRaContext,
  medicionRaDemoStateId,
  selectedCourse,
  selectedCourseId,
}: {
  activeCompetenceId: string;
  completedCompetenceIds: string[];
  currentUser: ReturnType<typeof getCurrentMockUser>;
  evaluationsByCourse: Record<string, EvaluationMatrix>;
  evidenceByCompetence: Record<string, EvidenceState>;
  hydratedStateId: string;
  ignoreNextBackendChangeRef: MutableRefObject<boolean>;
  improvementByCompetence: Record<string, ImprovementPlanState>;
  instrumentsByCourse: Record<string, InstrumentByRa>;
  isSelectedCourseLocked: boolean;
  medicionRaContext: ReturnType<typeof resolveMedicionRaContextForCourse>;
  medicionRaDemoStateId: string;
  selectedCourse: CourseRecord;
  selectedCourseId: string;
}) {
  const persistSelectedCourse = useCallback(
    (options: PersistSelectedCourseOptions = {}) => {
      if (hydratedStateId !== medicionRaDemoStateId) return false;

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
      const { relatedCiclo, cicloId, asignacionRaIds } = medicionRaContext;
      const nextCompletedCompetenceIds =
        options.completedCompetenceIds ?? completedCompetenceIds;
      const nextIsEvaluationLocked =
        options.isEvaluationLocked ?? isSelectedCourseLocked;
      const nextCompleted = options.completed ?? nextIsEvaluationLocked;

      ignoreNextBackendChangeRef.current = true;
      mockBackend.upsert<MedicionRaDemoState>(
        "medicionesRa",
        {
          id: medicionRaDemoStateId,
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
          seccionalId: selectedCourse.seccionalId ?? relatedCiclo?.seccionalId,
          facultadId: selectedCourse.facultadId ?? relatedCiclo?.facultadId,
          programaId: selectedCourse.programaId ?? relatedCiclo?.programaId,
          planId: selectedCourse.planId ?? relatedCiclo?.planId,
        },
        currentUser,
      );

      return true;
    },
    [
      activeCompetenceId,
      completedCompetenceIds,
      currentUser,
      evaluationsByCourse,
      evidenceByCompetence,
      hydratedStateId,
      ignoreNextBackendChangeRef,
      improvementByCompetence,
      instrumentsByCourse,
      isSelectedCourseLocked,
      medicionRaContext,
      medicionRaDemoStateId,
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

    if (!hasProgress || hydratedStateId !== medicionRaDemoStateId) return;

    const timeoutId = window.setTimeout(
      () => persistSelectedCourse(),
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
    medicionRaDemoStateId,
    persistSelectedCourse,
    selectedCourse.id,
  ]);

  return {
    persistSelectedCourse,
  };
}
