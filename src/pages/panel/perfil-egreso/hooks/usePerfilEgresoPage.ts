import { useEffect, useMemo, useState } from "react";
import {
  isAcademicWorkflowBaseStepInherited,
  isAcademicWorkflowStepLocked,
} from "../../../../components/panel";
import { mockBackend } from "../../../../services/mockBackend";
import { getCatalogs, getCurrentUser } from "../perfil-egreso.mock";
import { rolePermissions } from "../perfil-egreso.permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  buildRecordFromForm,
  enrichPerfilesEgreso,
  getDefaultLugarBySeccional,
  getEmptyFormState,
  mapRecordToForm,
  sanitizeFilters,
  syncFiltersByActivePlan,
} from "../perfil-egreso.utils";
import type {
  FormState,
  PerfilEgresoEnriched,
  PerfilEgresoFilters as FiltersState,
  PerfilEgresoRecord,
} from "../perfil-egreso.types";

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

export function usePerfilEgresoPage() {
  const [records, setRecords] = useState<PerfilEgresoRecord[]>(() =>
    mockBackend.list<PerfilEgresoRecord>("perfilEgreso", currentUser),
  );
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState<PerfilEgresoEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FormState>(getEmptyFormState(currentUser));
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(null);

  const permissions = rolePermissions[currentUser.role];
  const isStepLocked = isAcademicWorkflowStepLocked("perfil-egreso");
  const isInheritedBaseStep = isAcademicWorkflowBaseStepInherited("perfil-egreso");
  const hasRecords = records.length > 0;

  const enrichedRecords = useMemo(() => enrichPerfilesEgreso(records, catalogs), [records]);
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
    if (isInheritedBaseStep) {
      window.alert("El Perfil de egreso fue heredado del ciclo anterior y queda como información de consulta.");
      return;
    }

    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openEditModal = (record: PerfilEgresoEnriched) => {
    if (record.readonlyInherited || record.isInheritedAcademicBase) {
      window.alert("Este perfil de egreso fue heredado del ciclo anterior y queda como información de consulta.");
      return;
    }

    setFormMode("edit");
    setSelectedRecord(record);
    setFormValues(mapRecordToForm(record));
    setFormOpen(true);
  };

  const openDetailModal = (record: PerfilEgresoEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const handleDelete = (record: PerfilEgresoEnriched) => {
    if (record.readonlyInherited || record.isInheritedAcademicBase) {
      window.alert("Este perfil de egreso fue heredado del ciclo anterior y no se puede eliminar desde el nuevo plan.");
      return;
    }

    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el perfil de egreso de ${record.programaNombre}? Esta acción solo afecta los datos temporales actuales.`,
    );
    if (!confirmed) return;

    setRecords(mockBackend.remove<PerfilEgresoRecord>("perfilEgreso", record.id, currentUser));

    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
      setDetailOpen(false);
      setFormOpen(false);
    }
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
    if (isInheritedBaseStep || selectedRecord?.readonlyInherited || selectedRecord?.isInheritedAcademicBase) {
      window.alert("La información heredada del ciclo anterior queda en modo consulta.");
      setFormOpen(false);
      return;
    }

    const nextRecord = buildRecordFromForm(values, formMode === "edit" ? selectedRecord : null);

    setRecords(
      formMode === "create"
        ? mockBackend.create<PerfilEgresoRecord>("perfilEgreso", nextRecord, currentUser)
        : mockBackend.update<PerfilEgresoRecord>("perfilEgreso", nextRecord, currentUser),
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
    handleFilterChange,
    handleFormSubmit,
    setFilters,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
  };
}

export type UsePerfilEgresoPageResult = ReturnType<typeof usePerfilEgresoPage>;
