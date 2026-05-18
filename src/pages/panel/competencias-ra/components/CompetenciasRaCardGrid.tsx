import CompetenciasRaCard from "./CompetenciasRaCard";
import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRole,
  ResultadoAprendizaje,
  RolePermissions,
} from "../CompetenciasRa.types";
import { canEditCompetenciasRa } from "../CompetenciasRa.permissions";

interface CompetenciasRaCardGridProps {
  data: CompetenciasRaEnriched[];
  role: CompetenciasRaFormacionRole;
  permissions: RolePermissions;
  onView: (record: CompetenciasRaEnriched) => void;
  onAddRa: (record: CompetenciasRaEnriched) => void;
  onEditRa: (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => void;
}

export default function CompetenciasRaCardGrid({
  data,
  role,
  permissions,
  onView,
  onAddRa,
  onEditRa,
}: CompetenciasRaCardGridProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-gray-5)] bg-[var(--color-surface-soft)] p-12 text-center">
        <p className="text-sm text-[var(--color-gray-3)]">
          No hay competencias que mostrar con los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid auto-rows-max grid-cols-1 gap-6">
      {data.map((record) => {
        const canEditRecord = canEditCompetenciasRa(role, record) && permissions.canUpdate;

        return (
          <CompetenciasRaCard
            key={record.id}
            record={record}
            onView={onView}
            onAddRa={onAddRa}
            onEditRa={onEditRa}
            canEdit={canEditRecord}
          />
        );
      })}
    </div>
  );
}
