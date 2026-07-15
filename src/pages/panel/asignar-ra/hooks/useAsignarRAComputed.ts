import { useCallback, useEffect, useMemo } from "react";
import type { CursoSintesis } from "../../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  AsignarRACourseRow,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  MapeoDemoRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import {
  buildSummaryMetrics,
  getAssignmentCompetenciaId,
  getAssignmentCourseId,
  getAssignmentRaId,
  getCompetenciasForCycle,
  getCourseCompetencias,
  getLearningResults,
  getMappedCompetenceIdsForCourse,
  getUniqueAssignmentCount,
  hasMeasurementForAssignment,
} from "../AsignarRA.utils";

interface UseAsignarRAComputedParams {
  records: AsignacionRaRecord[];
  measurements: MedicionRaRecord[];
  competenciasSource: CompetenciaRaDemoRecord[];
  mapeosSource: MapeoDemoRecord[];
  selectedCycle?: CicloDemoRecord;
  selectedCycleId: string;
  courses: CursoSintesis[];
  selectedCourseId: string;
  courseFilterId: string;
  courseSearchTerm: string;
  canManage: boolean;
  setSelectedCourseId: (courseId: string) => void;
}

export function useAsignarRAComputed({
  records,
  measurements,
  competenciasSource,
  mapeosSource,
  selectedCycle,
  selectedCycleId,
  courses,
  selectedCourseId,
  courseFilterId,
  courseSearchTerm,
  canManage,
  setSelectedCourseId,
}: UseAsignarRAComputedParams) {
  const filteredCourses = useMemo(() => {
    const normalizedSearch = courseSearchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSelect = courseFilterId ? course.id === courseFilterId : true;
      const matchesSearch = normalizedSearch
        ? `${course.codigo} ${course.nombre} ${course.docente}`.toLowerCase().includes(normalizedSearch)
        : true;
      return matchesSelect && matchesSearch;
    });
  }, [courseFilterId, courseSearchTerm, courses]);

  const summaryMetrics = useMemo(
    () => buildSummaryMetrics(courses, records, selectedCycleId),
    [courses, records, selectedCycleId],
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

  const hasAnyAssignmentInCycle = useMemo(
    () => Boolean(selectedCycleId && records.some((record) => record.cicloId === selectedCycleId)),
    [records, selectedCycleId],
  );

  const isCourseAssignmentComplete = useCallback(
    (courseId: string) => {
      if (!selectedCycle) return false;

      const mappedCompetenceIds = getMappedCompetenceIdsForCourse(courseId, selectedCycle, mapeosSource);
      if (mappedCompetenceIds.size === 0) return false;

      const requiredCompetencias = allCompetencias.filter((competencia) => mappedCompetenceIds.has(competencia.id));
      if (!requiredCompetencias.length) return false;

      const courseAssignments = records.filter(
        (record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === courseId,
      );

      return requiredCompetencias.every((competencia) => {
        const validRaIds = new Set(getLearningResults(competencia).map((ra) => ra.id).filter(Boolean));
        const assignedRaIds = new Set(
          courseAssignments
            .filter((record) => getAssignmentCompetenciaId(record) === competencia.id)
            .map(getAssignmentRaId)
            .filter((raId) => Boolean(raId) && validRaIds.has(raId)),
        );

        return assignedRaIds.size >= 1 && assignedRaIds.size <= 4;
      });
    },
    [allCompetencias, mapeosSource, records, selectedCycle],
  );

  const isCurrentCycleAssignmentComplete = useMemo(() => {
    if (!selectedCycle || !courses.length) return false;
    return courses.every((course) => isCourseAssignmentComplete(course.id));
  }, [courses, isCourseAssignmentComplete, selectedCycle]);

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
      if (!courseAssignments.length) return { label: "Pendiente" as const, variant: "warning" as const };

      const allMeasured = courseAssignments.every((record) => hasMeasurementForAssignment(measurements, record.id));
      return allMeasured
        ? { label: "Medido" as const, variant: "success" as const }
        : { label: "Pendiente" as const, variant: "warning" as const };
    },
    [getCourseAssignments, measurements],
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
    hasAnyAssignmentInCycle,
    isCurrentCycleAssignmentComplete,
    summaryMetrics,
    courseRows,
    getCourseAssignments,
    getCourseStatus,
    isCourseAssignmentComplete,
  };
}
