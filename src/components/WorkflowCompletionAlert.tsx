import Button from "./ui/Button";
import Modal from "./ui/Modal";

interface WorkflowCompletionAlertProps {
  open: boolean;
  onClose: () => void;
}

export default function WorkflowCompletionAlert({ open, onClose }: WorkflowCompletionAlertProps) {
  return (
    <Modal
      open={open}
      role="alertdialog"
      title="¡Flujo completado!"
      description="La gestión académica fue completada correctamente."
      size="md"
      closeOnBackdrop={false}
      onClose={onClose}
      footer={
        <div className="flex justify-end">
          <Button data-autofocus onClick={onClose}>
            Entendido
          </Button>
        </div>
      }
    >
      <div className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[var(--color-surface-soft)] p-5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-success)] text-xl font-bold text-[var(--color-secondary-4)]" aria-hidden="true">
          ✓
        </span>
        <p className="text-sm leading-6 text-[var(--color-gray-3)]">
          Puedes continuar desde el Estado del ciclo.
        </p>
      </div>
    </Modal>
  );
}
