import { GoEye } from "react-icons/go";
import PerfilEgresoTable from "./PerfilEgresoTable";
import type { PerfilEgresoEnriched, PerfilEgresoRole, RolePermissions } from "../perfil-egreso.types";

interface PerfilEgresoListSectionProps {
  data: PerfilEgresoEnriched[];
  role: PerfilEgresoRole;
  permissions: RolePermissions;
  onView: (record: PerfilEgresoEnriched) => void;
  onEdit: (record: PerfilEgresoEnriched) => void;
  onDelete: (record: PerfilEgresoEnriched) => void;
}

export default function PerfilEgresoListSection({
  data,
  role,
  permissions,
  onView,
  onEdit,
  onDelete,
}: PerfilEgresoListSectionProps) {
  return (
    <div className="surface-card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Lista de perfiles de egreso
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

      <PerfilEgresoTable
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
