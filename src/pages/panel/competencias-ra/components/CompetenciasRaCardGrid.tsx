import CompetenciasRaCard from "./CompetenciasRaCard";
import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRole,
  RolePermissions,
} from "../CompetenciasRa.types";
import { canEditCompetenciasRa } from "../CompetenciasRa.permissions";

interface CompetenciasRaCardGridProps {
  data: CompetenciasRaEnriched[];
  role: CompetenciasRaFormacionRole;
  permissions: RolePermissions;
  onView: (record: CompetenciasRaEnriched) => void;
  onEdit: (record: CompetenciasRaEnriched) => void;
  onDelete: (record: CompetenciasRaEnriched) => void;
}

export default function CompetenciasRaCardGrid({
  data,
  role,
  permissions,
  onView,
  onEdit,
  onDelete,
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
    <div className="grid auto-rows-max grid-cols-1 gap-6 md:grid-cols-2">
      {data.map((record) => (
        <CompetenciasRaCard
          key={record.id}
          record={record}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          canEdit={canEditCompetenciasRa(role, record) && permissions.canUpdate}
          canDelete={permissions.canDelete}
        />
      ))}
    </div>
  );
}
