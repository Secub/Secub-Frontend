import { useEffect } from "react";
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
  useEffect(() => {
    const courseEvidence = pickCourseCompetenceState(evidenceByCompetence, selectedCourse.id);
    const courseImprovementPlans = pickCourseCompetenceState(improvementByCompetence, selectedCourse.id);
    const hasProgress =
      completedCompetenceIds.length > 0 ||
      Object.keys(courseEvidence).length > 0 ||
      Object.keys(courseImprovementPlans).length > 0 ||
      isSelectedCourseLocked;

    if (!hasProgress || hydratedStateId !== medicionRaDemoStateId) return;

    const { relatedCiclo, cicloId, asignacionRaIds } = medicionRaContext;

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
        evaluationsByCourse: pickCourseEvaluationState(evaluationsByCourse, selectedCourse.id),
        instrumentsByCourse: pickCourseInstrumentState(instrumentsByCourse, selectedCourse.id),
        evidenceByCompetence: courseEvidence,
        improvementByCompetence: courseImprovementPlans,
        completedCompetenceIds,
        isEvaluationLocked: isSelectedCourseLocked,
        completed: isSelectedCourseLocked,
        userId: currentUser.id,
        seccionalId: selectedCourse.seccionalId ?? relatedCiclo?.seccionalId,
        facultadId: selectedCourse.facultadId ?? relatedCiclo?.facultadId,
        programaId: selectedCourse.programaId ?? relatedCiclo?.programaId,
        planId: selectedCourse.planId ?? relatedCiclo?.planId,
      },
      currentUser,
    );
  }, [
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
  ]);
}
