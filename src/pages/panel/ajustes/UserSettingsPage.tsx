import PanelLayout from "../../../components/panel/PanelLayout";
import { getCurrentMockUser, getNeutralUserCargo } from "../../../services/auth/mockUser";

export default function UserSettingsPage() {
  const currentUser = getCurrentMockUser();
  const roleLabel = getNeutralUserCargo(currentUser);

  return (
    <PanelLayout
      currentStep="ajustes"
      title="Ajustes de usuario"
      description="Consulta la información del usuario autenticado en el entorno demo de SECUB."
      breadcrumbItems={[
        { label: "Panel", href: "/panel/dashboard" },
        { label: "Ajustes de usuario" },
      ]}
    >
      <section className="max-w-3xl rounded-[var(--radius-2xl)] border border-[var(--secub-border)] bg-[var(--secub-surface)] p-6 shadow-[var(--shadow-sm)]">
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
              {roleLabel}
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
              Cargo visual
            </dt>
            <dd className="mt-2 text-sm font-semibold text-[var(--secub-text)]">
              {roleLabel}
            </dd>
          </div>
        </dl>

        <p className="mt-6 text-sm leading-6 text-[var(--secub-muted-text)]">
          Las opciones de accesibilidad se gestionan desde su propia pantalla, disponible en el menú de perfil del sidebar.
        </p>
      </section>
    </PanelLayout>
  );
}
