import type { CentralMockUser } from "../../../../services/auth/mockUser";
import { mockBackend } from "../../../../services/mockBackend";
import type { CourseMeasurementSummary, CourseRecord } from "../medicion-ra.types";
import { getCourseMeasurementSummary } from "../medicion-ra.utils";
import type { MedicionRaDemoState } from "../types/medicionRA.persistence.types";
import { buildCoursesFromRealAssignments, resolveMedicionRaContextForCourse } from "./medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "./medicionRA.persistence";

export interface DocenteMeasurementOverview {
  courses: CourseRecord[];
  summaries: CourseMeasurementSummary[];
}

export function getDocenteMeasurementOverview(user: CentralMockUser): DocenteMeasurementOverview {
  const courses = buildCoursesFromRealAssignments(user);
  const summaries = courses.map((course) => {
    const courseContext = resolveMedicionRaContextForCourse(course);
    const stateId = buildMedicionRaDemoStateId({
      userId: user.id,
      cicloId: courseContext.cicloId,
      courseId: course.id,
    });
    const state = mockBackend.getById<MedicionRaDemoState>("medicionesRa", stateId, user);

    return getCourseMeasurementSummary({
      course,
      evaluations: state?.evaluationsByCourse?.[course.id],
      instruments: state?.instrumentsByCourse?.[course.id],
      evidenceByCompetence: state?.evidenceByCompetence ?? {},
      isLocked: state?.isEvaluationLocked ?? false,
    });
  });

  return { courses, summaries };
}
