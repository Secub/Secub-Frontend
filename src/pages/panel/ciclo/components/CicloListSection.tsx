import CicloSummaryCard from "./CicloSummaryCard";
import type { CicloEnriched, CurrentUser } from "../ciclo.types";

interface CicloListSectionProps {
  cycles: CicloEnriched[];
  user: CurrentUser;
  activeCycle: CicloEnriched | null;
  onView: (cycle: CicloEnriched) => void;
  onEdit: (cycle: CicloEnriched) => void;
  onDelete: (cycle: CicloEnriched) => void;
  onDuplicate: (cycle: CicloEnriched) => void;
}

export default function CicloListSection({ cycles, user, activeCycle, onView, onEdit, onDelete, onDuplicate }: CicloListSectionProps) {
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

      </div>

      {cycles.length > 0 ? (
        cycles.map((cycle) => (
          <CicloSummaryCard
            key={cycle.id}
            ciclo={cycle}
            user={user}
            activeCycle={activeCycle}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        ))
      ) : (
        <div className="surface-card p-8 text-center">
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            No hay ciclos para los filtros seleccionados
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
            Ajusta los filtros o crea un ciclo nuevo desde un plan de estudios activo.
          </p>
        </div>
      )}
    </section>
  );
}
