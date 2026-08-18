import { IconButton } from "../../../../components/ui";
import type { AsignarRACourseRow } from "../AsignarRA.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";

interface AsignarRARowActionsProps {
  row: AsignarRACourseRow;
  canManage: boolean;
  onSelectCourse: (courseId: string) => void;
}

export function AsignarRARowActions({ row, canManage, onSelectCourse }: AsignarRARowActionsProps) {
  return (
    <IconButton
      variant={row.isSelected ? "primary_soft" : "outline"}
      selected={row.isSelected}
      icon={canManage ? <ActionIcon name="edit" /> : <ActionIcon name="view" />}
      label={`${canManage ? "Editar" : "Ver detalle de"} ${row.course.nombre}`}
      onClick={() => onSelectCourse(row.course.id)}
    />
  );
}
