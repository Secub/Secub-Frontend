import { GoEye, GoPencil, GoTrash } from "react-icons/go";
import {
  Badge,
  Table,
  type TableAction,
  type TableColumn,
} from "../../../../components/ui";
import {
  canDeletePerfil,
  canEditPerfil,
  getEditDisabledReason,
} from "../perfil-egreso.permissions";
import { getEstadoBadgeVariant } from "../perfil-egreso.utils";
import type {
  PerfilEgresoEnriched,
  PerfilEgresoRole,
  RolePermissions,
} from "../perfil-egreso.types";

interface PerfilEgresoTableProps {
  data: PerfilEgresoEnriched[];
  role: PerfilEgresoRole;
  permissions: RolePermissions;
  onView: (record: PerfilEgresoEnriched) => void;
  onEdit: (record: PerfilEgresoEnriched) => void;
  onDelete: (record: PerfilEgresoEnriched) => void;
}

export function PerfilEgresoTable({
  data,
  role,
  permissions,
  onView,
  onEdit,
  onDelete,
}: PerfilEgresoTableProps) {
  const columns: TableColumn<PerfilEgresoEnriched>[] = [
    {
      key: "facultad",
      title: "Facultad",
      render: (row) => (
        <span className="panel-table-cell-wrap">{row.facultadNombre}</span>
      ),
      className: "w-[16%]",
      headerClassName: "w-[16%]",
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => (
        <span className="panel-table-cell-wrap">{row.programaNombre}</span>
      ),
      className: "w-[20%]",
      headerClassName: "w-[20%]",
    },
    {
      key: "plan",
      title: "Plan de estudios",
      render: (row) => (
        <span className="panel-table-cell-wrap inline-flex items-center gap-2">
          {row.planNombre.replace(" (Inactivo)", "")}
          {row.planEstado === "inactivo" ? (
            <Badge variant="neutral">Inactivo</Badge>
          ) : null}
        </span>
      ),
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

  const actions: TableAction<PerfilEgresoEnriched>[] = [
    {
      key: "view",
      label: "Ver detalle",
      onClick: onView,
      icon: <GoEye className="text-lg" />,
    },
    {
      key: "edit",
      label: "Editar perfil",
      onClick: onEdit,
      icon: <GoPencil className="text-lg" />,
      disabled: (row) => !canEditPerfil(role, row),
      disabledReason: (row) => getEditDisabledReason(role, row),
      show: () => permissions.canUpdate,
    },
    {
      key: "delete",
      label: "Eliminar perfil",
      onClick: onDelete,
      icon: <GoTrash className="text-lg" />,
      show: () => canDeletePerfil(role),
      variant: "danger",
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      rowKey={(row) => row.id}
      actions={actions}
      emptyMessage="No hay perfiles de egreso para los filtros seleccionados."
    />
  );
}

export default PerfilEgresoTable;