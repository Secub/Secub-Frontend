import { GoArrowRight, GoBook, GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../assets/logos/logo-secub.png";
import LogoUSB from "../../assets/logos/logo-usb.png";
import { secubAcademicPrograms, type SecubProgramId } from "../../data/secubAcademicPrograms";
import { ROUTES } from "../../app/appRoutes";
import { persistSelectedProgramId } from "../../services/programSelection";

function buildDashboardUrl() {
  const params = new URLSearchParams(window.location.search);
  params.set("role", params.get("role") ?? "director");
  return `${ROUTES.panelDashboard}?${params.toString()}`;
}

export default function ProgramSelectorPage() {
  const handleSelectProgram = (programId: SecubProgramId) => {
    persistSelectedProgramId(programId);
    window.location.href = buildDashboardUrl();
  };

  return (
    <main className="min-h-screen bg-[var(--color-surface-soft)] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <a
            href={ROUTES.access}
            className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.22)]"
          >
            <GoChevronLeft aria-hidden="true" />
            Volver al acceso
          </a>

          <div className="flex items-center gap-4">
            <img src={LogoUSB} alt="Universidad de San Buenaventura" className="h-12 w-auto object-contain" />
            <img src={LogoSECUB} alt="SECUB" className="h-10 w-auto object-contain" />
          </div>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-4 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-white)]">
              SECUB · Seccional Cali
            </p>

            <h1 className="font-heading text-4xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-5xl">
              Selecciona el programa académico
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-gray-3)]">
              Para continuar en SECUB, elige el programa desde el cual realizarás la gestión académica.
            </p>

            <div className="mt-8 rounded-[var(--radius-xl)] border border-[var(--color-gray-6)] bg-[var(--color-white)] p-5 shadow-[0_18px_45px_rgba(24,34,51,0.08)]">
              <p className="text-sm font-semibold text-[var(--color-secondary-4)]">Información de prueba</p>
              <p className="mt-2 text-sm leading-7 text-[var(--color-gray-3)]">
                La plataforma mostrará únicamente datos de Psicología y Derecho de la Universidad de San Buenaventura, Seccional Cali.
              </p>
            </div>
          </div>

          <div className="grid gap-5">
            {secubAcademicPrograms.map((program) => (
              <button
                key={program.id}
                type="button"
                className="group rounded-[var(--radius-xl)] border border-[var(--color-gray-6)] bg-[var(--color-white)] p-6 text-left shadow-[0_18px_45px_rgba(24,34,51,0.08)] transition-all hover:-translate-y-1 hover:border-[var(--color-secondary-2)] hover:shadow-[0_24px_60px_rgba(24,34,51,0.12)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.24)]"
                onClick={() => handleSelectProgram(program.id)}
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="flex min-w-0 gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-secondary-1)] text-2xl text-[var(--color-white)]">
                      <GoBook aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-heading text-xl font-bold text-[var(--color-secondary-4)]">
                        {program.directorRoleLabel}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-[var(--color-gray-3)]">
                        {program.faculty} · {program.seccional}
                      </span>
                      <span className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-[var(--color-gray-3)]">
                        <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-soft)] px-3 py-1">
                          SNIES {program.snies}
                        </span>
                        <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-soft)] px-3 py-1">
                          Plan {program.planVersion}
                        </span>
                        <span className="rounded-[var(--radius-pill)] bg-[var(--color-surface-soft)] px-3 py-1">
                          {program.durationSemesters} semestres
                        </span>
                      </span>
                    </span>
                  </span>

                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] text-[var(--color-secondary-4)] transition-all group-hover:border-[var(--color-secondary-2)] group-hover:bg-[var(--color-secondary-1)] group-hover:text-[var(--color-white)]">
                    <GoArrowRight aria-hidden="true" />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
