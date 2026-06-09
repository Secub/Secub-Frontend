import { useMemo, useState } from "react";
import { isAcademicWorkflowStepLocked } from "../../../../components/panel";
import { mockBackend } from "../../../../services/mockBackend";
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
const catalogs = getCicloCatalogs();

export function useCicloPage() {
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

  const enrichedCycles = useMemo(() => enrichCiclos(cycles, catalogs), [cycles]);
  const roleScopedCycles = useMemo(() => applyRoleScope(enrichedCycles, user), [enrichedCycles]);
  const filteredCycles = useMemo(() => applyCycleFilters(roleScopedCycles, filters), [filters, roleScopedCycles]);
  const defaultForm = useMemo(() => getDefaultFormState(user, catalogs), []);
  
  // Detectar ciclo activo del director para su programa actual
  const activeCycleForDirector = useMemo(() => {
    if (user.role !== "director" || !user.scope.programaId) return null;
    return roleScopedCycles.find((ciclo) => ciclo.estado === "activo");
  }, [roleScopedCycles, user.role, user.scope.programaId]);
  
  // Determinar si se puede crear un ciclo basado en ciclos activos
  const canCreateCycle = useMemo(() => {
    if (!permissions.canCreateCycle) return false;
    // Si el usuario es director y tiene un ciclo activo, no puede crear otro
    if (user.role === "director" && activeCycleForDirector) return false;
    return true;
  }, [permissions.canCreateCycle, user.role, activeCycleForDirector]);
  
  // Obtener mensaje de por qué no se puede crear
  const createDisabledReason = useMemo(() => {
    if (permissions.canCreateCycle && user.role === "director" && activeCycleForDirector) {
      return `Ya existe un ciclo activo: "${activeCycleForDirector.nombre}". Espera a que finalice para crear otro.`;
    }
    return null;
  }, [permissions.canCreateCycle, user.role, activeCycleForDirector]);

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

  const openDuplicateModal = (cycle: CicloEnriched) => {
    setModalMode("create");
    setSelectedCycle(cycle);
    const formValues = mapCycleToForm(cycle);
    setFormValues({
      ...formValues,
      nombre: `${cycle.nombre} - Copia`,
    });
    setFormOpen(true);
  };

  const handleViewDetail = (cycle: CicloEnriched) => {
    setModalMode("view");
    setSelectedCycle(cycle);
    setFormValues(mapCycleToForm(cycle));
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
    canCreateCycle,
    createDisabledReason,
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
