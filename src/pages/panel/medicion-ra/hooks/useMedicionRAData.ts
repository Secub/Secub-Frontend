import { useMemo } from "react";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend } from "../../../../services/mockBackend";
import type { AsignacionRaDemoRecord, MedicionRaDemoState } from "../types/medicionRA.persistence.types";
import { buildCoursesFromRealAssignments, getSearchCourseId } from "../utils/medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "../utils/medicionRA.persistence";
import { useMockBackendVersion } from "./useMockBackendVersion";

export function useMedicionRAData() {
  const currentUser = useMemo(() => getCurrentMockUser(), []);
  const { backendVersion, ignoreNextBackendChangeRef } = useMockBackendVersion();

  const realAssignments = useMemo(
    () => mockBackend.list<AsignacionRaDemoRecord>("asignacionesRa", currentUser),
    [backendVersion, currentUser],
  );

  const hasRealAssignments = realAssignments.length > 0;

  const availableCourses = useMemo(() => {
    const realCourses = buildCoursesFromRealAssignments(currentUser);

    return realCourses;
  }, [backendVersion, currentUser, hasRealAssignments]);

  const initialCourseId = useMemo(() => {
    const requestedCourseId = getSearchCourseId();
    if (requestedCourseId && availableCourses.some((course) => course.id === requestedCourseId)) {
      return requestedCourseId;
    }

    return availableCourses[0]?.id ?? "";
  }, [availableCourses]);

  const initialPersistedDemoState = useMemo(() => {
    const course = availableCourses.find((item) => item.id === initialCourseId);
    const stateId = buildMedicionRaDemoStateId({
      userId: currentUser.id,
      cicloId: course?.cycleId,
      courseId: initialCourseId,
    });

    return mockBackend.getById<MedicionRaDemoState>("medicionesRa", stateId, currentUser);
  }, [availableCourses, backendVersion, currentUser.id, initialCourseId]);

  return {
    currentUser,
    backendVersion,
    ignoreNextBackendChangeRef,
    availableCourses,
    hasAvailableCourses: availableCourses.length > 0,
    initialCourseId,
    initialPersistedDemoState,
  };
}
