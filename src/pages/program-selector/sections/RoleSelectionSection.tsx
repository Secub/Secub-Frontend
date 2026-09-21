import { GoCheck, GoChevronLeft } from "react-icons/go";
import LogoSECUB from "../../../assets/logos/logotipo_ConUSB.png";
import { Button } from "../../../components/ui";
import {
  SECUB_ROLE_LABELS,
  SECUB_ROLE_ORDER,
  type SecubRole,
} from "../../../config/access/roles";

interface RoleSelectionSectionProps {
  selectedRole: SecubRole;
  onSelectRole: (role: SecubRole) => void;
  onBack: () => void;
  showResetDemo: boolean;
  onResetDemo: () => void;
}

const selectableRoles = SECUB_ROLE_ORDER.map((role) => ({
  role,
  label: SECUB_ROLE_LABELS[role],
}));

export default function RoleSelectionSection({
  selectedRole,
  onSelectRole,
  onBack,
  showResetDemo,
  onResetDemo,
}: RoleSelectionSectionProps) {
  return (
    <section
      className="w-full max-w-[620px] rounded-[var(--radius-2xl)] border border-white/55 bg-white/95 p-6 shadow-[0_30px_90px_rgba(5,18,35,0.38)] backdrop-blur-sm sm:p-9"
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

      <div className="mt-6 text-center">
        <img
          src={LogoSECUB}
          alt="SECUB · Universidad de San Buenaventura"
          className="mx-auto h-auto w-[230px] max-w-full object-contain sm:w-[280px]"
        />
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-secondary-1)]">
          Paso 1 de 2
        </p>
        <h1
          id="role-selector-title"
          className="mt-2 font-heading text-3xl font-bold leading-tight text-[var(--color-secondary-4)] sm:text-4xl"
        >
          Elige tu rol
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[var(--color-gray-3)] sm:text-base">
          Selecciona el rol con el que vas a ingresar a SECUB para continuar con tu programa académico.
        </p>
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Roles disponibles">
        {selectableRoles.map((item) => {
          const isSelected = item.role === selectedRole;

          return (
            <Button
              key={item.role}
              type="button"
              variant={isSelected ? "accent" : "outline"}
              size="lg"
              fullWidth
              className="rounded-full"
              leftIcon={isSelected ? <GoCheck /> : undefined}
              aria-pressed={isSelected}
              onClick={() => onSelectRole(item.role)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      {showResetDemo ? (
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onResetDemo}
            className="rounded-[var(--radius-pill)] border border-[color:rgba(235,87,87,0.30)] px-4 py-2 text-xs font-bold text-[var(--color-error)] transition-colors hover:bg-[color:rgba(235,87,87,0.08)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(235,87,87,0.18)]"
            title="Reiniciar datos demo persistidos solo en este navegador"
          >
            Reset demo
          </button>
        </div>
      ) : null}
    </section>
  );
}
