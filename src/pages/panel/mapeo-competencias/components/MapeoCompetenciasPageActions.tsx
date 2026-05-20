import { GoDownload, GoPencil, GoPlus } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { MapeoCompetenciasEnriched, RolePermissions } from "../MapeoCompetencias.types";

interface MapeoCompetenciasPageActionsProps {
  permissions: RolePermissions;
  recordsLength: number;
  selectedRecord: MapeoCompetenciasEnriched | null;
  canOpenCreate: boolean;
  canOpenEdit: boolean;
  onCreate: () => void;
  onEdit: (record: MapeoCompetenciasEnriched) => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export default function MapeoCompetenciasPageActions({
  permissions,
  recordsLength,
  selectedRecord,
  canOpenCreate,
  canOpenEdit,
  onCreate,
  onEdit,
  onExportPdf,
  onExportExcel,
}: MapeoCompetenciasPageActionsProps) {
  if (!permissions.canRead) return null;

  return (
    <>
      {permissions.canExportPdf ? (
        <Button variant="outline" leftIcon={<GoDownload />} disabled={recordsLength === 0} onClick={onExportPdf}>
          Exportar PDF
        </Button>
      ) : null}
      {permissions.canExportExcel ? (
        <Button variant="outline" leftIcon={<GoDownload />} disabled={recordsLength === 0} onClick={onExportExcel}>
          Exportar Excel
        </Button>
      ) : null}
      {canOpenEdit && selectedRecord ? (
        <Button variant="primary" leftIcon={<GoPencil />} onClick={() => onEdit(selectedRecord)}>
          Editar mapeo
        </Button>
      ) : canOpenCreate ? (
        <Button variant="primary" leftIcon={<GoPlus />} onClick={onCreate}>
          Crear mapeo
        </Button>
      ) : null}
    </>
  );
}
