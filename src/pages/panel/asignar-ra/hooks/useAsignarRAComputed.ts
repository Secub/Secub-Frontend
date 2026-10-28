import { useCallback, useEffect, useMemo } from "react";
import type { CursoSintesis } from "../../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  AsignarRACourseRow,
  MeasurementCycleRecord,
  CompetenceRaRecord,
  CompetencyMappingRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import {
  getAssignmentCourseId,
  getCompetenciasForCycle,
  getCourseCompetencias,
  getMappedCompetenceIdsForCourse,
  getUniqueAssignmentCount,
  hasMeasurementForAssignment,
  isCourseAssignmentComplete,
} from "../AsignarRA.utils";

interface UseAsignarRAComputedParams {
  records: AsignacionRaRecord[];
  measurements: MedicionRaRecord[];
  competenciasSource: CompetenceRaRecord[];
  mapeosSource: CompetencyMappingRecord[];
  selectedCycle?: MeasurementCycleRecord;
  courses: CursoSintesis[];
  selectedCourseId: string;
  courseFilterId: string;
  canManage: boolean;
  setSelectedCourseId: (courseId: string) => void;
}

export function useAsignarRAComputed({
  records,
  measurements,
  competenciasSource,
  mapeosSource,
  selectedCycle,
  courses,
  selectedCourseId,
  courseFilterId,
  canManage,
  setSelectedCourseId,
}: UseAsignarRAComputedParams) {
  const filteredCourses = useMemo(
    () => (courseFilterId ? courses.filter((course) => course.id === courseFilterId) : courses),
    [courseFilterId, courses],
  );

  useEffect(() => {
    if (!selectedCourseId) return;
    if (!courses.some((course) => course.id === selectedCourseId)) setSelectedCourseId("");
  }, [courses, selectedCourseId, setSelectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const allCompetencias = useMemo(
    () => getCompetenciasForCycle(competenciasSource, selectedCycle),
    [competenciasSource, selectedCycle],
  );

  const courseCompetencias = useMemo(
    () => getCourseCompetencias(selectedCourse, selectedCycle, allCompetencias, mapeosSource),
    [allCompetencias, mapeosSource, selectedCourse, selectedCycle],
  );

  const selectedCourseAssignments = useMemo(() => {
    if (!selectedCycle || !selectedCourse) return [];
    return records.filter(
      (record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === selectedCourse.id,
    );
  }, [records, selectedCourse, selectedCycle]);

  const pendingCourseIds = useMemo(() => {
    if (!selectedCycle) return courses.map((course) => course.id);

    return courses
      .filter(
        (course) =>
          !isCourseAssignmentComplete(course, selectedCycle, allCompetencias, mapeosSource, records),
      )
      .map((course) => course.id);
  }, [allCompetencias, courses, mapeosSource, records, selectedCycle]);

  const getCourseAssignments = useCallback(
    (courseId: string) => {
      if (!selectedCycle) return [];
      return records.filter((record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === courseId);
    },
    [records, selectedCycle],
  );

  const getCourseStatus = useCallback(
    (courseId: string) => {
      const courseAssignments = getCourseAssignments(courseId);
      const course = courses.find((item) => item.id === courseId);
      const isComplete = Boolean(
        course &&
        selectedCycle &&
        isCourseAssignmentComplete(course, selectedCycle, allCompetencias, mapeosSource, records),
      );
      if (!isComplete) return { label: "Pendiente" as const, variant: "warning" as const };

      const allMeasured = courseAssignments.every((record) => hasMeasurementForAssignment(measurements, record.id));
      return allMeasured
        ? { label: "Medido" as const, variant: "success" as const }
        : { label: "Asignado" as const, variant: "success" as const };
    },
    [allCompetencias, courses, getCourseAssignments, mapeosSource, measurements, records, selectedCycle],
  );

  const getCourseCompetenceCount = useCallback(
    (course: CursoSintesis) => {
      const mappedCompetenceIds = getMappedCompetenceIdsForCourse(course.id, selectedCycle, mapeosSource);
      return mappedCompetenceIds.size;
    },
    [mapeosSource, selectedCycle],
  );

  const courseRows = useMemo<AsignarRACourseRow[]>(() => {
    return filteredCourses.map((course) => {
      const assignments = getCourseAssignments(course.id);
      const assignedCount = getUniqueAssignmentCount(assignments);
      const actionLabel = canManage ? (assignedCount > 0 ? "Editar asignación" : "Asignar RA") : "Ver asignación";

      return {
        course,
        assignments,
        status: getCourseStatus(course.id),
        assignedCount,
        competenceCount: getCourseCompetenceCount(course),
        isSelected: selectedCourseId === course.id,
        actionLabel,
      };
    });
  }, [canManage, filteredCourses, getCourseAssignments, getCourseCompetenceCount, getCourseStatus, selectedCourseId]);

  return {
    filteredCourses,
    selectedCourse,
    selectedCourseAssignments,
    courseCompetencias,
    pendingCourseIds,
    courseRows,
    getCourseAssignments,
    getCourseStatus,
  };
}
