import type { SecubRole } from "../../../../config/access/roles";
import {
  Badge,
  Table,
  type TableAction,
  type TableColumn,
} from "../../../../components/ui";
import {
  PROFILE_PURPOSE_ACTIONS_LAYOUT,
  PROFILE_PURPOSE_COLUMN_WIDTHS,
  PROFILE_PURPOSE_DELETE_ACTION_CLASSNAME,
} from "../../shared/profilePurposeTableLayout";
import {
  canEditAcademicRecord,
  getAcademicEditDisabledReason,
  type AcademicModulePermissions,
} from "../../../../config/access/permissions";
import { getEstadoBadgeVariant } from "../perfil-egreso.utils";
import type { PerfilEgresoEnriched } from "../perfil-egreso.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface PerfilEgresoTableProps {
  data: PerfilEgresoEnriched[];
  role: SecubRole;
  permissions: AcademicModulePermissions;
  onView: (record: PerfilEgresoEnriched) => void;
  onEdit: (record: PerfilEgresoEnriched) => void;
  onDelete: (record: PerfilEgresoEnriched) => void;
}

function isInheritedReadonlyRecord(row: PerfilEgresoEnriched) {
  return Boolean(row.readonlyInherited || row.isInheritedAcademicBase);
}

function getInheritedReadonlyReason(row: PerfilEgresoEnriched, fallbackReason: string) {
  return isInheritedReadonlyRecord(row)
    ? "Este perfil de egreso fue heredado del ciclo anterior y queda como información de consulta."
    : fallbackReason;
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
      className: PROFILE_PURPOSE_COLUMN_WIDTHS.facultad,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.facultad,
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => (
        <span className="panel-table-cell-wrap">{row.programaNombre}</span>
      ),
      className: PROFILE_PURPOSE_COLUMN_WIDTHS.programa,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.programa,
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
          {isInheritedReadonlyRecord(row) ? (
            <Badge variant="info">Heredado</Badge>
          ) : null}
        </span>
      ),
      className: PROFILE_PURPOSE_COLUMN_WIDTHS.plan,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.plan,
    },
    {
      key: "descripcion",
      title: "Descripción",
      render: (row) => (
        <p className="panel-table-cell-wrap text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion}
        </p>
      ),
      className: PROFILE_PURPOSE_COLUMN_WIDTHS.descripcion,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.descripcion,
    },
    {
      key: "estado",
      title: "Estado",
      render: (row) => (
        <Badge variant={getEstadoBadgeVariant(row.estado)}>
          {row.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
      className: `${PROFILE_PURPOSE_COLUMN_WIDTHS.estado} whitespace-nowrap`,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.estado,
    },
  ];

  const actions: TableAction<PerfilEgresoEnriched>[] = [
    {
      key: "view",
      label: "Ver perfil",
      onClick: onView,
      icon: <ActionIcon name="view" />,
    },
    {
      key: "edit",
      label: "Editar perfil",
      onClick: onEdit,
      icon: <ActionIcon name="edit" />,
      disabled: (row) => isInheritedReadonlyRecord(row) || !canEditAcademicRecord("perfilEgreso", role, row.estado),
      disabledReason: (row) => getInheritedReadonlyReason(row, getAcademicEditDisabledReason("perfilEgreso", role, row.estado, "Solo se permite actualizar perfiles asociados a programas activos.")),
      show: () => role === "director" && permissions.canUpdate,
    },
    {
      key: "delete",
      label: "Eliminar perfil",
      onClick: onDelete,
      icon: <ActionIcon name="delete" />,
      show: () => role === "director" && permissions.canDelete,
      disabled: (row) => isInheritedReadonlyRecord(row),
      disabledReason: (row) => getInheritedReadonlyReason(row, "Eliminar perfil"),
      variant: "danger-hover",
      className: PROFILE_PURPOSE_DELETE_ACTION_CLASSNAME,
    },
  ];

  return (
    <Table
      columns={columns}
      data={data}
      rowKey={(row) => row.id}
      actions={actions}
      actionsLayout={PROFILE_PURPOSE_ACTIONS_LAYOUT}
      emptyMessage="No hay perfiles de egreso para los filtros seleccionados."
    />
  );
}

export default PerfilEgresoTable;
