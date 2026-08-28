import type { AcademicModulePermissions } from "../../../../config/access/permissions";
import type { SecubRole } from "../../../../config/access/roles";
import PerfilEgresoTable from "./PerfilEgresoTable";
import type { PerfilEgresoEnriched } from "../perfil-egreso.types";

interface PerfilEgresoListSectionProps {
  data: PerfilEgresoEnriched[];
  role: SecubRole;
  permissions: AcademicModulePermissions;
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
            Consulta el detalle de los perfiles registrados.
          </p>
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
