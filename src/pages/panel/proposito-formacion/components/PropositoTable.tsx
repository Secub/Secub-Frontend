import { GoEye, GoPencil, GoTrash } from "react-icons/go";
import {
  Badge,
  Table,
  type TableAction,
  type TableColumn,
} from "../../../../components/ui";
import {
  canEditProposito,
  getEditDisabledReason,
} from "../proposito-formacion.permissions";
import { getEstadoBadgeVariant } from "../proposito-formacion.utils";
import type {
  PropositoEnriched,
  PropositoFormacionRole,
  RolePermissions,
} from "../proposito-formacion.types";

interface PropositoTableProps {
  data: PropositoEnriched[];
  role: PropositoFormacionRole;
  permissions: RolePermissions;
  onView: (record: PropositoEnriched) => void;
  onEdit: (record: PropositoEnriched) => void;
  onDelete: (record: PropositoEnriched) => void;
}

export function PropositoTable({
  data,
  role,
  permissions,
  onView,
  onEdit,
  onDelete,
}: PropositoTableProps) {
  const columns: TableColumn<PropositoEnriched>[] = [
    {
      key: "facultad",
      title: "Facultad",
      render: (row) => <span className="panel-table-cell-wrap">{row.facultadNombre}</span>,
      className: "w-[16%]",
      headerClassName: "w-[16%]",
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => <span className="panel-table-cell-wrap">{row.programaNombre}</span>,
      className: "w-[20%]",
      headerClassName: "w-[20%]",
    },
    {
      key: "plan",
      title: "Plan de estudios",
      render: (row) => <span className="panel-table-cell-wrap">{row.planNombre}</span>,
      className: "w-[14%]",
      headerClassName: "w-[14%]",
    },
    {
      key: "descripcion",
      title: "Descripción",
      render: (row) => (
        <p className="panel-table-cell-wrap text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion}
        </p>
      ),
      className: "w-[38%]",
      headerClassName: "w-[38%]",
    },
    {
      key: "estado",
      title: "Estado",
      render: (row) => (
        <Badge variant={getEstadoBadgeVariant(row.estado)}>
          {row.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
      className: "w-[12%] whitespace-nowrap",
      headerClassName: "w-[12%]",
    },
  ];

  const actions: TableAction<PropositoEnriched>[] = [
    {
      key: "view",
      label: "Ver detalle",
      onClick: onView,
      icon: <GoEye className="text-lg" />,
    },
    {
      key: "edit",
      label: "Editar propósito",
      onClick: onEdit,
      icon: <GoPencil className="text-lg" />,
      disabled: (row) => !canEditProposito(role, row),
      disabledReason: (row) => getEditDisabledReason(role, row),
      show: () => permissions.canUpdate,
    },
    {
      key: "delete",
      label: "Eliminar propósito",
      onClick: onDelete,
      icon: <GoTrash className="text-lg" />,
      show: () => role === "admin",
      variant: "danger",
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      rowKey={(row) => row.id}
      actions={actions}
      emptyMessage="No hay propósitos de formación para los filtros seleccionados."
    />
  );
}

export default PropositoTable;