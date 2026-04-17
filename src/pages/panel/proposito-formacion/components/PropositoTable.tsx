import { GoEye, GoPencil } from "react-icons/go";
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
}

export function PropositoTable({
  data,
  role,
  permissions,
  onView,
  onEdit,
}: PropositoTableProps) {
  const columns: TableColumn<PropositoEnriched>[] = [
    {
      key: "facultad",
      title: "Facultad",
      render: (row) => <span>{row.facultadNombre}</span>,
      className: "min-w-[180px]",
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => <span>{row.programaNombre}</span>,
      className: "min-w-[220px]",
    },
    {
      key: "plan",
      title: "Plan de estudios",
      render: (row) => <span>{row.planNombre}</span>,
      className: "min-w-[150px]",
    },
    {
      key: "descripcion",
      title: "Descripción",
      render: (row) => (
        <p className="max-w-[460px] text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion}
        </p>
      ),
      className: "min-w-[360px]",
    },
    {
      key: "estado",
      title: "Estado",
      render: (row) => (
        <Badge variant={getEstadoBadgeVariant(row.estado)}>
          {row.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
      className: "min-w-[120px]",
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
