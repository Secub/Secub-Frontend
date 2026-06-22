import { GoBook, GoChevronRight } from "react-icons/go";
import { FaUniversalAccess } from "react-icons/fa";
import PanelLayout from "../../../components/panel/PanelLayout";
import { ROUTES, navigateToRoute } from "../../../app/appRoutes";
import { getCurrentMockUser, getNeutralUserCargo } from "../../../services/auth/mockUser";
import { clearSelectedProgramId, getSelectedProgram } from "../../../services/programSelection";

export default function UserSettingsPage() {
  const currentUser = getCurrentMockUser();
  const selectedProgram = getSelectedProgram();
  const roleLabel = getNeutralUserCargo(currentUser);
  const activeCargoLabel = currentUser.cargo;

  const handleChangeProgram = () => {
    clearSelectedProgramId();
    navigateToRoute(`${ROUTES.programSelector}?role=${currentUser.role}`);
  };

  return (
    <PanelLayout
      currentStep="ajustes"
      title="Ajustes de usuario"
      description="Consulta tu perfil activo y gestiona las opciones generales de la experiencia SECUB."
      breadcrumbItems={[
        { label: "Panel", href: ROUTES.panelDashboard },
        { label: "Ajustes de usuario" },
      ]}
    >
      <div className="max-w-4xl space-y-6">
        <section className="rounded-[var(--radius-2xl)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-6 shadow-[var(--shadow-sm)]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] font-heading text-xl font-bold text-[var(--color-white)]"
              aria-hidden="true"
            >
              {currentUser.nombre
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--secub-muted-text)]">
                Perfil activo
              </p>
              <h2 className="mt-1 font-heading text-2xl font-semibold text-[var(--secub-text)]">
                {currentUser.nombre}
              </h2>
              <p className="mt-1 text-sm font-medium text-[var(--secub-muted-text)]">
                {activeCargoLabel}
              </p>
            </div>
          </div>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--secub-muted-text)]">
                Correo institucional
              </dt>
              <dd className="mt-2 break-words text-sm font-semibold text-[var(--secub-text)]">
                {currentUser.email}
              </dd>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-4">
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--secub-muted-text)]">
                Rol activo
              </dt>
              <dd className="mt-2 text-sm font-semibold text-[var(--secub-text)]">
                {roleLabel}
              </dd>
            </div>

            {selectedProgram ? (
              <div className="rounded-[var(--radius-lg)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-4 sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--secub-muted-text)]">
                  Programa seleccionado
                </dt>
                <dd className="mt-2 text-sm font-semibold text-[var(--secub-text)]">
                  {selectedProgram.name} · {selectedProgram.faculty}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section
          className="rounded-[var(--radius-2xl)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-6 shadow-[var(--shadow-sm)]"
          aria-labelledby="settings-options-title"
        >
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--secub-muted-text)]">
              Opciones
            </p>
            <h2 id="settings-options-title" className="mt-1 font-heading text-2xl font-semibold text-[var(--secub-text)]">
              Preferencias del panel
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--secub-muted-text)]">
              Accede a las opciones que antes estaban en el perfil del sidebar, ahora organizadas dentro de Ajustes.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => navigateToRoute(ROUTES.panelAccessibility, { preserveSearch: true })}
              className="group flex items-start gap-4 rounded-[var(--radius-xl)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-secondary-2)] hover:bg-[var(--secub-surface)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.20)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[color:rgba(14,101,217,0.10)] text-xl text-[var(--color-secondary-1)]" aria-hidden="true">
                <FaUniversalAccess />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-base font-semibold text-[var(--secub-text)]">
                  Accesibilidad
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--secub-muted-text)]">
                  Ajusta contraste, tamaño de texto y opciones de lectura.
                </span>
              </span>
              <GoChevronRight className="mt-1 shrink-0 text-lg text-[var(--secub-muted-text)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-secondary-1)]" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleChangeProgram}
              className="group flex items-start gap-4 rounded-[var(--radius-xl)] border border-[var(--secub-border)] bg-[var(--secub-surface-soft)] p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-secondary-2)] hover:bg-[var(--secub-surface)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.20)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[color:rgba(118,202,102,0.14)] text-xl text-[var(--color-success)]" aria-hidden="true">
                <GoBook />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading text-base font-semibold text-[var(--secub-text)]">
                  Cambiar programa
                </span>
                <span className="mt-1 block text-sm leading-6 text-[var(--secub-muted-text)]">
                  Vuelve a seleccionar programa académico y rol de ingreso.
                </span>
              </span>
              <GoChevronRight className="mt-1 shrink-0 text-lg text-[var(--secub-muted-text)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-secondary-1)]" aria-hidden="true" />
            </button>
          </div>
        </section>
      </div>
    </PanelLayout>
  );
}
