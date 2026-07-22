import { useState } from "react";
import { GoArrowRight, GoBook, GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../assets/logos/logotipo_ConUSB.png";
import { secubAcademicPrograms, type SecubProgramId } from "../../data/secubAcademicPrograms";
import { ROUTES, navigateToRoute } from "../../app/appRoutes";
import { SHOW_DEMO_TOOLS } from "../../config/demo.config";
import { mockBackend } from "../../services/mockBackend";
import { persistSelectedProgramId } from "../../services/programSelection";
import { normalizeMockRole, type MockUserRole } from "../../services/auth/mockUser";
import { requestConfirmation } from "../../shared/feedback";
import { getBrowserSearchParams } from "../../shared/browser";

const selectableRoles: Array<{
  role: MockUserRole;
  label: string;
}> = [
  {
    role: "direccionPrograma",
    label: "Dirección de programa",
  },
  {
    role: "docente",
    label: "Docente",
  },
  {
    role: "vice",
    label: "Vicerrector",
  },
  {
    role: "decano",
    label: "Decano",
  },
  {
    role: "admin",
    label: "Admin",
  },
];

function getInitialRole() {
  if (typeof window === "undefined") return "direccionPrograma" as MockUserRole;
  const params = getBrowserSearchParams();
  return normalizeMockRole(params.get("role") ?? "direccionPrograma");
}

function buildDashboardUrl(role: MockUserRole) {
  const params = getBrowserSearchParams();
  params.set("role", role);
  return `${ROUTES.panelDashboard}?${params.toString()}`;
}

export default function ProgramSelectorPage() {
  const [selectedRole, setSelectedRole] = useState<MockUserRole>(() => getInitialRole());
  const selectedRoleLabel = selectableRoles.find((item) => item.role === selectedRole)?.label;

  const handleSelectProgram = (programId: SecubProgramId) => {
    persistSelectedProgramId(programId);
    navigateToRoute(buildDashboardUrl(selectedRole));
  };

  const handleResetDemo = async () => {
    const confirmed = await requestConfirmation({
      title: "Reiniciar datos demo",
      message: "Esta acción borrará la información persistida en este navegador.",
      confirmLabel: "Reiniciar datos",
      variant: "danger",
    });

    if (!confirmed) return;

    mockBackend.clearDemoData();
    navigateToRoute(`${ROUTES.programSelector}?role=${selectedRole}`, { replace: true });
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface-soft)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-5xl flex-col gap-5">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateToRoute(ROUTES.access)}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]"
          >
            <GoChevronLeft aria-hidden="true" />
            Volver al acceso
          </button>

          <div className="flex items-center gap-4">
            <img src={LogoSECUB} alt="SECUB" className="h-9 w-auto object-contain sm:h-20" />
          </div>
        </header>

        <section className="flex flex-1 flex-col justify-center gap-5">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-white)]">
              SECUB · Datos académicos
            </p>

            <h1 className="mt-4 font-heading text-3xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-4xl">
              Selecciona programa y rol
            </h1>

            <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)] sm:text-base">
              Elige cómo vas a ingresar y selecciona el programa académico para continuar.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <section
              className="rounded-[var(--radius-2xl)] border border-[var(--color-gray-6)] bg-[var(--color-white)] p-4 shadow-[0_18px_45px_rgba(24,34,51,0.08)] sm:p-5"
              aria-labelledby="role-selector-title"
            >
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-secondary-1)]">
                    1. Rol
                  </p>
                  <h2 id="role-selector-title" className="mt-1 font-heading text-xl font-bold text-[var(--color-secondary-4)]">
                    Selecciona tu rol
                  </h2>
                </div>
                <p className="text-sm font-semibold text-[var(--color-gray-3)]">
                  Activo: {selectedRoleLabel}
                </p>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {selectableRoles.map((item) => {
                  const isSelected = selectedRole === item.role;

                  return (
                    <button
                      key={item.role}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedRole(item.role)}
                      className={[
                        "group rounded-[var(--radius-lg)] border px-4 py-3 text-left transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]",
                        isSelected
                          ? "border-[var(--color-success)] bg-[color:rgba(118,202,102,0.10)] shadow-[inset_4px_0_0_var(--color-success)]"
                          : "border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] hover:border-[var(--color-secondary-2)] hover:bg-[var(--color-white)]",
                      ].join(" ")}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-pill)] font-heading text-sm font-bold",
                            isSelected
                              ? "bg-[var(--color-success)] text-[var(--color-white)]"
                              : "bg-[var(--color-white)] text-[var(--color-secondary-4)] ring-1 ring-[var(--color-gray-6)] group-hover:ring-[var(--color-secondary-2)]",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {item.label.slice(0, 2).toUpperCase()}
                        </span>

                        <span className="min-w-0 font-heading text-sm font-bold text-[var(--color-secondary-4)]">
                          {item.label}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section
              className="rounded-[var(--radius-2xl)] border border-[var(--color-gray-6)] bg-[var(--color-white)] p-4 shadow-[0_18px_45px_rgba(24,34,51,0.08)] sm:p-5"
              aria-labelledby="program-selector-title"
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-secondary-1)]">
                  2. Programa
                </p>
                <h2 id="program-selector-title" className="mt-1 font-heading text-xl font-bold text-[var(--color-secondary-4)]">
                  Selecciona el programa académico
                </h2>
              </div>

              <div className="mt-4 grid gap-3">
                {secubAcademicPrograms.length === 0 ? (
                  <div
                    role="status"
                    className="rounded-[var(--radius-xl)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5 text-center"
                  >
                    <p className="font-heading text-base font-bold text-[var(--color-secondary-4)]">
                      No hay programas simulados cargados
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                      El catálogo quedó vacío para incorporar después una única fuente de datos controlada.
                    </p>
                  </div>
                ) : secubAcademicPrograms.map((program) => (
                  <button
                    key={program.id}
                    type="button"
                    className="group rounded-[var(--radius-xl)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--color-secondary-2)] hover:bg-[var(--color-white)] hover:shadow-[0_18px_45px_rgba(24,34,51,0.10)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.24)]"
                    onClick={() => handleSelectProgram(program.id)}
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-secondary-1)] text-xl text-[var(--color-white)]">
                          <GoBook aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-heading text-lg font-bold text-[var(--color-secondary-4)]">
                            {program.name}
                          </span>
                          <span className="mt-1 block text-sm leading-5 text-[var(--color-gray-3)]">
                            {program.faculty} · Plan {program.planVersion}
                          </span>
                        </span>
                      </span>

                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] text-[var(--color-secondary-4)] transition-all group-hover:border-[var(--color-secondary-2)] group-hover:bg-[var(--color-secondary-1)] group-hover:text-[var(--color-white)]">
                        <GoArrowRight aria-hidden="true" />
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {SHOW_DEMO_TOOLS ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleResetDemo}
                className="rounded-[var(--radius-pill)] border border-[color:rgba(235,87,87,0.30)] px-4 py-2 text-xs font-bold text-[var(--color-error)] transition-colors hover:bg-[color:rgba(235,87,87,0.08)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(235,87,87,0.18)]"
                title="Reiniciar datos demo persistidos solo en este navegador"
              >
                Reset demo
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
