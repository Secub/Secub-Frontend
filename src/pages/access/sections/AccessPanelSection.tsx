import { GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../../assets/logos/logotipo_ConUSB.png";
import { ROUTES, navigateToRoute } from "../../../app/appRoutes";
import {
  SECUB_SECTIONS,
  continueAccessAfterSectionSelection,
  type SecubSectionId,
} from "../../../services/sectionSelection";

export default function AccessPanelSection() {
  const handleSectionSelection = (sectionId: SecubSectionId) => {
    continueAccessAfterSectionSelection(sectionId);
  };

  return (
    <section
      className="w-full max-w-[620px] rounded-[var(--radius-2xl)] border border-white/55 bg-white/95 p-6 shadow-[0_30px_90px_rgba(5,18,35,0.38)] backdrop-blur-sm sm:p-9"
      aria-labelledby="access-title"
    >
      <button
        type="button"
        onClick={() => navigateToRoute(ROUTES.landing)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)] active:translate-y-px"
      >
        <GoChevronLeft aria-hidden="true" className="text-[20px]" />
        Volver al inicio
      </button>

      <div className="mt-6 text-center">
        <img
          src={LogoSECUB}
          alt="SECUB · Universidad de San Buenaventura"
          className="mx-auto h-auto w-[230px] max-w-full object-contain sm:w-[280px]"
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-secondary-1)]">
          Acceso institucional
        </p>
        <h1 id="access-title" className="mt-2 font-heading text-3xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-4xl">
          Selecciona tu seccional
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--color-gray-3)] sm:text-base">
          Para acceder a SECUB, selecciona la seccional en la que te encuentras registrado.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Seccionales disponibles">
        {SECUB_SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => handleSectionSelection(section.id)}
            className="min-h-14 rounded-[var(--radius-lg)] border border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] px-5 py-3 font-heading text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)] active:translate-y-0 disabled:cursor-not-allowed disabled:border-[var(--color-gray-5)] disabled:bg-[var(--color-gray-5)] disabled:shadow-none"
          >
            {section.label}
          </button>
        ))}
      </div>
    </section>
  );
}
