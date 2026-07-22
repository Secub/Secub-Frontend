import { useCallback, useRef, useState } from "react";
import { isAcademicWorkflowStepLocked } from "../../../../components/panel";
import {
  canDeleteAsignarRA,
  canManageAsignarRA,
  canReadAsignarRA,
} from "../AsignarRA.permissions";
import { asignarRAAcademicCatalogs as academicCatalogs, asignarRACurrentUser as currentUser } from "./asignarRA.shared";
import { useAsignarRAActions } from "./useAsignarRAActions";
import { useAsignarRAComputed } from "./useAsignarRAComputed";
import { useAsignarRAData } from "./useAsignarRAData";
import { useAsignarRAFilters } from "./useAsignarRAFilters";

export function useAsignarRA() {
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const resetFeedback = useCallback(() => {
    setFeedback("");
    setErrorMessage("");
  }, []);

  const filtersRef = useRef<HTMLDivElement | null>(null);
  const coursesRef = useRef<HTMLDivElement | null>(null);
  const assignmentPanelRef = useRef<HTMLDivElement | null>(null);

  const data = useAsignarRAData();
  const canRead = canReadAsignarRA(currentUser);
  const canManage = canManageAsignarRA(currentUser);
  const canDelete = canDeleteAsignarRA(currentUser);
  const isStepLocked = isAcademicWorkflowStepLocked("asignar-ra");

  const filters = useAsignarRAFilters({
    cyclesSource: data.cyclesSource,
    resetFeedback,
  });

  const computed = useAsignarRAComputed({
    records: data.records,
    measurements: data.measurements,
    competenciasSource: data.competenciasSource,
    mapeosSource: data.mapeosSource,
    selectedCycle: filters.selectedCycle,
    selectedCycleId: filters.filters.selectedCycleId,
    courses: filters.courses,
    selectedCourseId: filters.selectedCourseId,
    courseFilterId: filters.filters.courseFilterId,
    courseSearchTerm: filters.filters.courseSearchTerm,
    canManage,
    setSelectedCourseId: filters.setSelectedCourseId,
  });

  const actions = useAsignarRAActions({
    canManage,
    selectedProgramId: filters.filters.selectedProgramId,
    selectedPlanId: filters.filters.selectedPlanId,
    courses: filters.courses,
    pendingCourseIds: computed.pendingCourseIds,
    selectedCycle: filters.selectedCycle,
    selectedCourse: computed.selectedCourse,
    selectedCourseAssignments: computed.selectedCourseAssignments,
    courseCompetencias: computed.courseCompetencias,
    measurements: data.measurements,
    coursesRef,
    assignmentPanelRef,
    setSelectedCourseId: filters.setSelectedCourseId,
    refreshBackendState: data.refreshBackendState,
    resetFeedback,
    setFeedback,
    setErrorMessage,
  });

  return {
    currentUser,
    academicCatalogs,
    access: { currentUser, canRead, canManage, canDelete, isStepLocked },
    filters: filters.filters,
    filterOptions: filters.filterOptions,
    filterLocks: filters.filterLocks,
    refs: { filtersRef, coursesRef, assignmentPanelRef },
    records: data.records,
    measurements: data.measurements,
    cycles: filters.cycles,
    courses: filters.courses,
    filteredCourses: computed.filteredCourses,
    courseRows: computed.courseRows,
    selectedCycle: filters.selectedCycle,
    selectedCourse: computed.selectedCourse,
    selectedCourseAssignments: computed.selectedCourseAssignments,
    courseCompetencias: computed.courseCompetencias,
    draftSelections: actions.draftSelections,
    expandedCompetenciaIds: actions.expandedCompetenciaIds,
    feedback,
    errorMessage,
    showMeasuredConfirm: actions.showMeasuredConfirm,
    showDeleteConfirm: actions.showDeleteConfirm,
    showLeaveCourseConfirm: actions.showLeaveCourseConfirm,
    showFinishAcademicFlowConfirm: actions.showFinishAcademicFlowConfirm,
    hasAnyAssignmentInCycle: computed.hasAnyAssignmentInCycle,
    isCurrentCycleAssignmentComplete: computed.isCurrentCycleAssignmentComplete,
    pendingCourseIds: computed.pendingCourseIds,
    summaryMetrics: computed.summaryMetrics,
    setCourseSearchTerm: filters.setCourseSearchTerm,
    setShowDeleteConfirm: actions.setShowDeleteConfirm,
    setShowLeaveCourseConfirm: actions.setShowLeaveCourseConfirm,
    setShowFinishAcademicFlowConfirm: actions.setShowFinishAcademicFlowConfirm,
    handleSeccionalChange: filters.handleSeccionalChange,
    handleFacultadChange: filters.handleFacultadChange,
    handleProgramChange: filters.handleProgramChange,
    handlePlanChange: filters.handlePlanChange,
    handleCycleChange: filters.handleCycleChange,
    handleCourseFilterChange: filters.handleCourseFilterChange,
    handleSelectCourse: actions.handleSelectCourse,
    handleBackToCourses: actions.handleBackToCourses,
    handleSaveAndOpenNextCourse: actions.handleSaveAndOpenNextCourse,
    handleSaveAndRequestFinish: actions.handleSaveAndRequestFinish,
    handleConfirmMeasuredPrimaryAction: actions.handleConfirmMeasuredPrimaryAction,
    handleCancelMeasuredPrimaryAction: actions.handleCancelMeasuredPrimaryAction,
    handleDeleteCourseAssignments: actions.handleDeleteCourseAssignments,
    handleConfirmFinishAcademicFlow: actions.handleConfirmFinishAcademicFlow,
    discardDraftAndReturnToCourses: actions.discardDraftAndReturnToCourses,
    toggleCompetenciaAccordion: actions.toggleCompetenciaAccordion,
    toggleRaSelection: actions.toggleRaSelection,
    getRaAssignment: actions.getRaAssignment,
    isRaSelected: actions.isRaSelected,
    hasUnsavedChanges: actions.hasUnsavedChanges,
    getCourseStatus: computed.getCourseStatus,
    getCourseAssignments: computed.getCourseAssignments,
  };
}

export type UseAsignarRAResult = ReturnType<typeof useAsignarRA>;
