import { useEffect, useMemo, useState } from "react";
import {
  isAcademicWorkflowBaseStepInherited,
  isAcademicWorkflowStepLocked,
} from "../../../../components/panel";
import { mockBackend } from "../../../../services/mockBackend";
import { getCurrentUser, getCatalogs } from "../proposito-formacion.mock";
import { getAcademicModulePermissions, shouldEnforceAcademicWorkflowLock } from "../../../../config/access/permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  buildRecordFromForm,
  enrichPropositos,
  getDefaultLugarBySeccional,
  getEmptyFormState,
  mapRecordToForm,
  sanitizeFilters,
  syncFiltersByActivePlan,
} from "../proposito-formacion.utils";
import type {
  FormState,
  PropositoEnriched,
  PropositoFilters as FiltersState,
  PropositoFormacionRecord,
} from "../proposito-formacion.types";
import { showNotification } from "../../../../shared/feedback";

const currentUser = getCurrentUser();
const catalogs = getCatalogs();

function areFiltersEqual(first: FiltersState, second: FiltersState) {
  return (
    first.seccionalId === second.seccionalId &&
    first.lugarId === second.lugarId &&
    first.facultadId === second.facultadId &&
    first.programaId === second.programaId &&
    first.planId === second.planId &&
    first.estado === second.estado
  );
}

export function usePropositoFormacionPage() {
  const [records, setRecords] = useState<PropositoFormacionRecord[]>(() =>
    mockBackend.list<PropositoFormacionRecord>("propositosFormacion", currentUser),
  );
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState<PropositoEnriched | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<PropositoEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FormState>(getEmptyFormState(currentUser));
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(null);

  const permissions = getAcademicModulePermissions("propositoFormacion", currentUser.role);
  const isStepLocked =
    shouldEnforceAcademicWorkflowLock(currentUser.role) &&
    isAcademicWorkflowStepLocked("proposito-formacion");
  const isInheritedBaseStep = isAcademicWorkflowBaseStepInherited("proposito-formacion");
  const hasRecords = records.length > 0;

  const enrichedRecords = useMemo(() => enrichPropositos(records, catalogs), [records]);
  const roleScopedRecords = useMemo(() => applyRoleScope(enrichedRecords, currentUser), [enrichedRecords]);
  const availableFilterOptions = useMemo(
    () => buildAvailableFilters(roleScopedRecords, catalogs, filters),
    [filters, roleScopedRecords],
  );

  useEffect(() => {
    setFilters((current) => {
      const sanitized = sanitizeFilters(current, availableFilterOptions);
      return areFiltersEqual(sanitized, current) ? current : sanitized;
    });
  }, [availableFilterOptions]);

  const filteredRecords = useMemo(() => applyFilters(roleScopedRecords, filters), [filters, roleScopedRecords]);

  const openCreateModal = () => {
    if (!permissions.canCreate) return;

    if (isInheritedBaseStep) {
      showNotification("El Propósito de formación fue heredado del ciclo anterior y queda como información de consulta.");
      return;
    }

    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openEditModal = (record: PropositoEnriched) => {
    if (!permissions.canUpdate) return;

    if (record.readonlyInherited || record.isInheritedAcademicBase) {
      showNotification("Este propósito de formación fue heredado del ciclo anterior y queda como información de consulta.");
      return;
    }

    setFormMode("edit");
    setSelectedRecord(record);
    setFormValues(mapRecordToForm(record));
    setFormOpen(true);
  };

  const openDetailModal = (record: PropositoEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleDelete = (record: PropositoEnriched) => {
    if (!permissions.canDelete) return;

    if (record.readonlyInherited || record.isInheritedAcademicBase) {
      showNotification("Este propósito de formación fue heredado del ciclo anterior y no se puede eliminar desde el nuevo plan.");
      return;
    }

    setRecordToDelete(record);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;

    if (!permissions.canDelete) {
      setRecordToDelete(null);
      return;
    }

    setRecords(mockBackend.remove<PropositoFormacionRecord>("propositosFormacion", recordToDelete.id, currentUser));

    if (selectedRecord?.id === recordToDelete.id) {
      setSelectedRecord(null);
      setDetailOpen(false);
      setFormOpen(false);
    }

    setRecordToDelete(null);
  };

  const handleFilterChange = <K extends keyof FiltersState>(key: K, value: FiltersState[K]) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.lugarId = getDefaultLugarBySeccional(String(value));
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
      }

      if (key === "lugarId") {
        next.facultadId = "";
        next.programaId = "";
        next.planId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
        next.planId = "";
      }

      if (key === "programaId") next.planId = "";
      if (key === "planId") return syncFiltersByActivePlan(next, String(value), catalogs);

      return next;
    });
  };

  const handleFormSubmit = (values: FormState) => {
    const canSubmit = formMode === "create" ? permissions.canCreate : permissions.canUpdate;
    if (!canSubmit) {
      setFormOpen(false);
      return;
    }

    if (isInheritedBaseStep || selectedRecord?.readonlyInherited || selectedRecord?.isInheritedAcademicBase) {
      showNotification("La información heredada del ciclo anterior queda en modo consulta.");
      setFormOpen(false);
      return;
    }

    const nextRecord = buildRecordFromForm(values, formMode === "edit" ? selectedRecord : null);

    setRecords(
      formMode === "create"
        ? mockBackend.create<PropositoFormacionRecord>("propositosFormacion", nextRecord, currentUser)
        : mockBackend.update<PropositoFormacionRecord>("propositosFormacion", nextRecord, currentUser),
    );

    setFormOpen(false);
    setSelectedRecord(null);
  };

  return {
    currentUser,
    catalogs,
    permissions,
    isStepLocked,
    isInheritedBaseStep,
    hasRecords,
    filters,
    selectedRecord,
    recordToDelete,
    detailOpen,
    formOpen,
    formMode,
    formValues,
    exportFormat,
    roleScopedRecords,
    filteredRecords,
    availableFilterOptions,
    openCreateModal,
    openEditModal,
    openDetailModal,
    handleDelete,
    confirmDelete,
    handleFilterChange,
    handleFormSubmit,
    setFilters,
    setRecordToDelete,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
  };
}

export type UsePropositoFormacionPageResult = ReturnType<typeof usePropositoFormacionPage>;
