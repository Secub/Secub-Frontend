import { GoEye, GoPencil } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { AsignarRACourseRow } from "../AsignarRA.types";

interface AsignarRARowActionsProps {
  row: AsignarRACourseRow;
  canManage: boolean;
  onSelectCourse: (courseId: string) => void;
}

export function AsignarRARowActions({ row, canManage, onSelectCourse }: AsignarRARowActionsProps) {
  return (
    <Button
      variant={row.isSelected ? "primary_soft" : "outline"}
      size="sm"
      leftIcon={canManage ? <GoPencil /> : <GoEye />}
      onClick={() => onSelectCourse(row.course.id)}
    >
      {row.actionLabel}
    </Button>
  );
}
