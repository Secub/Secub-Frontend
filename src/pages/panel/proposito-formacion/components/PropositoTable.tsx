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
import { getEstadoBadgeVariant } from "../proposito-formacion.utils";
import type { PropositoEnriched } from "../proposito-formacion.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface PropositoTableProps {
  data: PropositoEnriched[];
  role: SecubRole;
  permissions: AcademicModulePermissions;
  onView: (record: PropositoEnriched) => void;
  onEdit: (record: PropositoEnriched) => void;
  onDelete: (record: PropositoEnriched) => void;
}

function isInheritedReadonlyRecord(row: PropositoEnriched) {
  return Boolean(row.readonlyInherited || row.isInheritedAcademicBase);
}

function getInheritedReadonlyReason(row: PropositoEnriched, fallbackReason: string) {
  return isInheritedReadonlyRecord(row)
    ? "Este propósito de formación fue heredado del ciclo anterior y queda como información de consulta."
    : fallbackReason;
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
      sortValue: (row) => row.facultadNombre,
      className: PROFILE_PURPOSE_COLUMN_WIDTHS.facultad,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.facultad,
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => <span className="panel-table-cell-wrap">{row.programaNombre}</span>,
      sortValue: (row) => row.programaNombre,
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
      sortValue: (row) => row.planNombre,
      className: PROFILE_PURPOSE_COLUMN_WIDTHS.plan,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.plan,
    },
    {
      key: "descripcion",
      title: "Descripción",
      render: (row) => (
        <p className="panel-table-cell-wrap text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion.length > 150
            ? `${row.descripcion.slice(0, 150).trimEnd()}...`
            : row.descripcion}
        </p>
      ),
      sortValue: (row) => row.descripcion,
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
      sortValue: (row) => row.estado === "activo" ? "Activo" : "Inactivo",
      className: `${PROFILE_PURPOSE_COLUMN_WIDTHS.estado} whitespace-nowrap`,
      headerClassName: PROFILE_PURPOSE_COLUMN_WIDTHS.estado,
    },
  ];

  const actions: TableAction<PropositoEnriched>[] = [
    {
      key: "view",
      label: "Ver propósito de formación",
      onClick: onView,
      icon: <ActionIcon name="view" />,
    },
    {
      key: "edit",
      label: "Editar propósito de formación",
      onClick: onEdit,
      icon: <ActionIcon name="edit" />,
      disabled: (row) => isInheritedReadonlyRecord(row) || !canEditAcademicRecord("propositoFormacion", role, row.estado),
      disabledReason: (row) => getInheritedReadonlyReason(row, getAcademicEditDisabledReason("propositoFormacion", role, row.estado, "Solo se permite editar propósitos asociados a programas activos.")),
      show: () => permissions.canUpdate,
    },
    {
      key: "delete",
      label: "Eliminar propósito de formación",
      onClick: onDelete,
      icon: <ActionIcon name="delete" />,
      show: () => permissions.canDelete,
      disabled: (row) => isInheritedReadonlyRecord(row),
      disabledReason: (row) => getInheritedReadonlyReason(row, "Eliminar propósito de formación"),
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
      emptyMessage="No hay propósitos de formación para los filtros seleccionados."
    />
  );
}

export default PropositoTable;
