import { GoEye, GoPencil } from "react-icons/go";
import { IconButton } from "../../../../components/ui";
import type { AsignarRACourseRow } from "../AsignarRA.types";

interface AsignarRARowActionsProps {
  row: AsignarRACourseRow;
  canManage: boolean;
  onSelectCourse: (courseId: string) => void;
}

export function AsignarRARowActions({ row, canManage, onSelectCourse }: AsignarRARowActionsProps) {
  return (
    <IconButton
      variant={row.isSelected ? "primary_soft" : "outline"}
      icon={canManage ? <GoPencil /> : <GoEye />}
      label={`${canManage ? "Editar" : "Ver detalle de"} ${row.course.nombre}`}
      onClick={() => onSelectCourse(row.course.id)}
    />
  );
}
