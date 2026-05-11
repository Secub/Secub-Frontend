import { useMemo, useState } from "react";
import { GoCheckCircle, GoPlus, GoProject, GoShieldCheck } from "react-icons/go";
import { PanelLayout } from "../../../components/panel";
import { Button, ConfirmDialog, Select } from "../../../components/ui";
import CicloAccessState from "./components/CicloAccessState";
import CicloFilters from "./components/CicloFilters";
import CicloFormModal from "./components/CicloFormModal";
import CicloSummaryCard from "./components/CicloSummaryCard";
import { getCicloCatalogs, getCurrentCicloUser, mockCiclos } from "./ciclo.mock";
import { cicloRolePermissions } from "./ciclo.permissions";
import type { CicloEnriched, CicloFilters as CicloFiltersState, CicloFormState, CicloMedicion } from "./ciclo.types";
import {
  INITIAL_CICLO_FILTERS,
  applyCycleFilters,
  applyRoleScope,
  buildCycleFromForm,
  enrichCiclos,
  getActivePlansByProgram,
  getDefaultFormState,
  mapCycleToForm,
} from "./ciclo.utils";

const user = getCurrentCicloUser();
const catalogs = getCicloCatalogs();

export default function CicloPage() {
  const [cycles, setCycles] = useState<CicloMedicion[]>(mockCiclos);
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

  const activeProgramsForCreation = useMemo(() => {
    return catalogs.programas.filter((programa) => {
      if (programa.estado !== "activo") return false;
      if (user.scope.programaId && programa.id !== user.scope.programaId) return false;
      if (user.scope.facultadId && programa.facultadId !== user.scope.facultadId) return false;
      if (user.scope.seccionalId && programa.seccionalId !== user.scope.seccionalId) return false;
      return true;
    });
  }, []);

  const selectedCreationProgram = catalogs.programas.find(
    (programa) => programa.id === formValues.programaId,
  );
  const selectedCreationPlans = getActivePlansByProgram(catalogs, formValues.programaId);

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

  const openCreateFromPlanPanel = () => {
    setModalMode("create");
    setSelectedCycle(null);
    setFormValues((current) => ({
      ...current,
      nombre: current.nombre || defaultForm.nombre,
      planId: current.planId || selectedCreationPlans[0]?.id || "",
      cursoIds: [],
    }));
    setFormOpen(true);
  };

  const openEditModal = (cycle: CicloEnriched) => {
    setModalMode("edit");
    setSelectedCycle(cycle);
    setFormValues(mapCycleToForm(cycle));
    setFormOpen(true);
  };

  const openViewModal = (cycle: CicloEnriched) => {
    setModalMode("view");
    setSelectedCycle(cycle);
    setFormValues(mapCycleToForm(cycle));
    setFormOpen(true);
  };

  const handleSubmit = (values: CicloFormState) => {
    const nextCycle = buildCycleFromForm(
      values,
      catalogs,
      user,
      modalMode === "edit" ? selectedCycle : null,
    );

    setCycles((current) => {
      if (modalMode === "edit") {
        return current.map((cycle) => (cycle.id === nextCycle.id ? nextCycle : cycle));
      }

      return [nextCycle, ...current];
    });

    setSavedMessage(
      modalMode === "edit"
        ? "La selección se actualizó correctamente con la selección de cursos de Síntesis."
        : "La selección se creó correctamente y quedó asociada al plan de estudios seleccionado.",
    );
    setFormOpen(false);
    setSelectedCycle(null);
  };

  const confirmDelete = () => {
    if (!cycleToDelete) return;

    // Integración futura: DELETE /selecciones-cursos/:id
    setCycles((current) => current.filter((cycle) => cycle.id !== cycleToDelete.id));
    setSavedMessage("La selección fue eliminada de los datos mock actuales.");
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
      title="Selección de Cursos"
      description="Selección de cursos del núcleo de Síntesis para el mapeo curricular y seguimiento de la selección de cursos durante 1.5 años."
      actions={pageActions}
      breadcrumbItems={[
        { label: "Dashboard", href: "/panel/dashboard" },
        { label: "Gestión Académica" },
        { label: "Selección de cursos" },
      ]}
    >
      {!permissions.canReadSummary ? (
        <CicloAccessState user={user} />
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

          {permissions.canCreateCycle ? (
            <section className="surface-card p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <GoProject className="text-xl text-[var(--color-secondary-1)]" />
                    <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                      Crear nueva selección de cursos - Plan de estudios activos
                    </h2>
                  </div>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
                    El Director de Programa puede crear selecciones únicamente para su programa activo.
                    La duración se configura automáticamente en 1.5 años.
                  </p>
                </div>

                
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-start">
                <Select
                  label="Programa académico"
                  value={formValues.programaId}
                  options={activeProgramsForCreation.map((programa) => ({
                    label: programa.nombre,
                    value: programa.id,
                  }))}
                  placeholder="Selecciona un programa"
                  disabled={Boolean(user.scope.programaId)}
                  onChange={(event) => {
                    const nextProgramId = event.target.value;
                    const firstPlan = getActivePlansByProgram(catalogs, nextProgramId)[0];
                    setFormValues((current) => ({
                      ...current,
                      programaId: nextProgramId,
                      planId: firstPlan?.id ?? "",
                      cursoIds: [],
                    }));
                  }}
                  helperText={
                    selectedCreationProgram?.estado === "activo"
                      ? "Programa activo disponible para crear selección."
                      : "El programa debe estar activo."
                  }
                />

                <Select
                  label="Plan de estudios"
                  value={formValues.planId}
                  options={selectedCreationPlans.map((plan) => ({
                    label: plan.nombre,
                    value: plan.id,
                  }))}
                  placeholder="Selecciona un plan activo"
                  disabled={selectedCreationPlans.length === 0}
                  onChange={(event) =>
                    setFormValues((current) => ({
                      ...current,
                      planId: event.target.value,
                      cursoIds: [],
                    }))
                  }
                />

                <div className="md:pt-[1.875rem]">
                  <Button
                    variant="primary"
                    leftIcon={<GoPlus className="text-lg" />}
                    onClick={openCreateFromPlanPanel}
                    disabled={!formValues.programaId || !formValues.planId}
                  >
                    Crear ciclo
                  </Button>
                </div>
              </div>
            </section>
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
                  Resumen de selecciones de cursos
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
                  onView={openViewModal}
                  onEdit={openEditModal}
                  onDelete={setCycleToDelete}
                />
              ))
            ) : (
              <div className="surface-card p-8 text-center">
                <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  No hay selecciones para los filtros seleccionados
                </h3>
                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
                  Ajusta los filtros o crea una nueva selección de cursos desde un plan de estudios activo si tu rol tiene permiso.
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
        title="Eliminar selección"
        description={`¿Estás segura de que deseas eliminar ${cycleToDelete?.nombre ?? "esta selección"}? Esta acción solo afectará los datos mock actuales.`}
        confirmLabel="Aceptar"
        cancelLabel="Declinar"
        variant="danger"
        onCancel={() => setCycleToDelete(null)}
        onConfirm={confirmDelete}
      />
    </PanelLayout>
  );
}
