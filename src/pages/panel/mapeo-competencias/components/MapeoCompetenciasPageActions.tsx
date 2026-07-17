import { GoDownload, GoPencil, GoPlus, GoFile } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { MapeoCompetenciasEnriched, RolePermissions } from "../MapeoCompetencias.types";

interface MapeoCompetenciasPageActionsProps {
  permissions: RolePermissions;
  recordsLength: number;
  selectedRecord: MapeoCompetenciasEnriched | null;
  canOpenCreate: boolean;
  canOpenEdit: boolean;
  filteredRecords: MapeoCompetenciasEnriched[];
  onCreate: () => void;
  onEdit: (record: MapeoCompetenciasEnriched) => void;
  // onExportPdf: () => void;
  // onExportExcel: () => void;
  onExport: (format: "pdf" | "excel") => void;
}

export default function MapeoCompetenciasPageActions({
  permissions,
  // recordsLength,
  selectedRecord,
  canOpenCreate,
  canOpenEdit,
  filteredRecords,
  onCreate,
  onEdit,
  onExport,
  // onExportExcel,
}: MapeoCompetenciasPageActionsProps) {
  if (!permissions.canRead) return null;

  return (
    <>
      {permissions.canExportPdf ? (
        // <Button variant="outline" leftIcon={<GoDownload />} disabled={recordsLength === 0} onClick={onExportPdf}>
        //   Exportar PDF
        // </Button>
        <Button
          variant="outline"
          leftIcon={<GoFile className="text-lg" />}
          onClick={() => onExport("pdf")}
          disabled={!permissions.canExportPdf || filteredRecords.length === 0}
          title={
            permissions.canExportPdf
              ? "Exportar resultados filtrados en PDF"
              : "Tu rol no tiene permiso para exportar en PDF."
          }
        >
          PDF
        </Button>
      ) : null}
      {permissions.canExportExcel ? (
        // <Button variant="outline" leftIcon={<GoDownload />} disabled={recordsLength === 0} onClick={onExportExcel}>
        //   Exportar Excel
        // </Button>
        <Button
          variant="outline"
          leftIcon={<GoDownload className="text-lg" />}
          onClick={() => onExport("excel")}
          disabled={!permissions.canExportExcel || filteredRecords.length === 0}
          title={
            permissions.canExportExcel
              ? "Exportar resultados filtrados en Excel"
              : "Tu rol no tiene permiso para exportar en Excel."
          }
        >
          Excel
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
