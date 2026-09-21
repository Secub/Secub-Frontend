import { GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../../assets/logos/logotipo_ConUSB.png";
import { Button } from "../../../components/ui";
import {
  SECUB_ROLE_LABELS,
  SECUB_ROLE_ORDER,
  type SecubRole,
} from "../../../config/access/roles";

interface RoleSelectionSectionProps {
  onSelectRole: (role: SecubRole) => void;
  onBack: () => void;
}

const selectableRoles = SECUB_ROLE_ORDER.map((role) => ({
  role,
  label: SECUB_ROLE_LABELS[role],
}));

export default function RoleSelectionSection({
  onSelectRole,
  onBack,
}: RoleSelectionSectionProps) {
  return (
    <section
      className="w-full max-w-[620px] rounded-[var(--radius-2xl)] border border-white/55 bg-white/95 p-6 shadow-[0_30px_90px_rgba(5,18,35,0.38)] backdrop-blur-sm sm:p-8"
      aria-labelledby="role-selector-title"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)] active:translate-y-px"
      >
        <GoChevronLeft aria-hidden="true" className="text-[20px]" />
        Volver al acceso
      </button>

      <div className="mt-4 text-center">
        <img
          src={LogoSECUB}
          alt="SECUB · Universidad de San Buenaventura"
          className="mx-auto h-auto w-[190px] max-w-full object-contain sm:w-[220px]"
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-secondary-1)]">
          Paso 1 de 2
        </p>
        <h1
          id="role-selector-title"
          className="mt-1 font-heading text-3xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-4xl"
        >
          Selecciona tu cargo
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--color-gray-3)] sm:text-base">
          Selecciona el cargo con el que vas a ingresar a SECUB para continuar con tu programa académico.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5" aria-label="Cargos disponibles">
        {selectableRoles.map((item) => (
          <Button
            key={item.role}
            variant="accent"
            size="md"
            className="w-full rounded-full sm:w-[calc(50%-0.3125rem)]"
            onClick={() => onSelectRole(item.role)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
