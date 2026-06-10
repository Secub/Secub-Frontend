import { GoEye } from "react-icons/go";
import PropositoTable from "./PropositoTable";
import type { PropositoEnriched, PropositoFormacionRole, RolePermissions } from "../proposito-formacion.types";

interface PropositoListSectionProps {
  data: PropositoEnriched[];
  role: PropositoFormacionRole;
  permissions: RolePermissions;
  onView: (record: PropositoEnriched) => void;
  onEdit: (record: PropositoEnriched) => void;
  onDelete: (record: PropositoEnriched) => void;
}

export default function PropositoListSection({
  data,
  role,
  permissions,
  onView,
  onEdit,
  onDelete,
}: PropositoListSectionProps) {
  return (
    <div className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Lista de propósitos de formación
          </h3>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Cada fila respeta el alcance del usuario logueado y habilita acciones según su permiso actual.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-[var(--color-gray-3)]">
          <GoEye className="text-base text-[var(--color-secondary-1)]" />
          La actualización solo se habilita sobre programas activos.
        </div>
      </div>

      <PropositoTable
        data={data}
        role={role}
        permissions={permissions}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
