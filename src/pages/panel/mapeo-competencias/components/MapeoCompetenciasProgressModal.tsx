import { GoCheckCircle } from "react-icons/go";
import { Modal, Button } from "../../../../components/ui";

interface MapeoCompetenciasProgressModalProps {
  open: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export function MapeoCompetenciasProgressModal({
  open,
  title = "Progreso Guardado",
  message = "Tu progreso ha sido guardado correctamente.",
  onClose,
}: MapeoCompetenciasProgressModalProps) {
  return (
    <Modal open={open} title={title} onClose={onClose} size="md">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <GoCheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <p className="text-[var(--color-gray-3)]">{message}</p>
      </div>
      <div className="flex gap-3 pt-4">
        <Button
          variant="primary"
          onClick={onClose}
          className="flex-1"
        >
          Entendido
        </Button>
      </div>
    </Modal>
  );
}

export default MapeoCompetenciasProgressModal;
