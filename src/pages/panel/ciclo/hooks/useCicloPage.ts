import { useCallback, useEffect, useMemo, useState } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import { getCurrentCicloUser } from "../ciclo.mock";
import { getCyclePermissions } from "../../../../config/access/permissions";
import type { CicloCatalogs, CicloEnriched, CicloFilters as CicloFiltersState, CicloFormState, CicloMedicion } from "../ciclo.types";
import { createCycle, deleteCycle, getCycleContext, listCycles, updateCycle } from "../../../../services/cycles";
import { listCompetencyMappings } from "../../../../services/competencyMappings";
import { showNotification } from "../../../../shared/feedback";
import {
  INITIAL_CICLO_FILTERS,
  applyCycleFilters,
  applyRoleScope,
  enrichCiclos,
  getDefaultFormState,
  mapCycleToForm,
} from "../ciclo.utils";

const user = getCurrentCicloUser();
const EMPTY_CATALOGS: CicloCatalogs = {
  seccionales: [],
  facultades: [],
  programas: [],
  planes: [],
  cursos: [],
};

export function useCicloPage() {
  const [catalogs, setCatalogs] = useState<CicloCatalogs>(EMPTY_CATALOGS);
  const [cycles, setCycles] = useState<CicloMedicion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mappingReady, setMappingReady] = useState(false);
  const [filters, setFilters] = useState<CicloFiltersState>(INITIAL_CICLO_FILTERS);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<CicloEnriched | null>(null);
  const [formValues, setFormValues] = useState<CicloFormState>(() => getDefaultFormState(user, catalogs));
  const [cycleToDelete, setCycleToDelete] = useState<CicloEnriched | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const permissions = getCyclePermissions(user.role);
  const isStepLocked = !loading && !mappingReady;
  const hasCycles = cycles.length > 0;

  const enrichedCycles = useMemo(() => enrichCiclos(cycles, catalogs), [cycles, catalogs]);
  const roleScopedCycles = useMemo(() => applyRoleScope(enrichedCycles, user), [enrichedCycles]);
  const filteredCycles = useMemo(() => applyCycleFilters(roleScopedCycles, filters), [filters, roleScopedCycles]);
  const defaultForm = useMemo(() => getDefaultFormState(user, catalogs), [catalogs]);

  const activeCycle = useMemo(
    () => roleScopedCycles.find((ciclo) => ciclo.estado === "activo") ?? null,
    [roleScopedCycles],
  );

  const canCreateCycle = useMemo(() => {
    if (!permissions.canCreateCycle) return false;
    if (activeCycle) return false;
    return true;
  }, [permissions.canCreateCycle, activeCycle]);

  const activeCycleLockMessage = useMemo(() => {
    if (permissions.canCreateCycle && activeCycle) {
      return `Ya existe un ciclo en curso: "${activeCycle.nombre}". No se podrá crear otro ciclo ni duplicar un ciclo existente hasta que su estado sea diferente a "En curso".`;
    }
    return null;
  }, [permissions.canCreateCycle, activeCycle]);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setLoadError(null);
    setMappingReady(false);
    try {
      const [context, records, mappings] = await Promise.all([
        getCycleContext(signal),
        listCycles(signal),
        listCompetencyMappings(signal),
      ]);
      if (signal?.aborted) return;
      const { scope } = context;
      setCatalogs({
        seccionales: [{ id: scope.seccionalId, nombre: scope.seccionalNombre }],
        facultades: [{ id: scope.facultadId, nombre: scope.facultadNombre, seccionalId: scope.seccionalId }],
        programas: [{
          id: scope.programaId,
          nombre: scope.programaNombre,
          facultadId: scope.facultadId,
          seccionalId: scope.seccionalId,
          estado: "activo",
        }],
        planes: context.planes,
        cursos: context.cursos,
      });
      setCycles(records);
      setMappingReady(context.mapeoFinalizado);
      mappings.forEach((mapping) => {
        try { mockBackend.upsert("mapeosCompetencias", mapping, user); }
        catch { /* El backend conserva la fuente de verdad. */ }
      });
      records.forEach((record) => {
        try { mockBackend.upsert("ciclosMedicion", record, user); }
        catch { /* El backend conserva la fuente de verdad. */ }
      });
    } catch (reason) {
      if (signal?.aborted) return;
      setLoadError(reason instanceof Error ? reason.message : "No fue posible cargar los ciclos de medición.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  const handleFilterChange = <K extends keyof CicloFiltersState>(key: K, value: CicloFiltersState[K]) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "seccionalId") {
        next.facultadId = "";
        next.programaId = "";
      }
      if (key === "facultadId") next.programaId = "";
      return next;
    });
  };

  const openCreateModal = () => {
    if (!canCreateCycle) return;

    setModalMode("create");
    setSelectedCycle(null);
    setFormValues(defaultForm);
    setFormOpen(true);
  };

  const openEditModal = (cycle: CicloEnriched) => {
    if (!permissions.canEditCycle) return;

    setModalMode("edit");
    setSelectedCycle(cycle);
    setFormValues(mapCycleToForm(cycle));
    setFormOpen(true);
  };

  const handleViewDetail = (cycle: CicloEnriched) => {
    setModalMode("view");
    setSelectedCycle(cycle);
    setFormValues(mapCycleToForm(cycle));
    setFormOpen(true);
  };

  const openDuplicateModal = (cycle: CicloEnriched) => {
    if (!permissions.canDuplicateCycle) return;

    if (activeCycle) return;

    setModalMode("create");
    setSelectedCycle(cycle);
    const formValues = mapCycleToForm(cycle);
    setFormValues({
      ...formValues,
      // nombre: `${cycle.nombre} - Copia`,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (values: CicloFormState) => {
    const canSubmit = modalMode === "edit" ? permissions.canEditCycle : permissions.canCreateCycle;
    if (!canSubmit) {
      setFormOpen(false);
      return;
    }

    try {
      const input = {
        planId: values.planId,
        fechaInicio: values.fechaInicio,
        cursoIds: values.cursoIds,
      };
      const saved = modalMode === "edit" && selectedCycle
        ? await updateCycle(selectedCycle.id, input)
        : await createCycle(input);
      setCycles((current) => {
        const exists = current.some((cycle) => cycle.id === saved.id);
        return exists ? current.map((cycle) => cycle.id === saved.id ? saved : cycle) : [saved, ...current];
      });
      try { mockBackend.upsert("ciclosMedicion", saved, user); }
      catch { /* El backend conserva la fuente de verdad. */ }
      setSavedMessage(
        modalMode === "edit"
          ? "El ciclo se actualizó correctamente con la selección de cursos de Síntesis."
          : "El ciclo se creó correctamente y quedó asociado al plan de estudios seleccionado.",
      );
      setFormOpen(false);
      setSelectedCycle(null);
    } catch (reason) {
      showNotification({
        title: "No fue posible guardar el ciclo",
        message: reason instanceof Error ? reason.message : "Inténtalo nuevamente.",
        variant: "error",
      });
    }
  };

  const confirmDelete = async () => {
    if (!cycleToDelete) return;

    if (!permissions.canDeleteCycle) {
      setCycleToDelete(null);
      return;
    }
    try {
      await deleteCycle(cycleToDelete.id);
      setCycles((current) => current.filter((cycle) => cycle.id !== cycleToDelete.id));
      try { mockBackend.remove<CicloMedicion>("ciclosMedicion", cycleToDelete.id, user); }
      catch { /* El registro ya fue eliminado del backend. */ }
      setSavedMessage("El ciclo fue eliminado correctamente.");
      setCycleToDelete(null);
    } catch (reason) {
      showNotification({
        title: "No fue posible eliminar el ciclo",
        message: reason instanceof Error ? reason.message : "Inténtalo nuevamente.",
        variant: "error",
      });
    }
  };

  return {
    user,
    loading,
    loadError,
    refresh,
    catalogs,
    permissions,
    isStepLocked,
    hasCycles,
    filters,
    modalMode,
    formOpen,
    selectedCycle,
    formValues,
    cycleToDelete,
    savedMessage,
    roleScopedCycles,
    filteredCycles,
    activeCycle,
    canCreateCycle,
    activeCycleLockMessage,
    handleFilterChange,
    openCreateModal,
    openEditModal,
    openDuplicateModal,
    handleViewDetail,
    handleSubmit,
    confirmDelete,
    setFilters,
    setFormOpen,
    setCycleToDelete,
    setSavedMessage,
  };
}

export type UseCicloPageResult = ReturnType<typeof useCicloPage>;
