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
  pendingCourseIds: string[];
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
  pendingCourseIds,
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
  const [pendingPrimaryAction, setPendingPrimaryAction] = useState<"next" | "finish" | null>(null);

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
    if (!canManage) return "";
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

  const persistCourseAssignments = () => {
    if (!canManage) return false;

    if (!selectedCycle || !selectedCourse) return false;

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
  };

  const getNextPendingCourseId = () => {
    if (!selectedCourse) return undefined;

    const otherPendingIds = new Set(pendingCourseIds.filter((courseId) => courseId !== selectedCourse.id));
    const currentIndex = courses.findIndex((course) => course.id === selectedCourse.id);
    const orderedCandidates = [
      ...courses.slice(currentIndex + 1),
      ...courses.slice(0, Math.max(0, currentIndex)),
    ];

    return orderedCandidates.find((course) => otherPendingIds.has(course.id))?.id;
  };

  const continueAfterValidatedSave = (action: "next" | "finish") => {
    if (!persistCourseAssignments()) return;

    if (action === "next") {
      const nextCourseId = getNextPendingCourseId();
      if (!nextCourseId) {
        setErrorMessage("No se encontró otro curso pendiente. Revisa el estado de las asignaciones antes de continuar.");
        return;
      }

      setSelectedCourseId(nextCourseId);
      setFeedback("Asignación guardada. Se abrió el siguiente curso pendiente.");
      window.requestAnimationFrame(() =>
        assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
      return;
    }

    setFeedback("Asignación del último curso guardada correctamente.");
    setShowFinishAcademicFlowConfirm(true);
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

    const nextPendingCourseId = getNextPendingCourseId();
    if (action === "next" && !nextPendingCourseId) {
      setErrorMessage("Este es el último curso pendiente. Utiliza Finalizar para completar el flujo.");
      return;
    }

    if (action === "finish" && nextPendingCourseId) {
      setErrorMessage("Todavía existen cursos pendientes. Guarda el curso actual y continúa con Siguiente curso.");
      return;
    }

    if (getMeasuredAssignmentsThatWouldBeRemoved().length) {
      setPendingPrimaryAction(action);
      setShowMeasuredConfirm(true);
      return;
    }

    continueAfterValidatedSave(action);
  };

  const handleSaveAndOpenNextCourse = () => requestPrimaryAction("next");
  const handleSaveAndRequestFinish = () => requestPrimaryAction("finish");

  const handleConfirmMeasuredPrimaryAction = () => {
    const action = pendingPrimaryAction;
    setPendingPrimaryAction(null);
    setShowMeasuredConfirm(false);
    if (action) continueAfterValidatedSave(action);
  };

  const handleCancelMeasuredPrimaryAction = () => {
    setPendingPrimaryAction(null);
    setShowMeasuredConfirm(false);
  };

  const handleSelectCourse = (courseId: string) => {
    resetFeedback();
    setSelectedCourseId(courseId);
    window.requestAnimationFrame(() => assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const handleDeleteCourseAssignments = () => {
    if (!canManage) {
      setShowDeleteConfirm(false);
      return;
    }

    if (!selectedCourse || !selectedCycle) return;
    selectedCourseAssignments.forEach((record) => removeAssignmentAndMeasurements(record.id));
    refreshBackendState();
    setShowDeleteConfirm(false);
    setFeedback("Asignación del curso eliminada correctamente. El workflow se recalculó con los datos actuales.");
  };

  const handleConfirmFinishAcademicFlow = () => {
    if (!canManage) {
      setShowFinishAcademicFlowConfirm(false);
      return;
    }

    const completedPlan = completeAcademicWorkflowFromCurrentProgress();

    if (!completedPlan) {
      setShowFinishAcademicFlowConfirm(false);
      setErrorMessage("El flujo todavía no cumple todas las condiciones para finalizar. Revisa los pasos anteriores y las asignaciones RA.");
      return;
    }

    setShowFinishAcademicFlowConfirm(false);
    refreshBackendState();
    setSelectedCourseId("");
    setFeedback("Flujo académico finalizado correctamente.");
    scrollToCourses();
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
    setShowDeleteConfirm,
    setShowLeaveCourseConfirm,
    showFinishAcademicFlowConfirm,
    setShowFinishAcademicFlowConfirm,
    handleSelectCourse,
    handleBackToCourses,
    handleSaveAndOpenNextCourse,
    handleSaveAndRequestFinish,
    handleConfirmMeasuredPrimaryAction,
    handleCancelMeasuredPrimaryAction,
    handleDeleteCourseAssignments,
    handleConfirmFinishAcademicFlow,
    discardDraftAndReturnToCourses,
    toggleCompetenciaAccordion,
    toggleRaSelection,
    getRaAssignment,
    isRaSelected,
    hasUnsavedChanges,
  };
}
