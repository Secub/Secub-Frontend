import { GoTrash, GoPencil, GoEye } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type {
  MapeoCompetenciasEnriched,
  RolePermissions,
} from "../MapeoCompetencias.types";

interface MapeoCompetenciasCardGridProps {
  records: MapeoCompetenciasEnriched[];
  permissions: RolePermissions;
  onEdit: (record: MapeoCompetenciasEnriched) => void;
  onDelete: (record: MapeoCompetenciasEnriched) => void;
  onView: (record: MapeoCompetenciasEnriched) => void;
}

export function MapeoCompetenciasCardGrid({
  records,
  permissions,
  onEdit,
  onDelete,
  onView,
}: MapeoCompetenciasCardGridProps) {
  if (records.length === 0) {
    return (
      <div className="surface-card flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-gray-6)] p-8">
        <p className="text-sm text-[var(--color-gray-3)]">
          No hay mapeos de competencias disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {records.map((record) => (
        <div
          key={record.id}
          className="surface-card flex flex-col rounded-lg border border-[var(--color-gray-6)] p-4 transition-all hover:shadow-md"
        >
          <div className="mb-3 flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-[var(--color-secondary-4)]">
                {record.programaNombre}
              </h4>
              <p className="text-xs text-[var(--color-gray-3)]">
                {record.planNombre}
              </p>
            </div>
            <div
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                record.estado === "activo"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {record.estado === "activo" ? "Activo" : "Inactivo"}
            </div>
          </div>

          <p className="mb-4 line-clamp-2 text-sm text-[var(--color-gray-4)]">
            {record.descripcion}
          </p>

          <div className="mb-3 space-y-1 text-xs text-[var(--color-gray-3)]">
            <p>
              <span className="font-medium">Facultad:</span> {record.facultadNombre}
            </p>
            <p>
              <span className="font-medium">Lugar:</span> {record.lugarNombre}
            </p>
          </div>

          <div className="mt-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<GoEye className="text-base" />}
              onClick={() => onView(record)}
              title="Ver detalles"
            >
              Ver
            </Button>

            {permissions.canUpdate && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GoPencil className="text-base" />}
                onClick={() => onEdit(record)}
                title="Editar mapeo"
              >
                Editar
              </Button>
            )}

            {permissions.canDelete && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<GoTrash className="text-base text-red-600" />}
                onClick={() => onDelete(record)}
                title="Eliminar mapeo"
                className="text-red-600 hover:bg-red-50"
              >
                Eliminar
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MapeoCompetenciasCardGrid;
