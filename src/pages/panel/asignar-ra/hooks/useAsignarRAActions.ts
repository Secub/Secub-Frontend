import { useCallback, useEffect, useState, type RefObject } from "react";
import { completeAcademicWorkflowFromCurrentProgress } from "../../../../components/panel";
import type { CursoSintesis } from "../../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  DraftSelections,
  MedicionRaRecord,
} from "../AsignarRA.types";
import {
  areArraysEqual,
  buildDraftSelections,
  getAssignmentCompetenciaId,
  getAssignmentRaId,
  getCompetenciaLabel,
  hasMeasurementForAssignment,
} from "../AsignarRA.utils";
import { persistCourseAssignmentsForCourse, removeAssignmentAndMeasurements } from "./asignarRA.persistence";

interface UseAsignarRAActionsParams {
  canManage: boolean;
  selectedProgramId: string;
  selectedPlanId: string;
  courses: CursoSintesis[];
  isCourseAssignmentComplete: (courseId: string) => boolean;
  selectedCycle?: CicloDemoRecord;
  selectedCourse?: CursoSintesis;
  selectedCourseAssignments: AsignacionRaRecord[];
  courseCompetencias: CompetenciaRaDemoRecord[];
  measurements: MedicionRaRecord[];
  coursesRef: RefObject<HTMLDivElement | null>;
  assignmentPanelRef: RefObject<HTMLDivElement | null>;
  setSelectedCourseId: (courseId: string) => void;
  refreshBackendState: () => void;
  resetFeedback: () => void;
  setFeedback: (message: string) => void;
  setErrorMessage: (message: string) => void;
}

export function useAsignarRAActions({
  canManage,
  selectedProgramId,
  selectedPlanId,
  courses,
  isCourseAssignmentComplete,
  selectedCycle,
  selectedCourse,
  selectedCourseAssignments,
  courseCompetencias,
  measurements,
  coursesRef,
  assignmentPanelRef,
  setSelectedCourseId,
  refreshBackendState,
  resetFeedback,
  setFeedback,
  setErrorMessage,
}: UseAsignarRAActionsParams) {
  const [draftSelections, setDraftSelections] = useState<DraftSelections>({});
  const [expandedCompetenciaIds, setExpandedCompetenciaIds] = useState<string[]>([]);
  const [showMeasuredConfirm, setShowMeasuredConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveCourseConfirm, setShowLeaveCourseConfirm] = useState(false);
  const [showFinishAcademicFlowConfirm, setShowFinishAcademicFlowConfirm] = useState(false);
  const [pendingMeasuredAction, setPendingMeasuredAction] = useState<"next" | "finish" | null>(null);

  useEffect(() => {
    const nextDraft = buildDraftSelections(courseCompetencias, selectedCourseAssignments);
    setDraftSelections(nextDraft);
    setExpandedCompetenciaIds(courseCompetencias.map((competencia) => competencia.id));
  }, [courseCompetencias, selectedCourseAssignments]);

  const scrollToCourses = useCallback(() => {
    window.requestAnimationFrame(() => {
      coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [coursesRef]);

  const hasUnsavedChanges = useCallback(() => {
    return courseCompetencias.some((competencia) => {
      const originalRaIds = selectedCourseAssignments
        .filter((record) => getAssignmentCompetenciaId(record) === competencia.id)
        .map(getAssignmentRaId)
        .filter(Boolean);
      const draftRaIds = draftSelections[competencia.id] ?? [];
      return !areArraysEqual(originalRaIds, draftRaIds);
    });
  }, [courseCompetencias, draftSelections, selectedCourseAssignments]);

  const discardDraftAndReturnToCourses = () => {
    resetFeedback();
    setDraftSelections(buildDraftSelections(courseCompetencias, selectedCourseAssignments));
    setSelectedCourseId("");
    setShowLeaveCourseConfirm(false);
    scrollToCourses();
  };

  const handleBackToCourses = () => {
    resetFeedback();
    if (hasUnsavedChanges()) {
      setShowLeaveCourseConfirm(true);
      return;
    }
    setSelectedCourseId("");
    scrollToCourses();
  };

  const getRaAssignment = useCallback(
    (competenciaId: string, raId: string) => {
      return selectedCourseAssignments.find(
        (record) => getAssignmentCompetenciaId(record) === competenciaId && getAssignmentRaId(record) === raId,
      );
    },
    [selectedCourseAssignments],
  );

  const isRaSelected = useCallback(
    (competenciaId: string, raId: string) => Boolean(draftSelections[competenciaId]?.includes(raId)),
    [draftSelections],
  );

  const validateRequiredFilters = () => {
    if (!selectedProgramId) return "Selecciona un programa académico para continuar.";
    if (!selectedPlanId) return "Selecciona un plan de estudios para continuar.";
    if (!selectedCycle) return "Selecciona el ciclo de medición o periodo académico que vas a trabajar.";
    if (!courses.length) return "El ciclo seleccionado no tiene cursos de Síntesis disponibles.";
    if (!selectedCourse) return "Selecciona un curso de Síntesis para asignar RA.";
    if (selectedCourse.nucleo !== "Síntesis") return "Solo se pueden asignar RA a cursos de Síntesis.";
    if (!courseCompetencias.length) return "El curso seleccionado no tiene competencias asociadas. Revisa el Mapeo de Competencias.";
    if (!canManage) return "Solo Dirección de programa puede guardar asignaciones RA.";
    return "";
  };

  const validateDraftSelections = () => {
    const filterValidation = validateRequiredFilters();
    if (filterValidation) return filterValidation;

    for (const [index, competencia] of courseCompetencias.entries()) {
      const selectedRaIds = draftSelections[competencia.id] ?? [];
      const label = getCompetenciaLabel(competencia, index);

      if (selectedRaIds.length < 1) return `Selecciona al menos 1 RA para la competencia ${label}.`;
      if (selectedRaIds.length > 4) return "Máximo 4 Resultados de Aprendizaje por competencia.";
    }

    return "";
  };

  const getMeasuredAssignmentsThatWouldBeRemoved = () => {
    if (!selectedCourse || !selectedCycle) return [];

    return selectedCourseAssignments.filter((record) => {
      const competenciaId = getAssignmentCompetenciaId(record);
      const raId = getAssignmentRaId(record);
      const staysSelected = Boolean(draftSelections[competenciaId]?.includes(raId));
      return !staysSelected && hasMeasurementForAssignment(measurements, record.id);
    });
  };

  const getNextPendingCourse = useCallback(() => {
    if (!selectedCourse || !courses.length) return undefined;

    const currentIndex = courses.findIndex((course) => course.id === selectedCourse.id);
    const orderedCourses = currentIndex >= 0
      ? [...courses.slice(currentIndex + 1), ...courses.slice(0, currentIndex)]
      : courses;

    return orderedCourses.find((course) => !isCourseAssignmentComplete(course.id));
  }, [courses, isCourseAssignmentComplete, selectedCourse]);

  const toggleRaSelection = (competencia: CompetenciaRaDemoRecord, raId?: string) => {
    if (!canManage || !raId) return;
    resetFeedback();

    setDraftSelections((current) => {
      const currentRaIds = current[competencia.id] ?? [];
      const isSelected = currentRaIds.includes(raId);

      if (isSelected) return { ...current, [competencia.id]: currentRaIds.filter((currentRaId) => currentRaId !== raId) };
      if (currentRaIds.length >= 4) {
        setErrorMessage("Máximo 4 Resultados de Aprendizaje por competencia.");
        return current;
      }
      return { ...current, [competencia.id]: [...currentRaIds, raId] };
    });
  };

  const persistCurrentCourseAssignments = () => {
    if (!selectedCycle || !selectedCourse) return false;

    try {
      persistCourseAssignmentsForCourse({
        selectedCycle,
        selectedCourse,
        courseCompetencias,
        draftSelections,
        measurements,
      });
      refreshBackendState();
      setShowMeasuredConfirm(false);
      return true;
    } catch {
      setShowMeasuredConfirm(false);
      setErrorMessage("No fue posible guardar la asignación del curso. Intenta nuevamente.");
      return false;
    }
  };

  const continueToNextCourseAfterSave = () => {
    const nextPendingCourse = getNextPendingCourse();
    if (!persistCurrentCourseAssignments()) return;

    if (!nextPendingCourse) {
      setErrorMessage("No se encontró otro curso pendiente. Revisa las asignaciones antes de finalizar.");
      return;
    }

    setSelectedCourseId(nextPendingCourse.id);
    setFeedback(`Asignación guardada. Continúa con ${nextPendingCourse.nombre}.`);
    window.requestAnimationFrame(() => assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const requestPrimaryAction = (action: "next" | "finish") => {
    resetFeedback();
    const validationMessage = validateDraftSelections();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      if (!selectedCourse) coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      else assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const nextPendingCourse = getNextPendingCourse();

    if (action === "next" && !nextPendingCourse) {
      setErrorMessage("Este es el último curso pendiente. Utiliza Finalizar para completar el módulo.");
      return;
    }

    if (action === "finish" && nextPendingCourse) {
      setErrorMessage("Aún existen cursos pendientes. Continúa con Siguiente curso antes de finalizar.");
      return;
    }

    if (getMeasuredAssignmentsThatWouldBeRemoved().length) {
      setPendingMeasuredAction(action);
      setShowMeasuredConfirm(true);
      return;
    }

    if (action === "finish") {
      setShowFinishAcademicFlowConfirm(true);
      return;
    }

    continueToNextCourseAfterSave();
  };

  const handleNextCourse = () => requestPrimaryAction("next");

  const handleRequestFinishAcademicFlow = () => requestPrimaryAction("finish");

  const handleConfirmMeasuredAssignment = () => {
    const action = pendingMeasuredAction;
    setPendingMeasuredAction(null);

    if (!action) {
      setShowMeasuredConfirm(false);
      return;
    }

    setShowMeasuredConfirm(false);

    if (action === "finish") {
      setShowFinishAcademicFlowConfirm(true);
      return;
    }

    continueToNextCourseAfterSave();
  };

  const handleCancelMeasuredAssignment = () => {
    setPendingMeasuredAction(null);
    setShowMeasuredConfirm(false);
  };

  const handleSelectCourse = (courseId: string) => {
    resetFeedback();
    setSelectedCourseId(courseId);
    window.requestAnimationFrame(() => assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleDeleteCourseAssignments = () => {
    if (!selectedCourse || !selectedCycle) return;
    selectedCourseAssignments.forEach((record) => removeAssignmentAndMeasurements(record.id));
    refreshBackendState();
    setShowDeleteConfirm(false);
    setFeedback("Asignación del curso eliminada correctamente. El workflow se recalculó con los datos actuales.");
  };

  const handleConfirmFinishAcademicFlow = () => {
    // Cerrar primero la confirmación para que el aviso de flujo completado
    // aparezca después y nunca se superponga con este diálogo.
    setShowFinishAcademicFlowConfirm(false);

    window.requestAnimationFrame(() => {
      if (!persistCurrentCourseAssignments()) return;

      const completedPlan = completeAcademicWorkflowFromCurrentProgress();

      if (!completedPlan) {
        setErrorMessage("El flujo todavía no cumple todas las condiciones para finalizar. Revisa los pasos anteriores y las asignaciones RA.");
        return;
      }

      refreshBackendState();
      setSelectedCourseId("");
      setFeedback("Flujo académico finalizado correctamente.");
      scrollToCourses();
    });
  };

  const toggleCompetenciaAccordion = (competenciaId: string) => {
    setExpandedCompetenciaIds((current) =>
      current.includes(competenciaId) ? current.filter((id) => id !== competenciaId) : [...current, competenciaId],
    );
  };

  return {
    draftSelections,
    expandedCompetenciaIds,
    showMeasuredConfirm,
    showDeleteConfirm,
    showLeaveCourseConfirm,
    setShowMeasuredConfirm,
    setShowDeleteConfirm,
    setShowLeaveCourseConfirm,
    showFinishAcademicFlowConfirm,
    setShowFinishAcademicFlowConfirm,
    hasNextPendingCourse: Boolean(getNextPendingCourse()),
    handleSelectCourse,
    handleBackToCourses,
    handleNextCourse,
    handleDeleteCourseAssignments,
    handleRequestFinishAcademicFlow,
    handleConfirmFinishAcademicFlow,
    handleConfirmMeasuredAssignment,
    handleCancelMeasuredAssignment,
    discardDraftAndReturnToCourses,
    toggleCompetenciaAccordion,
    toggleRaSelection,
    getRaAssignment,
    isRaSelected,
    hasUnsavedChanges,
  };
}
