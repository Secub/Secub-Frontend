import { useEffect, useMemo, useRef, useState } from "react";
import { getCurrentUser } from "../../../../services/auth/currentUser";
import { getMeasurementAccess, getMeasurementContext } from "../../../../services/measurements";
import type { CourseMeasurementState } from "../types/medicionRA.persistence.types";
import {
  buildCoursesFromMeasurementContext,
  getSearchCourseId,
  getSearchCycleId,
} from "../utils/medicionRA.assignments";

export function useMedicionRAData() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const ignoreNextBackendChangeRef = useRef(false);
  const [availableCourses, setAvailableCourses] = useState<ReturnType<typeof buildCoursesFromMeasurementContext>>([]);
  const [measurementsByCourse, setMeasurementsByCourse] = useState<Record<string, CourseMeasurementState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const requestedCourseId = getSearchCourseId();
  const requestedCycleId = getSearchCycleId();

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError("");
    void getMeasurementContext(controller.signal)
      .then(async (context) => {
        const courses = buildCoursesFromMeasurementContext(context).sort((left, right) => {
          const leftRequested = left.id === requestedCourseId && left.cycleId === requestedCycleId;
          const rightRequested = right.id === requestedCourseId && right.cycleId === requestedCycleId;
          return Number(rightRequested) - Number(leftRequested);
        });
        const accessResults = await Promise.all(courses.map((course) =>
          getMeasurementAccess(course.cycleId ?? "", course.id, controller.signal),
        ));
        if (controller.signal.aborted) return;
        setAvailableCourses(courses);
        setMeasurementsByCourse(Object.fromEntries(accessResults.flatMap((access) =>
          access.measurement ? [[`${access.cycleId}::${access.courseId}`, access.measurement]] : [],
        )));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "No fue posible cargar los cursos asignados.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [requestedCourseId, requestedCycleId]);

  const initialCourse = availableCourses.find((course) =>
    course.id === requestedCourseId && course.cycleId === requestedCycleId,
  ) ?? availableCourses[0];
  const initialCourseId = initialCourse?.id ?? "";
  const initialPersistedState = initialCourse
    ? measurementsByCourse[`${initialCourse.cycleId}::${initialCourse.id}`]
    : undefined;

  return {
    currentUser,
    ignoreNextBackendChangeRef,
    availableCourses,
    measurementsByCourse,
    hasAvailableCourses: availableCourses.length > 0,
    initialCourseId,
    initialPersistedState,
    isLoading,
    loadError,
  };
}
