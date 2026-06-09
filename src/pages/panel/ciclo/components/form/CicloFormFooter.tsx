import { GoCheck, GoProject } from "react-icons/go";
import { Button } from "../../../../../components/ui";
import type { CicloEnriched } from "../../ciclo.types";
import { formatDate } from "../../ciclo.utils";

interface CicloFormFooterProps {
  record?: CicloEnriched | null;
  isReadOnly: boolean;
  canSubmit: boolean;
  primaryLabel: string;
  onClose: () => void;
  onSubmit: () => void;
}

export default function CicloFormFooter({
  record,
  isReadOnly,
  canSubmit,
  primaryLabel,
  onClose,
  onSubmit,
}: CicloFormFooterProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 border-b border-[var(--color-gray-6)] pb-4 text-sm text-[var(--color-gray-3)] md:grid-cols-2">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
            <GoProject className="text-xl" />
          </span>
          <span>
            <strong className="text-[var(--color-secondary-4)]">Creado:</strong>{" "}
            {record ? formatDate(record.createdAt.slice(0, 10)) : formatDate(new Date().toISOString().slice(0, 10))}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
            <GoProject className="text-xl" />
          </span>
          <span>
            <strong className="text-[var(--color-secondary-4)]">Modificado:</strong>{" "}
            {record ? formatDate(record.updatedAt.slice(0, 10)) : formatDate(new Date().toISOString().slice(0, 10))}
          </span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>

        {!isReadOnly ? (
          <Button
            variant="primary"
            leftIcon={<GoCheck className="text-lg" />}
            onClick={onSubmit}
            disabled={isReadOnly}
            title={canSubmit ? "Confirmar selección de cursos" : "Completa la información obligatoria para confirmar la selección."}
          >
            {primaryLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
