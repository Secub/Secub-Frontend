import { useMemo } from "react";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend } from "../../../../services/mockBackend";
import type { AsignacionRaDemoRecord, MedicionRaDemoState } from "../types/medicionRA.persistence.types";
import { buildCoursesFromRealAssignments, getSearchCourseId, getSearchCycleId } from "../utils/medicionRA.assignments";
import { buildMedicionRaDemoStateId } from "../utils/medicionRA.persistence";
import { useMockBackendVersion } from "./useMockBackendVersion";

export function useMedicionRAData() {
  const currentUser = useMemo(() => getCurrentMockUser(), []);
  const { backendVersion, ignoreNextBackendChangeRef } = useMockBackendVersion();

  // `mockBackend.list`/`buildCoursesFromRealAssignments` releen y parsean el storage,
  // devolviendo arrays y objetos nuevos en cada llamada. Sin memoizar, `availableCourses`
  // cambia de referencia en cada render y arrastra esa inestabilidad a todo lo que se
  // deriva de el (selectedCourse, etc.), lo que dispara de mas el efecto de hidratacion
  // de la medicion y pisa cambios locales aun no guardados (p. ej. al avanzar de
  // competencia). Se memoiza igual que persistedDemoState: solo se relee cuando cambia
  // el usuario o cuando el backend realmente cambio (backendVersion).
  const availableCourses = useMemo(() => {
    const realAssignments = mockBackend.list<AsignacionRaDemoRecord>(
      "asignacionesRa",
      currentUser,
    );

    return realAssignments.length ? buildCoursesFromRealAssignments(currentUser) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, backendVersion]);

  const requestedCourseId = getSearchCourseId();
  const requestedCycleId = getSearchCycleId();
  const initialCourseId =
    requestedCourseId && requestedCycleId && availableCourses.some(
      (course) => course.id === requestedCourseId && course.cycleId === requestedCycleId,
    )
      ? requestedCourseId
      : "";

  const selectedCourse = availableCourses.find(
    (item) => item.id === initialCourseId && item.cycleId === requestedCycleId,
  );
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
    backendVersion,
    ignoreNextBackendChangeRef,
    availableCourses,
    hasAvailableCourses: availableCourses.length > 0,
    initialCourseId,
    initialPersistedDemoState,
  };
}
