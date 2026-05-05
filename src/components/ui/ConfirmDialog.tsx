import { GoAlert } from "react-icons/go";
import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "warning" | "danger";
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  variant = "warning",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      size="md"
      onClose={onCancel}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>

          <Button
            variant={variant === "danger" ? "danger" : "accent"}
            leftIcon={<GoAlert className="text-lg" />}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] p-4">
        <div className="flex gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-warning)] text-[var(--color-secondary-4)]">
            <GoAlert className="text-xl" />
          </span>

          <p className="text-sm leading-6 text-[var(--color-gray-3)]">
            Esta acción debe confirmarse antes de continuar.
          </p>
        </div>
      </div>
    </Modal>
  );
}

export type { ConfirmDialogProps };
