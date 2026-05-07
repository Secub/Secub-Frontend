import { ConfirmDialog } from "../../../../components/ui";
import type { MapeoCompetenciasEnriched } from "../MapeoCompetencias.types";

interface MapeoCompetenciasDeleteModalProps {
  open: boolean;
  record: MapeoCompetenciasEnriched | null;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MapeoCompetenciasDeleteModal({
  open,
  record,
  isLoading = false,
  onConfirm,
  onCancel,
}: MapeoCompetenciasDeleteModalProps) {
  if (!record) return null;

  return (
    <ConfirmDialog
      open={open}
      title="Eliminar Mapeo de Competencias"
      description={`Estas seguro de que deseas eliminar el mapeo de "${record.programaNombre}" en el plan "${record.planNombre}"? Esta accion no se puede deshacer.`}
      confirmLabel="Eliminar"
      cancelLabel="Cancelar"
      variant="danger"
      isLoading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default MapeoCompetenciasDeleteModal;
