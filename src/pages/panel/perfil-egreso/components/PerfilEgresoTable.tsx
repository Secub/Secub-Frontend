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
