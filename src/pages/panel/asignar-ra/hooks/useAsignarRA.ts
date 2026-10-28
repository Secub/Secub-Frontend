import { useCallback, useRef, useState } from "react";
import { getAsignarRaPermissions } from "../../../../config/access/permissions";
import { getCurrentUser } from "../../../../services/auth/currentUser";
import { useAsignarRAActions } from "./useAsignarRAActions";
import { useAsignarRAComputed } from "./useAsignarRAComputed";
import { useAsignarRAData } from "./useAsignarRAData";
import { useAsignarRAFilters } from "./useAsignarRAFilters";

export function useAsignarRA() {
  const [currentUser] = useState(getCurrentUser);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const resetFeedback = useCallback(() => {
    setFeedback("");
    setErrorMessage("");
  }, []);

  const coursesRef = useRef<HTMLDivElement | null>(null);
  const assignmentPanelRef = useRef<HTMLDivElement | null>(null);

  const data = useAsignarRAData();
  const permissions = getAsignarRaPermissions(currentUser.role);
  const canRead = permissions.canRead;
  const canManage = permissions.canManage;
  const canDelete = permissions.canDelete;
  const isStepLocked = !data.loading && data.cyclesSource.length === 0;

  const filters = useAsignarRAFilters({
    currentUser,
    cyclesSource: data.cyclesSource,
    academicCatalogs: data.academicCatalogs,
    resetFeedback,
  });

  const computed = useAsignarRAComputed({
    records: data.records,
    measurements: data.measurements,
    competenciasSource: data.competenciasSource,
    mapeosSource: data.mapeosSource,
    selectedCycle: filters.selectedCycle,
    courses: filters.courses,
    selectedCourseId: filters.selectedCourseId,
    courseFilterId: filters.filters.courseFilterId,
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
    academicCatalogs: data.academicCatalogs,
    access: { currentUser, canRead, canManage, canDelete, isStepLocked },
    filters: filters.filters,
    filterOptions: filters.filterOptions,
    filterLocks: filters.filterLocks,
    refs: { coursesRef, assignmentPanelRef },
    records: data.records,
    measurements: data.measurements,
    loading: data.loading,
    loadError: data.loadError,
    refresh: data.refreshBackendState,
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
    pendingCourseIds: computed.pendingCourseIds,
    setShowDeleteConfirm: actions.setShowDeleteConfirm,
    setShowLeaveCourseConfirm: actions.setShowLeaveCourseConfirm,
    setShowFinishAcademicFlowConfirm: actions.setShowFinishAcademicFlowConfirm,
    handleSeccionalChange: filters.handleSeccionalChange,
    handleFacultadChange: filters.handleFacultadChange,
    handleProgramChange: filters.handleProgramChange,
    handlePlanChange: filters.handlePlanChange,
    handleCycleChange: filters.handleCycleChange,
    handleCourseFilterChange: filters.handleCourseFilterChange,
    handleResetFilters: filters.handleResetFilters,
    handleSelectCourse: actions.handleSelectCourse,
    handleBackToCourses: actions.handleBackToCourses,
    handleSaveCourseAssignments: actions.handleSaveCourseAssignments,
    handleSaveAndOpenNextCourse: actions.handleSaveAndOpenNextCourse,
    handleSaveAndRequestFinish: actions.handleSaveAndRequestFinish,
    handleConfirmMeasuredPrimaryAction: actions.handleConfirmMeasuredPrimaryAction,
    handleCancelMeasuredPrimaryAction: actions.handleCancelMeasuredPrimaryAction,
    handleDeleteCourseAssignments: actions.handleDeleteCourseAssignments,
    handleConfirmFinishAcademicFlow: actions.handleConfirmFinishAcademicFlow,
    discardDraftAndReturnToCourses: actions.discardDraftAndReturnToCourses,
    toggleCompetenciaAccordion: actions.toggleCompetenciaAccordion,
    expandCompetencia: actions.expandCompetencia,
    toggleRaSelection: actions.toggleRaSelection,
    getRaAssignment: actions.getRaAssignment,
    isRaSelected: actions.isRaSelected,
    hasUnsavedChanges: actions.hasUnsavedChanges,
    getCourseStatus: computed.getCourseStatus,
    getCourseAssignments: computed.getCourseAssignments,
  };
}

export type UseAsignarRAResult = ReturnType<typeof useAsignarRA>;
