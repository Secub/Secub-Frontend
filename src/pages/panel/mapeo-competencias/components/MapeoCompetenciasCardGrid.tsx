import { GoPencil, GoTrash } from "react-icons/go";
import {
  Badge,
  Table,
  type TableAction,
  type TableColumn,
} from "../../../../components/ui";
import {
  canDeleteMapeoCompetencias,
  canEditMapeoCompetencias,
  getEditDisabledReason,
} from "../MapeoCompetencias.permissions";
import { getEstadoBadgeVariant } from "../MapeoCompetencias.utils";
import type {
  MapeoCompetenciasEnriched,
  MapeoCompetenciasRole,
  RolePermissions,
} from "../MapeoCompetencias.types";

interface MapeoCompetenciasCardGridProps {
  records: MapeoCompetenciasEnriched[];
  role: MapeoCompetenciasRole;
  permissions: RolePermissions;
  onEdit: (record: MapeoCompetenciasEnriched) => void;
  onDelete: (record: MapeoCompetenciasEnriched) => void;
}

function getMappedSemesters(record: MapeoCompetenciasEnriched) {
  return record.semestres?.filter((semester) => semester.competencias.length > 0) ?? [];
}

export function MapeoCompetenciasCardGrid({
  records,
  role,
  permissions,
  onEdit,
  onDelete,
}: MapeoCompetenciasCardGridProps) {
  const columns: TableColumn<MapeoCompetenciasEnriched>[] = [
    {
      key: "programa",
      title: "Programa",
      render: (row) => (
        <div className="space-y-1">
          <span className="panel-table-cell-wrap font-semibold text-[var(--color-secondary-4)]">
            {row.programaNombre}
          </span>
          <span className="block text-xs text-[var(--color-gray-4)]">
            {row.facultadNombre}
          </span>
        </div>
      ),
      className: "w-[24%]",
      headerClassName: "w-[24%]",
    },
    {
      key: "plan",
      title: "Plan",
      render: (row) => <span className="panel-table-cell-wrap">{row.planNombre}</span>,
      className: "w-[13%]",
      headerClassName: "w-[13%]",
    },
    {
      key: "lugar",
      title: "Lugar",
      render: (row) => <span className="panel-table-cell-wrap">{row.lugarNombre}</span>,
      className: "w-[13%]",
      headerClassName: "w-[13%]",
    },
    {
      key: "descripcion",
      title: "Descripcion",
      render: (row) => (
        <p className="panel-table-cell-wrap text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion}
        </p>
      ),
      className: "w-[30%]",
      headerClassName: "w-[30%]",
    },
    {
      key: "avance",
      title: "Avance",
      render: (row) => {
        const mappedSemesters = getMappedSemesters(row);
        const totalCompetencias = mappedSemesters.reduce(
          (total, semester) => total + semester.competencias.length,
          0,
        );

        return (
          <div className="space-y-1">
            <Badge variant="info">{mappedSemesters.length}/10 semestres</Badge>
            <span className="block text-xs text-[var(--color-gray-4)]">
              {totalCompetencias} competencia{totalCompetencias === 1 ? "" : "s"}
            </span>
          </div>
        );
      },
      className: "w-[12%]",
      headerClassName: "w-[12%]",
    },
    {
      key: "estado",
      title: "Estado",
      render: (row) => (
        <Badge variant={getEstadoBadgeVariant(row.estado)}>
          {row.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
      className: "w-[8%] whitespace-nowrap",
      headerClassName: "w-[8%]",
    },
  ];

  const actions: TableAction<MapeoCompetenciasEnriched>[] = [
    {
      key: "edit",
      label: "Editar mapeo",
      onClick: onEdit,
      icon: <GoPencil className="text-lg" />,
      show: () => permissions.canUpdate,
      disabled: (row) => !canEditMapeoCompetencias(role, row),
      disabledReason: (row) => getEditDisabledReason(role, row),
    },
    {
      key: "delete",
      label: "Eliminar mapeo",
      onClick: onDelete,
      icon: <GoTrash className="text-lg" />,
      show: () => canDeleteMapeoCompetencias(role),
      variant: "danger",
    },
  ];

  return (
    <Table
      columns={columns}
      data={records}
      rowKey={(row) => row.id}
      actions={actions}
      emptyMessage="No hay mapeos de competencias para los filtros seleccionados."
    />
  );
}

export default MapeoCompetenciasCardGrid;
