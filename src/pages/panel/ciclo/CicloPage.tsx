import { useMemo, useState } from "react";
import { GoCheckCircle, GoPlus, GoShieldCheck } from "react-icons/go";
import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepLocked,
} from "../../../components/panel";
import { mockBackend } from "../../../services/mockBackend";
import { Button, ConfirmDialog } from "../../../components/ui";
import CicloAccessState from "./components/CicloAccessState";
import CicloFilters from "./components/CicloFilters";
import CicloFormModal from "./components/CicloFormModal";
import CicloSummaryCard from "./components/CicloSummaryCard";
import { getCicloCatalogs, getCurrentCicloUser } from "./ciclo.mock";
import { cicloRolePermissions } from "./ciclo.permissions";
import type { CicloEnriched, CicloFilters as CicloFiltersState, CicloFormState, CicloMedicion } from "./ciclo.types";
import {
  INITIAL_CICLO_FILTERS,
  applyCycleFilters,
  applyRoleScope,
  buildCycleFromForm,
  enrichCiclos,
  getDefaultFormState,
  mapCycleToForm,
} from "./ciclo.utils";

const user = getCurrentCicloUser();
const catalogs = getCicloCatalogs();

export default function CicloPage() {
  const [cycles, setCycles] = useState<CicloMedicion[]>(() =>
    mockBackend.list<CicloMedicion>("ciclosMedicion", user),
  );
  const [filters, setFilters] = useState<CicloFiltersState>(INITIAL_CICLO_FILTERS);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState<CicloEnriched | null>(null);
  const [formValues, setFormValues] = useState<CicloFormState>(() =>
    getDefaultFormState(user, catalogs),
  );
  const [cycleToDelete, setCycleToDelete] = useState<CicloEnriched | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const permissions = cicloRolePermissions[user.role];
  const isStepLocked = isAcademicWorkflowStepLocked("ciclo");
  const hasCycles = cycles.length > 0;


  const enrichedCycles = useMemo(() => enrichCiclos(cycles, catalogs), [cycles]);

  const roleScopedCycles = useMemo(
    () => applyRoleScope(enrichedCycles, user),
    [enrichedCycles],
  );

  const filteredCycles = useMemo(
    () => applyCycleFilters(roleScopedCycles, filters),
    [filters, roleScopedCycles],
  );

  const defaultForm = useMemo(() => getDefaultFormState(user, catalogs), []);

  const handleFilterChange = <K extends keyof CicloFiltersState>(
    key: K,
    value: CicloFiltersState[K],
  ) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.facultadId = "";
        next.programaId = "";
      }

      if (key === "facultadId") {
        next.programaId = "";
      }

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

  const handleViewDetail = (_cycle: CicloEnriched) => {
    // TODO: Enrutar este botón al dashboard cuando esa vista esté conectada.
  };

  const handleSubmit = (values: CicloFormState) => {
    const baseCycle = buildCycleFromForm(
      values,
      catalogs,
      user,
      modalMode === "edit" ? selectedCycle : null,
    );
    const relatedMapeo = mockBackend
      .list<{ id: string; programaId?: string; planId?: string }>("mapeosCompetencias", user)
      .find((item) => item.planId === baseCycle.planId || item.programaId === baseCycle.programaId);
    const nextCycle = {
      ...baseCycle,
      mapeoCompetenciasId: baseCycle.mapeoCompetenciasId ?? relatedMapeo?.id,
    };

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

    // Integración futura: DELETE /ciclos/:id
    setCycles(mockBackend.remove<CicloMedicion>("ciclosMedicion", cycleToDelete.id, user));
    setSavedMessage("El ciclo fue eliminado de los datos temporales actuales.");
    setCycleToDelete(null);
  };

  const pageActions = permissions.canCreateCycle ? (
    <Button variant="primary" leftIcon={<GoPlus className="text-lg" />} onClick={openCreateModal}>
      Crear ciclo
    </Button>
  ) : null;

  return (
    <PanelLayout
      currentStep="ciclo"
      title="Creación del ciclo"
      description="Configuración del periodo de 1.5 años y selección de cursos del núcleo de Síntesis para el mapeo curricular."
      actions={!isStepLocked && hasCycles ? pageActions : undefined}
      breadcrumbItems={[
        { label: "Dashboard", href: "/panel/dashboard" },
        { label: "Gestión Académica" },
        { label: "Creación del ciclo" },
      ]}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("ciclo")}
          helperText="La restricción secuencial se valida solo en Gestión Académica."
        />
      ) : !permissions.canReadSummary ? (
        <CicloAccessState user={user} />
      ) : !hasCycles ? (
        <WorkflowStateCard
          title="Aún no hay ciclos de medición creados"
          description="Cuando se cree el primer ciclo, se habilitará el resumen con filtros, cursos seleccionados, periodo, estado y responsable."
          actionLabel={permissions.canCreateCycle ? "Crear ciclo" : undefined}
          onAction={permissions.canCreateCycle ? openCreateModal : undefined}
          helperText="No se muestran datos de prueba ni información precargada."
        />
      ) : (
        <div className="space-y-6">
          {savedMessage ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[color:rgba(118,202,102,0.14)] px-5 py-4 text-sm text-[var(--color-secondary-4)]">
              <span className="inline-flex items-center gap-2">
                <GoCheckCircle className="text-xl" />
                {savedMessage}
              </span>
              <button
                type="button"
                className="font-semibold text-[var(--color-secondary-1)]"
                onClick={() => setSavedMessage("")}
              >
                Cerrar
              </button>
            </div>
          ) : null}

          <CicloFilters
            user={user}
            permissions={permissions}
            catalogs={catalogs}
            filters={filters}
            baseCycles={roleScopedCycles}
            filteredCount={filteredCycles.length}
            totalCount={roleScopedCycles.length}
            onFilterChange={handleFilterChange}
            onReset={() => setFilters(INITIAL_CICLO_FILTERS)}
          />

          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  Resumen de ciclos creados
                </h2>
                <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                  Dashboard con plan de estudios, cursos seleccionados, periodo, estado y responsable.
                </p>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm text-[var(--color-gray-3)] shadow-sm">
                <GoShieldCheck className="text-base text-[var(--color-secondary-1)]" />
                Acciones según rol: {user.cargo}
              </span>
            </div>

            {filteredCycles.length > 0 ? (
              filteredCycles.map((cycle) => (
                <CicloSummaryCard
                  key={cycle.id}
                  ciclo={cycle}
                  user={user}
                  onView={handleViewDetail}
                  onEdit={openEditModal}
                  onDelete={setCycleToDelete}
                />
              ))
            ) : (
              <div className="surface-card p-8 text-center">
                <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  No hay ciclos para los filtros seleccionados
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
                  Ajusta los filtros o crea un ciclo nuevo desde un plan de estudios activo si tu rol tiene permiso.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      <CicloFormModal
        open={formOpen}
        mode={modalMode}
        catalogs={catalogs}
        user={user}
        initialValues={formValues}
        record={selectedCycle}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(cycleToDelete)}
        title="Eliminar ciclo"
        description={`¿Estás segura de que deseas eliminar ${cycleToDelete?.nombre ?? "este ciclo"}? Esta acción solo afectará los datos temporales actuales.`}
        confirmLabel="Aceptar"
        cancelLabel="Declinar"
        variant="danger"
        onCancel={() => setCycleToDelete(null)}
        onConfirm={confirmDelete}
      />
    </PanelLayout>
  );
}
