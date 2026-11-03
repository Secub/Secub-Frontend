import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../app/appRoutes";
import { useBrowserLocation } from "../../../app/router/useBrowserLocation";
import { Button, Input, Modal, SecubIcon, Select, type BreadcrumbItem } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";
import { getMeasurementContext } from "../../../services/measurements";
import { buildDashboardDataFromApi } from "../dashboard/dashboard.api";
import { showNotification } from "../../../shared/feedback";
import {
  filterManagedUsers,
  getCycleSettingsKey,
  readSeccionalesWorkspace,
  SECCIONAL_RECORDS,
  writeSeccionalesWorkspace,
  type CycleSettings,
  type ManagedRole,
  type ManagedUser,
  type SeccionalRecord,
  type SeccionalesWorkspace,
} from "./seccionales.data";

type DetailTab = "cycles" | "users";

interface CycleSettingsDraft {
  durationYears: string;
  minimumCompliance: string;
  minimumRaPerCompetence: string;
  maximumRaPerCompetence: string;
}

const EMPTY_CYCLE_SETTINGS: CycleSettingsDraft = {
  durationYears: "",
  minimumCompliance: "",
  minimumRaPerCompetence: "",
  maximumRaPerCompetence: "",
};

const roleOptions = [
  { label: "Decano", value: "decano" },
  { label: "Vicerrector", value: "vicerrector" },
];

function getStatusClass(isActive: boolean) {
  return isActive
    ? "bg-[color:var(--color-tint-success)] text-[var(--color-success)]"
    : "bg-[color:var(--color-tint-danger)] text-[var(--color-error)]";
}

function StatusPill({ children, active }: { children: string; active: boolean }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(active)}`}>
      {children}
    </span>
  );
}

function SeccionalList({
  onView,
}: {
  onView: (seccional: SeccionalRecord) => void;
}) {
  return (
    <section className="surface-card overflow-hidden" aria-label="Organizaciones SECUB">
      <div className="border-b border-[var(--secub-border)] px-6 py-5">
        <h2 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
          Organizaciones
        </h2>
        <p className="mt-1 text-sm text-[var(--color-gray-3)]">
          Consulta el estado y la administración de cada seccional.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead className="bg-[var(--secub-surface-soft)] text-xs uppercase tracking-wide text-[var(--color-gray-3)]">
            <tr>
              <th className="px-6 py-4 font-semibold">Seccional</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold">Administrador / vicerrector</th>
              <th className="px-6 py-4 font-semibold">Fecha de creación</th>
              <th className="px-6 py-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--secub-border)]">
            {SECCIONAL_RECORDS.map((seccional) => (
              <tr key={seccional.id} className="text-[var(--secub-text)]">
                <td className="px-6 py-5 font-semibold">{seccional.name}</td>
                <td className="px-6 py-5">
                  <StatusPill active={seccional.status === "activa"}>
                    {seccional.status === "activa" ? "Activa" : "Inactiva"}
                  </StatusPill>
                </td>
                <td className="px-6 py-5">{seccional.administrator}</td>
                <td className="px-6 py-5 text-[var(--color-gray-3)]">{seccional.createdAt}</td>
                <td className="px-6 py-5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<SecubIcon name="view" size={18} />}
                    onClick={() => onView(seccional)}
                    aria-label={`Ver seccional ${seccional.name}`}
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[var(--secub-border)] px-6 py-4 text-xs text-[var(--color-gray-3)]">
        Los datos de administración y fechas se completarán cuando el backend habilite la gestión de seccionales.
      </p>
    </section>
  );
}

function SeccionalDetails({
  seccional,
  tab,
  setTab,
  facultadId,
  programaId,
  setFacultadId,
  setProgramaId,
  facultadOptions,
  programaOptions,
  workspace,
  onSaveWorkspace,
  catalogsError,
}: {
  seccional: SeccionalRecord;
  tab: DetailTab;
  setTab: (tab: DetailTab) => void;
  facultadId: string;
  programaId: string;
  setFacultadId: (id: string) => void;
  setProgramaId: (id: string) => void;
  facultadOptions: { label: string; value: string }[];
  programaOptions: { label: string; value: string }[];
  workspace: SeccionalesWorkspace;
  onSaveWorkspace: (workspace: SeccionalesWorkspace, message: string) => boolean;
  catalogsError: string;
}) {
  const [settings, setSettings] = useState<CycleSettingsDraft>(EMPTY_CYCLE_SETTINGS);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<ManagedRole>("decano");
  const [newUserStatus, setNewUserStatus] = useState<"activo" | "inactivo">("activo");
  const [formError, setFormError] = useState("");
  const settingsKey = getCycleSettingsKey(seccional.id, facultadId, programaId);

  useEffect(() => {
    const savedSettings = workspace.cycleSettings[settingsKey];
    setSettings(savedSettings
      ? {
          durationYears: String(savedSettings.durationYears),
          minimumCompliance: String(savedSettings.minimumCompliance),
          minimumRaPerCompetence: String(savedSettings.minimumRaPerCompetence),
          maximumRaPerCompetence: String(savedSettings.maximumRaPerCompetence),
        }
      : EMPTY_CYCLE_SETTINGS);
  }, [settingsKey, workspace.cycleSettings]);

  const visibleUsers = useMemo(
    () => filterManagedUsers(workspace.users, {
      seccionalId: seccional.id,
      facultadId,
      programaId,
      role: roleFilter,
    }),
    [workspace.users, seccional.id, facultadId, programaId, roleFilter],
  );

  const updateSettings = <K extends keyof CycleSettingsDraft>(key: K, value: CycleSettingsDraft[K]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const parsedSettings: CycleSettings = {
    durationYears: Number(settings.durationYears),
    minimumCompliance: Number(settings.minimumCompliance),
    minimumRaPerCompetence: Number(settings.minimumRaPerCompetence),
    maximumRaPerCompetence: Number(settings.maximumRaPerCompetence),
  };
  const hasAllSettings = Object.values(settings).every((value) => value.trim() !== "");
  const settingsAreValid =
    hasAllSettings &&
    Object.values(parsedSettings).every(Number.isFinite) &&
    parsedSettings.durationYears >= 1 &&
    parsedSettings.minimumCompliance >= 0 &&
    parsedSettings.minimumCompliance <= 100 &&
    parsedSettings.minimumRaPerCompetence >= 1 &&
    parsedSettings.maximumRaPerCompetence >= parsedSettings.minimumRaPerCompetence;
  const hasSavedSettings = Boolean(workspace.cycleSettings[settingsKey]);

  const saveSettings = () => {
    if (!settingsAreValid) return;
    onSaveWorkspace(
      {
        ...workspace,
        cycleSettings: { ...workspace.cycleSettings, [settingsKey]: parsedSettings },
      },
      "Los parámetros del ciclo se guardaron en este navegador.",
    );
  };

  const createUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = newUserEmail.trim().toLocaleLowerCase("es");
    if (workspace.users.some((user) => user.email.toLocaleLowerCase("es") === email)) {
      setFormError("Ya existe un usuario registrado con este correo.");
      return;
    }

    const user: ManagedUser = {
      id: crypto.randomUUID(),
      name: newUserName.trim(),
      email,
      roles: [newUserRole],
      seccionalId: seccional.id,
      status: newUserStatus,
      enabled: newUserStatus === "activo",
      facultadId,
      programaId,
    };
    const saved = onSaveWorkspace(
      { ...workspace, users: [...workspace.users, user] },
      "El usuario se guardó en este navegador.",
    );
    if (!saved) return;

    setUserModalOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("decano");
    setNewUserStatus("activo");
    setFormError("");
  };

  const toggleUser = (user: ManagedUser) => {
    const enabled = !user.enabled;
    const updatedUser = {
      ...user,
      enabled,
      status: enabled ? "activo" as const : "inactivo" as const,
    };
    onSaveWorkspace(
      {
        ...workspace,
        users: workspace.users.map((item) => item.id === user.id ? updatedUser : item),
      },
      `Usuario ${enabled ? "habilitado" : "deshabilitado"}.`,
    );
  };

  return (
    <>
      <section className="surface-card p-5 md:p-6" aria-label={`Administración de ${seccional.name}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="min-w-[220px]">
              <Select
                label="Facultad"
                placeholder="Todas las facultades"
                value={facultadId}
                options={facultadOptions}
                onChange={(event) => {
                  setFacultadId(event.target.value);
                  setProgramaId("");
                }}
              />
            </div>
            <div className="min-w-[240px]">
              <Select
                label="Programa académico"
                placeholder="Todos los programas"
                value={programaId}
                options={programaOptions}
                onChange={(event) => setProgramaId(event.target.value)}
              />
            </div>
          </div>
          {tab === "users" ? (
            <Button
              leftIcon={<SecubIcon name="add" size={20} />}
              onClick={() => {
                setFormError("");
                setUserModalOpen(true);
              }}
            >
              Crear usuario
            </Button>
          ) : null}
        </div>
        {catalogsError ? (
          <p role="status" className="mt-4 rounded-xl border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] px-4 py-3 text-sm text-[var(--color-gray-3)]">
            No fue posible cargar el catálogo académico desde el backend. Los filtros de facultad y programa estarán disponibles cuando la API responda.
          </p>
        ) : null}
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex border-b border-[var(--secub-border)] px-4 md:px-6" role="tablist" aria-label="Administración de la seccional">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "cycles"}
            onClick={() => setTab("cycles")}
            className={`min-h-14 border-b-2 px-4 text-sm font-semibold transition-colors ${
              tab === "cycles"
                ? "border-[var(--secub-secondary)] text-[var(--secub-secondary)]"
                : "border-transparent text-[var(--color-gray-3)] hover:text-[var(--secub-text)]"
            }`}
          >
            Ciclos de medición
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "users"}
            onClick={() => setTab("users")}
            className={`min-h-14 border-b-2 px-4 text-sm font-semibold transition-colors ${
              tab === "users"
                ? "border-[var(--secub-secondary)] text-[var(--secub-secondary)]"
                : "border-transparent text-[var(--color-gray-3)] hover:text-[var(--secub-text)]"
            }`}
          >
            Usuarios
          </button>
        </div>

        {tab === "cycles" ? (
          <div className="p-5 md:p-6" role="tabpanel">
            <div className="mb-6">
              <h2 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                Parámetros de medición
              </h2>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Configura los valores aprobados para {seccional.name}. Los cambios se guardan por facultad y programa.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <Input
                label="Duración del ciclo (años)"
                type="number"
                min="1"
                step="1"
                value={settings.durationYears}
                onChange={(event) => updateSettings("durationYears", event.target.value)}
              />
              <Input
                label="Umbral mínimo de cumplimiento (%)"
                type="number"
                min="0"
                max="100"
                step="1"
                value={settings.minimumCompliance}
                onChange={(event) => updateSettings("minimumCompliance", event.target.value)}
              />
              <Input
                label="Mínimo de RA por competencia"
                type="number"
                min="1"
                step="1"
                value={settings.minimumRaPerCompetence}
                onChange={(event) => updateSettings("minimumRaPerCompetence", event.target.value)}
              />
              <Input
                label="Máximo de RA por competencia"
                type="number"
                min="1"
                step="1"
                value={settings.maximumRaPerCompetence}
                error={settings.minimumRaPerCompetence !== "" &&
                  settings.maximumRaPerCompetence !== "" &&
                  parsedSettings.maximumRaPerCompetence < parsedSettings.minimumRaPerCompetence
                  ? "Debe ser igual o mayor al mínimo."
                  : undefined}
                onChange={(event) => updateSettings("maximumRaPerCompetence", event.target.value)}
              />
            </div>
            {!hasSavedSettings ? (
              <p className="mt-4 text-xs text-[var(--color-gray-3)]">
                Aún no hay valores institucionales configurados para este alcance.
              </p>
            ) : null}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--secub-border)] pt-5">
              <p className="max-w-2xl text-xs leading-5 text-[var(--color-gray-3)]">
                Los valores se conservan en este navegador; todavía no se sincronizan con el backend.
              </p>
              <Button
                leftIcon={<SecubIcon name="check" size={18} />}
                onClick={saveSettings}
                disabled={!settingsAreValid}
              >
                Guardar cambios
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-5 md:p-6" role="tabpanel">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                  Usuarios de {seccional.name}
                </h2>
                <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                  Administra el acceso y los roles asignados a esta seccional.
                </p>
              </div>
              <div className="w-full md:max-w-xs">
                <Select
                  label="Filtrar por rol"
                  placeholder="Todos los roles"
                  value={roleFilter}
                  options={roleOptions}
                  onChange={(event) => setRoleFilter(event.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-[var(--secub-border)]">
              <table className="w-full min-w-[950px] border-collapse text-left text-sm">
                <thead className="bg-[var(--secub-surface-soft)] text-xs uppercase tracking-wide text-[var(--color-gray-3)]">
                  <tr>
                    <th className="px-4 py-4 font-semibold">Nombre</th>
                    <th className="px-4 py-4 font-semibold">Correo</th>
                    <th className="px-4 py-4 font-semibold">Rol(es)</th>
                    <th className="px-4 py-4 font-semibold">Seccional</th>
                    <th className="px-4 py-4 font-semibold">Estado</th>
                    <th className="px-4 py-4 font-semibold">Habilitado</th>
                    <th className="px-4 py-4 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--secub-border)]">
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-4 font-semibold">{user.name}</td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">
                        {user.roles.map((role) => roleOptions.find((option) => option.value === role)?.label ?? role).join(", ")}
                      </td>
                      <td className="px-4 py-4">{seccional.name}</td>
                      <td className="px-4 py-4">
                        <StatusPill active={user.status === "activo"}>
                          {user.status === "activo" ? "Activo" : "Inactivo"}
                        </StatusPill>
                      </td>
                      <td className="px-4 py-4">
                        <StatusPill active={user.enabled}>{user.enabled ? "Sí" : "No"}</StatusPill>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          variant={user.enabled ? "outline" : "primary"}
                          size="sm"
                          onClick={() => toggleUser(user)}
                          aria-label={`${user.enabled ? "Deshabilitar" : "Habilitar"} a ${user.name}`}
                        >
                          {user.enabled ? "Deshabilitar" : "Habilitar"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {visibleUsers.length === 0 ? (
                    <tr>
                      <td className="px-4 py-12 text-center text-sm text-[var(--color-gray-3)]" colSpan={7}>
                        No hay usuarios para los filtros seleccionados. Usa «Crear usuario» para agregar uno.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <Modal
        open={userModalOpen}
        title="Crear usuario"
        description={`El usuario quedará asociado a la seccional ${seccional.name}.`}
        size="md"
        onClose={() => setUserModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setUserModalOpen(false)}>Cancelar</Button>
            <Button type="submit" form="create-seccional-user-form">Crear usuario</Button>
          </div>
        }
      >
        <form id="create-seccional-user-form" className="space-y-5" onSubmit={createUser}>
          <Input
            label="Nombre"
            autoComplete="name"
            value={newUserName}
            onChange={(event) => setNewUserName(event.target.value)}
            required
            maxLength={120}
            data-autofocus
          />
          <Input
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            value={newUserEmail}
            onChange={(event) => setNewUserEmail(event.target.value)}
            required
            maxLength={254}
          />
          <Select
            label="Rol"
            value={newUserRole}
            options={roleOptions}
            onChange={(event) => {
              const role = event.target.value;
              if (role === "decano" || role === "vicerrector") setNewUserRole(role);
            }}
          />
          <Select
            label="Estado"
            value={newUserStatus}
            options={[
              { label: "Activo", value: "activo" },
              { label: "Inactivo", value: "inactivo" },
            ]}
            onChange={(event) => {
              const status = event.target.value;
              if (status === "activo" || status === "inactivo") setNewUserStatus(status);
            }}
          />
          {formError ? <p role="alert" className="text-sm text-[var(--color-error)]">{formError}</p> : null}
          <p className="text-xs leading-5 text-[var(--color-gray-3)]">
            Los permisos se asignan según el rol seleccionado y la seccional actual.
          </p>
        </form>
      </Modal>
    </>
  );
}

export default function SeccionalesPage() {
  const location = useBrowserLocation();
  const searchParams = new URLSearchParams(location.search);
  const seccionalId = searchParams.get("seccional") ?? "";
  const selectedSeccional = SECCIONAL_RECORDS.find((item) => item.id === seccionalId);
  const [tab, setTab] = useState<DetailTab>("cycles");
  const [facultadId, setFacultadId] = useState("");
  const [programaId, setProgramaId] = useState("");
  const [workspace, setWorkspace] = useState<SeccionalesWorkspace>({ users: [], cycleSettings: {} });
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [catalogs, setCatalogs] = useState<{ facultades: { id: string; name: string; seccionalId: string }[]; programas: { id: string; name: string; facultadId: string; seccionalId: string }[] }>({
    facultades: [],
    programas: [],
  });
  const [catalogsError, setCatalogsError] = useState("");

  useEffect(() => {
    try {
      setWorkspace(readSeccionalesWorkspace());
      setStorageError("");
    } catch (error) {
      setStorageError(error instanceof Error ? error.message : "No se pudieron cargar los datos locales.");
    } finally {
      setStorageReady(true);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void getMeasurementContext(controller.signal)
      .then((context) => {
        const dashboardData = buildDashboardDataFromApi(context);
        setCatalogs({
          facultades: dashboardData.catalogs.facultades,
          programas: dashboardData.catalogs.programas,
        });
        setCatalogsError("");
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setCatalogsError(error instanceof Error ? error.message : "Error al consultar el catálogo académico.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setTab("cycles");
    setFacultadId("");
    setProgramaId("");
  }, [seccionalId]);

  const facultadOptions = catalogs.facultades
    .filter((facultad) => facultad.seccionalId === seccionalId)
    .map((facultad) => ({ label: facultad.name, value: facultad.id }));
  const programaOptions = catalogs.programas
    .filter((programa) =>
      programa.seccionalId === seccionalId &&
      (!facultadId || programa.facultadId === facultadId))
    .map((programa) => ({ label: programa.name, value: programa.id }));
  const breadcrumbItems: BreadcrumbItem[] = selectedSeccional
    ? [
        { label: "Seccionales", href: ROUTES.panelSeccionales },
        { label: selectedSeccional.name },
      ]
    : [{ label: "Seccionales" }];

  const saveWorkspace = (nextWorkspace: SeccionalesWorkspace, message: string) => {
    try {
      writeSeccionalesWorkspace(nextWorkspace);
      setWorkspace(nextWorkspace);
      setStorageError("");
      showNotification({ title: "Cambios guardados", message, variant: "success" });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron guardar los cambios.";
      setStorageError(message);
      showNotification({ title: "No se pudo guardar", message, variant: "error" });
      return false;
    }
  };

  const openSeccional = (seccional: SeccionalRecord) => {
    navigateToRoute(buildRouteWithSearch(ROUTES.panelSeccionales, { seccional: seccional.id }));
  };

  const goToList = () => navigateToRoute(ROUTES.panelSeccionales);

  return (
    <PanelLayout
      currentStep="seccionales"
      title={selectedSeccional ? `Seccional ${selectedSeccional.name}` : "Seccionales"}
      description={selectedSeccional
        ? "Gestiona los parámetros de medición y los usuarios de esta organización."
        : "Administra las organizaciones, sus ciclos de medición y sus usuarios."}
      breadcrumbItems={breadcrumbItems}
    >
      <div className="space-y-6">
        {storageError ? (
          <div role="alert" className="rounded-2xl border border-[var(--color-error)]/30 bg-[var(--color-tint-danger)] px-5 py-4 text-sm text-[var(--color-error)]">
            {storageError} Los cambios no se podrán guardar mientras persista este problema.
          </div>
        ) : null}
        {!storageReady ? (
          <div className="surface-card p-8 text-center text-sm text-[var(--color-gray-3)]" role="status">
            Cargando seccionales…
          </div>
        ) : selectedSeccional ? (
          <>
            <div>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<SecubIcon name="back" size={18} />}
                onClick={goToList}
              >
                Volver a seccionales
              </Button>
            </div>
            <SeccionalDetails
              seccional={selectedSeccional}
              tab={tab}
              setTab={setTab}
              facultadId={facultadId}
              programaId={programaId}
              setFacultadId={setFacultadId}
              setProgramaId={setProgramaId}
              facultadOptions={facultadOptions}
              programaOptions={programaOptions}
              workspace={workspace}
              onSaveWorkspace={saveWorkspace}
              catalogsError={catalogsError}
            />
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {SECCIONAL_RECORDS.map((seccional) => (
                <article key={seccional.id} className="surface-card flex items-center gap-4 p-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-tint-link)] text-[var(--secub-secondary)]">
                    <SecubIcon name="people" size={22} />
                  </span>
                  <div>
                    <p className="text-sm text-[var(--color-gray-3)]">{seccional.status === "activa" ? "Seccional activa" : "Seccional inactiva"}</p>
                    <p className="mt-0.5 font-heading text-lg font-semibold text-[var(--color-secondary-4)]">{seccional.name}</p>
                  </div>
                </article>
              ))}
            </div>
            <SeccionalList onView={openSeccional} />
          </>
        )}
      </div>
    </PanelLayout>
  );
}
