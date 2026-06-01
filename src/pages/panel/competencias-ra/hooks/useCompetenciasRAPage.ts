import { useState } from "react";
import { isAcademicWorkflowStepLocked } from "../../../../components/panel";
import { mockBackend } from "../../../../services/mockBackend";
import { getCurrentUser, getCatalogs } from "../CompetenciasRa.mock";
import { rolePermissions } from "../CompetenciasRa.permissions";
import {
  buildRecordFromForm,
  enrichCompetenciasRa,
  getEmptyFormState,
  MAX_RA_PER_COMPETENCIA,
  getLearningResultsValidationMessage,
} from "../CompetenciasRa.utils";
import type {
  FormState,
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRecord,
} from "../CompetenciasRa.types";
import { useCompetenciasRAFilters } from "./useCompetenciasRAFilters";
import { useCompetenciasRAActions } from "./useCompetenciasRAActions";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

export function useCompetenciasRAPage() {
  const [records, setRecords] = useState<CompetenciasRaFormacionRecord[]>(() =>
    mockBackend.list<CompetenciasRaFormacionRecord>("competenciasRa", currentUser),
  );
  const [selectedRecord, setSelectedRecord] = useState<CompetenciasRaEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FormState>(getEmptyFormState(currentUser));
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(null);

  const permissions = rolePermissions[currentUser.role];
  // Los docentes no están sujetos al workflow académico, solo pueden consultar
  const isStepLocked = currentUser.role === "docente" ? false : isAcademicWorkflowStepLocked("competencias-ra");
  const hasRecords = records.length > 0;
  const filtersState = useCompetenciasRAFilters({ records, catalogs, currentUser });
  const {
    filters,
    sortOrder,
    setFilters,
    setSortOrder,
    roleScopedRecords,
    availableFilterOptions,
    filteredRecords,
    invalidCompetencias,
    handleFilterChange,
  } = filtersState;

  const refreshRecordsState = (nextRecords: CompetenciasRaFormacionRecord[], selectedId?: string) => {
    setRecords(nextRecords);
    if (!selectedId) return;

    const refreshedRecord = enrichCompetenciasRa(nextRecords, catalogs).find((record) => record.id === selectedId);
    setSelectedRecord(refreshedRecord ?? null);
  };

  const openCreateModal = () => {
    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openViewModal = (record: CompetenciasRaEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const raActions = useCompetenciasRAActions({
    selectedRecord,
    setRecords,
    setSelectedRecord,
    setDetailOpen,
    setFormOpen,
    refreshRecordsState,
  });

  const handleFormSubmit = (values: FormState) => {
    const baseRecord = buildRecordFromForm(values, formMode === "edit" ? selectedRecord : null, records);
    const relatedProposito = mockBackend
      .list<{ id: string; programaId?: string; planId?: string }>("propositosFormacion", currentUser)
      .find((item) => item.planId === baseRecord.planId || item.programaId === baseRecord.programaId);
    const nextRecord = { ...baseRecord, propositoFormacionId: baseRecord.propositoFormacionId ?? relatedProposito?.id };
    const validationMessage = getLearningResultsValidationMessage(nextRecord);

    if (nextRecord.resultadosAprendizaje.length > MAX_RA_PER_COMPETENCIA) {
      window.alert(validationMessage || "Máximo 4 Resultados de Aprendizaje por competencia.");
      return;
    }

    try {
      setRecords(
        formMode === "create"
          ? mockBackend.create<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser)
          : mockBackend.update<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser),
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No fue posible guardar la competencia.");
      return;
    }

    setFilters({
      seccionalId: values.seccionalId,
      lugarId: values.lugarId,
      facultadId: values.facultadId,
      programaId: values.programaId,
      planId: values.planId,
      estado: "activo",
    });
    setFormOpen(false);
    setSelectedRecord(null);
  };

  return {
    currentUser,
    catalogs,
    permissions,
    isStepLocked,
    hasRecords,
    filters,
    sortOrder,
    selectedRecord,
    detailOpen,
    formOpen,
    formMode,
    formValues,
    exportFormat,
    raModalMode: raActions.raModalMode,
    selectedRaRecord: raActions.selectedRaRecord,
    raDraft: raActions.raDraft,
    raError: raActions.raError,
    roleScopedRecords,
    filteredRecords,
    availableFilterOptions,
    invalidCompetencias,
    openCreateModal,
    openViewModal,
    openCreateRaModal: raActions.openCreateRaModal,
    openEditRaModal: raActions.openEditRaModal,
    handleSaveRa: raActions.handleSaveRa,
    handleSaveCompetenciaDescription: raActions.handleSaveCompetenciaDescription,
    handleDelete: raActions.handleDelete,
    handleFilterChange,
    handleFormSubmit,
    closeRaModal: raActions.closeRaModal,
    setFilters,
    setSortOrder,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
    setRaDraft: raActions.setRaDraft,
    setRaError: raActions.setRaError,
  };
}

export type UseCompetenciasRAPageResult = ReturnType<typeof useCompetenciasRAPage>;
