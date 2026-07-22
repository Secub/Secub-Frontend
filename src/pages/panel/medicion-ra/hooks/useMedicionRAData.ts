import { useMemo } from "react";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend } from "../../../../services/mockBackend";
import type { AsignacionRaDemoRecord, MedicionRaDemoState } from "../types/medicionRA.persistence.types";
import { buildCoursesFromRealAssignments, getSearchCourseId } from "../utils/medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "../utils/medicionRA.persistence";
import { useMockBackendVersion } from "./useMockBackendVersion";

export function useMedicionRAData() {
  const currentUser = useMemo(() => getCurrentMockUser(), []);
  const { ignoreNextBackendChangeRef } = useMockBackendVersion();

  const realAssignments = mockBackend.list<AsignacionRaDemoRecord>(
    "asignacionesRa",
    currentUser,
  );

  const availableCourses = realAssignments.length
    ? buildCoursesFromRealAssignments(currentUser)
    : [];

  const requestedCourseId = getSearchCourseId();
  const initialCourseId =
    requestedCourseId && availableCourses.some((course) => course.id === requestedCourseId)
      ? requestedCourseId
      : (availableCourses[0]?.id ?? "");

  const selectedCourse = availableCourses.find((item) => item.id === initialCourseId);
  const initialStateId = buildMedicionRaDemoStateId({
    userId: currentUser.id,
    cicloId: selectedCourse?.cycleId,
    courseId: initialCourseId,
  });
  const initialPersistedDemoState = mockBackend.getById<MedicionRaDemoState>(
    "medicionesRa",
    initialStateId,
    currentUser,
  );

  return {
    currentUser,
    ignoreNextBackendChangeRef,
    availableCourses,
    hasAvailableCourses: availableCourses.length > 0,
    initialCourseId,
    initialPersistedDemoState,
  };
}
