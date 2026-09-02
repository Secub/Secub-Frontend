import { useCallback, useEffect, useMemo, useState } from "react";
import {
  isAcademicWorkflowBaseStepInherited,
  isAcademicWorkflowStepLocked,
} from "../../../../components/panel";
import { mockBackend } from "../../../../services/mockBackend";
import { getCurrentUser } from "../perfil-egreso.mock";
import {
  createGraduationProfile,
  deleteGraduationProfile,
  getGraduationProfileContext,
  listGraduationProfiles,
  updateGraduationProfile,
  type GraduationProfileContext,
} from "../../../../services/graduationProfiles";
import {
  getAcademicModulePermissions,
  shouldEnforceAcademicWorkflowLock,
} from "../../../../config/access/permissions";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildAvailableFilters,
  enrichPerfilesEgreso,
  getDefaultLugarBySeccional,
  getEmptyFormState,
  mapRecordToForm,
  sanitizeFilters,
  syncFiltersByActivePlan,
} from "../perfil-egreso.utils";
import type {
  Catalogs,
  FormState,
  PerfilEgresoEnriched,
  PerfilEgresoFilters as FiltersState,
  PerfilEgresoRecord,
} from "../perfil-egreso.types";
import { showNotification } from "../../../../shared/feedback";

const EMPTY_CATALOGS: Catalogs = {
  seccionales: [],
  lugares: [],
  facultades: [],
  programas: [],
  planes: [],
};

function buildCatalogs(context: GraduationProfileContext): Catalogs {
  const { scope } = context;
  return {
    seccionales: [{ id: scope.seccionalId, nombre: scope.seccionalNombre }],
    lugares: [{ id: scope.lugarId, nombre: scope.lugarNombre, seccionalId: scope.seccionalId }],
    facultades: [{ id: scope.facultadId, nombre: scope.facultadNombre, seccionalId: scope.seccionalId }],
    programas: [{
      id: scope.programaId,
      nombre: scope.programaNombre,
      facultadId: scope.facultadId,
      seccionalId: scope.seccionalId,
    }],
    planes: context.planes,
  };
}

function syncWorkflowRecord(record: PerfilEgresoRecord, user: ReturnType<typeof getCurrentUser>) {
  try {
    mockBackend.upsert<PerfilEgresoRecord>("perfilEgreso", record, user);
  } catch {
    // El backend es la fuente de verdad. Este espejo solo mantiene compatible
    // el indicador del flujo académico mientras los demás módulos siguen en mock.
  }
}

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
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [catalogs, setCatalogs] = useState<Catalogs>(EMPTY_CATALOGS);
  const [records, setRecords] = useState<PerfilEgresoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
  const [selectedRecord, setSelectedRecord] = useState<PerfilEgresoEnriched | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<PerfilEgresoEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<FormState>(() => getEmptyFormState(currentUser));
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel" | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    Promise.all([
      getGraduationProfileContext(controller.signal),
      listGraduationProfiles(controller.signal),
    ])
      .then(([context, profileRecords]) => {
        setCatalogs(buildCatalogs(context));
        setRecords(profileRecords);
        profileRecords.forEach((record) => syncWorkflowRecord(record, currentUser));
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          reason instanceof Error
            ? reason.message
            : "No fue posible cargar los perfiles de egreso.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [currentUser, reloadVersion]);

  const permissions = getAcademicModulePermissions("perfilEgreso", currentUser.role);
  const isStepLocked =
    shouldEnforceAcademicWorkflowLock(currentUser.role) &&
    isAcademicWorkflowStepLocked("perfil-egreso");
  const isInheritedBaseStep = isAcademicWorkflowBaseStepInherited("perfil-egreso");
  const hasRecords = records.length > 0;

  const enrichedRecords = useMemo(() => enrichPerfilesEgreso(records, catalogs), [records, catalogs]);
  const roleScopedRecords = useMemo(() => applyRoleScope(enrichedRecords, currentUser), [enrichedRecords, currentUser]);
  const availableFilterOptions = useMemo(
    () => buildAvailableFilters(roleScopedRecords, catalogs, filters),
    [catalogs, filters, roleScopedRecords],
  );

  useEffect(() => {
    setFilters((current) => {
      const sanitized = sanitizeFilters(current, availableFilterOptions);
      return areFiltersEqual(sanitized, current) ? current : sanitized;
    });
  }, [availableFilterOptions]);

  const filteredRecords = useMemo(() => applyFilters(roleScopedRecords, filters), [filters, roleScopedRecords]);

  const openCreateModal = () => {
    if (!permissions.canCreate || loading) return;
    if (isInheritedBaseStep) {
      showNotification("El Perfil de egreso fue heredado del ciclo anterior y queda como información de consulta.");
      return;
    }
    setFormMode("create");
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openEditModal = (record: PerfilEgresoEnriched) => {
    if (!permissions.canUpdate) return;
    if (record.readonlyInherited || record.isInheritedAcademicBase) {
      showNotification("Este perfil de egreso fue heredado del ciclo anterior y queda como información de consulta.");
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
    if (!permissions.canDelete) return;
    if (record.readonlyInherited || record.isInheritedAcademicBase) {
      showNotification("Este perfil de egreso fue heredado del ciclo anterior y no se puede eliminar desde el nuevo plan.");
      return;
    }
    setRecordToDelete(record);
  };

  const confirmDelete = async () => {
    if (submitting) return;
    if (!recordToDelete || !permissions.canDelete) {
      setRecordToDelete(null);
      return;
    }
    setSubmitting(true);
    try {
      await deleteGraduationProfile(recordToDelete.id);
      setRecords((current) => current.filter((record) => record.id !== recordToDelete.id));
      try {
        mockBackend.remove<PerfilEgresoRecord>("perfilEgreso", recordToDelete.id, currentUser);
      } catch {
        // El registro ya fue eliminado en la fuente de verdad.
      }
      if (selectedRecord?.id === recordToDelete.id) {
        setSelectedRecord(null);
        setDetailOpen(false);
        setFormOpen(false);
      }
      setRecordToDelete(null);
      showNotification({ message: "El perfil de egreso fue eliminado.", variant: "success" });
    } catch (reason) {
      showNotification({
        title: "No fue posible eliminar",
        message: reason instanceof Error ? reason.message : "Intenta nuevamente.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
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

  const handleFormSubmit = async (values: FormState) => {
    const canSubmit = formMode === "create" ? permissions.canCreate : permissions.canUpdate;
    if (!canSubmit || submitting) return;
    if (isInheritedBaseStep || selectedRecord?.readonlyInherited || selectedRecord?.isInheritedAcademicBase) {
      showNotification("La información heredada del ciclo anterior queda en modo consulta.");
      setFormOpen(false);
      return;
    }

    setSubmitting(true);
    try {
      const record = formMode === "create"
        ? await createGraduationProfile({ planId: values.planId, descripcion: values.descripcion.trim() })
        : await updateGraduationProfile(selectedRecord!.id, {
            planId: values.planId,
            descripcion: values.descripcion.trim(),
            estado: values.estado,
          });
      setRecords((current) =>
        formMode === "create"
          ? [record, ...current]
          : current.map((item) => (item.id === record.id ? record : item)),
      );
      syncWorkflowRecord(record, currentUser);
      setFormOpen(false);
      setSelectedRecord(null);
      showNotification({
        message: formMode === "create"
          ? "El perfil de egreso fue creado."
          : "Los cambios del perfil fueron guardados.",
        variant: "success",
      });
    } catch (reason) {
      showNotification({
        title: "No fue posible guardar",
        message: reason instanceof Error ? reason.message : "Intenta nuevamente.",
        variant: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reload = useCallback(() => setReloadVersion((current) => current + 1), []);

  return {
    currentUser,
    catalogs,
    permissions,
    loading,
    loadError,
    submitting,
    reload,
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

export type UsePerfilEgresoPageResult = ReturnType<typeof usePerfilEgresoPage>;
