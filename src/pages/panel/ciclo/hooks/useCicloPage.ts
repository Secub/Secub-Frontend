import { useEffect, useMemo, useState } from "react";
import { isAcademicWorkflowStepLocked } from "../../../../components/panel";
import { mockBackend, subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import { getCicloCatalogs, getCurrentCicloUser } from "../ciclo.mock";
import { cicloRolePermissions } from "../ciclo.permissions";
import type { CicloEnriched, CicloFilters as CicloFiltersState, CicloFormState, CicloMedicion } from "../ciclo.types";
import {
  INITIAL_CICLO_FILTERS,
  applyCycleFilters,
  applyRoleScope,
  buildCycleFromForm,
  enrichCiclos,
  getDefaultFormState,
  mapCycleToForm,
} from "../ciclo.utils";

const user = getCurrentCicloUser();

export function useCicloPage() {
  const [catalogs, setCatalogs] = useState(() => getCicloCatalogs(user));
  const [cycles, setCycles] = useState<CicloMedicion[]>(() =>
    mockBackend.list<CicloMedicion>("ciclosMedicion", user),
  );
  const [filters, setFilters] = useState<CicloFiltersState>(INITIAL_CICLO_FILTERS);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<CicloEnriched | null>(null);
  const [formValues, setFormValues] = useState<CicloFormState>(() => getDefaultFormState(user, catalogs));
  const [cycleToDelete, setCycleToDelete] = useState<CicloEnriched | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const permissions = cicloRolePermissions[user.role];
  const isStepLocked = isAcademicWorkflowStepLocked("ciclo");
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

  useEffect(() => {
    const refreshData = () => {
      setCatalogs(getCicloCatalogs(user));
      setCycles(mockBackend.list<CicloMedicion>("ciclosMedicion", user));
    };

    refreshData();
    return subscribeToMockBackendChanges(refreshData);
  }, []);

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
    if (activeCycle) return;

    setModalMode("create");
    setSelectedCycle(cycle);
    const formValues = mapCycleToForm(cycle);
    setFormValues({
      ...formValues,
      nombre: `${cycle.nombre} - Copia`,
    });
    setFormOpen(true);
  };

  const handleSubmit = (values: CicloFormState) => {
    const baseCycle = buildCycleFromForm(values, catalogs, user, modalMode === "edit" ? selectedCycle : null);
    const relatedMapeo = mockBackend
      .list<{ id: string; programaId?: string; planId?: string }>("mapeosCompetencias", user)
      .find((item) => item.planId === baseCycle.planId || item.programaId === baseCycle.programaId);
    const nextCycle = { ...baseCycle, mapeoCompetenciasId: baseCycle.mapeoCompetenciasId ?? relatedMapeo?.id };

    setCycles(
      modalMode === "edit"
        ? mockBackend.update<CicloMedicion>("ciclosMedicion", nextCycle, user)
        : mockBackend.create<CicloMedicion>("ciclosMedicion", nextCycle, user),
    );

    setSavedMessage(
      modalMode === "edit"
        ? "El ciclo se actualizó correctamente con la selección de cursos de Síntesis."
        : "El ciclo se creó correctamente y quedó asociado al plan de estudios seleccionado.",
    );
    setFormOpen(false);
    setSelectedCycle(null);
  };

  const confirmDelete = () => {
    if (!cycleToDelete) return;
    setCycles(mockBackend.remove<CicloMedicion>("ciclosMedicion", cycleToDelete.id, user));
    setSavedMessage("El ciclo fue eliminado de los datos temporales actuales.");
    setCycleToDelete(null);
  };

  return {
    user,
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
