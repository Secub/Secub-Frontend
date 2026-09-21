import { GoArrowRight, GoBook, GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../../assets/logos/logotipo_ConUSB.png";
import { secubAcademicPrograms, type SecubProgramId } from "../../../data/secubAcademicPrograms";

interface ProgramSelectionSectionProps {
  onSelectProgram: (programId: SecubProgramId) => void;
  onBack: () => void;
}

export default function ProgramSelectionSection({
  onSelectProgram,
  onBack,
}: ProgramSelectionSectionProps) {
  return (
    <section
      className="w-full max-w-[620px] rounded-[var(--radius-2xl)] border border-white/55 bg-white/95 p-6 shadow-[0_30px_90px_rgba(5,18,35,0.38)] backdrop-blur-sm sm:p-8"
      aria-labelledby="program-selector-title"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)] active:translate-y-px"
      >
        <GoChevronLeft aria-hidden="true" className="text-[20px]" />
        Volver a cargo
      </button>

      <div className="mt-4 text-center">
        <img
          src={LogoSECUB}
          alt="SECUB · Universidad de San Buenaventura"
          className="mx-auto h-auto w-[190px] max-w-full object-contain sm:w-[220px]"
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-secondary-1)]">
          Paso 2 de 2
        </p>
        <h1
          id="program-selector-title"
          className="mt-1 font-heading text-3xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-4xl"
        >
          Selecciona tu programa académico
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-gray-3)] sm:text-base">
          Selecciona el programa académico con el que vas a ingresar al panel de SECUB.
        </p>
      </div>

      <div className="mt-5 grid gap-3" aria-label="Programas académicos disponibles">
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
        ) : (
          secubAcademicPrograms.map((program) => (
            <button
              key={program.id}
              type="button"
              className="surface-card group flex items-center justify-between gap-4 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-[var(--secub-primary)] hover:shadow-[0_18px_45px_rgba(24,34,51,0.10)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-primary)]"
              onClick={() => onSelectProgram(program.id)}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--secub-primary)] text-xl text-[var(--secub-primary-text)]">
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

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-gray-6)] text-[var(--color-secondary-4)] transition-all group-hover:border-[var(--secub-primary)] group-hover:bg-[var(--secub-primary)] group-hover:text-[var(--secub-primary-text)]">
                <GoArrowRight aria-hidden="true" />
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
