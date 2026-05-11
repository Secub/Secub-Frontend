import { GoLock, GoShieldCheck } from "react-icons/go";
import { Badge } from "../../../../components/ui";
import type { CurrentUser } from "../ciclo.types";
import { cicloRoleLabels } from "../ciclo.permissions";

interface CicloAccessStateProps {
  user: CurrentUser;
}

export default function CicloAccessState({ user }: CicloAccessStateProps) {
  return (
    <div className="surface-card p-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
          <GoLock className="text-3xl" />
        </div>

        <h2 className="mt-5 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
          Acceso restringido al módulo de selección de cursos
        </h2>

        <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)]">
          Este flujo está habilitado para perfiles administrativos, directivos y
          para el Director de Programa Académico. El rol actual solo puede
          continuar en los módulos asignados a su alcance institucional.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Badge variant="neutral">Rol actual: {cicloRoleLabels[user.role]}</Badge>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm text-[var(--color-gray-3)]">
            <GoShieldCheck className="text-base text-[var(--color-secondary-1)]" />
            Se validará con el rol real del backend más adelante.
          </span>
        </div>
      </div>
    </div>
  );
}
