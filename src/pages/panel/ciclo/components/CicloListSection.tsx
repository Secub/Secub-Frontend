import { GoShieldCheck } from "react-icons/go";
import CicloSummaryCard from "./CicloSummaryCard";
import type { CicloEnriched, CurrentUser } from "../ciclo.types";

interface CicloListSectionProps {
  cycles: CicloEnriched[];
  user: CurrentUser;
  onView: (cycle: CicloEnriched) => void;
  onEdit: (cycle: CicloEnriched) => void;
  onDelete: (cycle: CicloEnriched) => void;
}

export default function CicloListSection({ cycles, user, onView, onEdit, onDelete }: CicloListSectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Resumen de ciclos creados
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Dashboard con plan de estudios, cursos seleccionados, periodo, estado y responsable.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm text-[var(--color-gray-3)] shadow-sm">
          <GoShieldCheck className="text-base text-[var(--color-secondary-1)]" />
          Acciones según rol: {user.cargo}
        </span>
      </div>

      {cycles.length > 0 ? (
        cycles.map((cycle) => (
          <CicloSummaryCard
            key={cycle.id}
            ciclo={cycle}
            user={user}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))
      ) : (
        <div className="surface-card p-8 text-center">
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            No hay ciclos para los filtros seleccionados
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
            Ajusta los filtros o crea un ciclo nuevo desde un plan de estudios activo si tu rol tiene permiso.
          </p>
        </div>
      )}
    </section>
  );
}
