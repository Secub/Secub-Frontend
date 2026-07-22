// import { useMemo, useState, useEffect } from "react";
import { GoDownload, GoPencil, GoPlus, GoFile } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { MapeoCompetenciasEnriched, RolePermissions, MapeoCompetenciasFilters, Catalogs, CurrentUser } from "../MapeoCompetencias.types";

export interface MapeoCompetenciasPageActionsProps {
  permissions: RolePermissions;
  recordsLength: number;
  selectedRecord: MapeoCompetenciasEnriched | null;
  canOpenCreate: boolean;
  canOpenEdit: boolean;
  filteredRecords: MapeoCompetenciasEnriched[];
  baseUser: CurrentUser;
  baseRecords: MapeoCompetenciasEnriched[];
  initialFilters: MapeoCompetenciasFilters;
  catalogs: Catalogs;
  onCreate: () => void;
  onEdit: (record: MapeoCompetenciasEnriched) => void;
  // onExportPdf: () => void;
  onExportExcel: () => void;
  onExport: (format: "excel" | "pdf") => void;
  // format: "pdf";
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
          title={filteredRecords.length > 0 ? "Exportar resultados filtrados en PDF" : "No hay registros para exportar."}
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
          title={filteredRecords.length > 0 ? "Exportar resultados filtrados en Excel" : "No hay registros para exportar."}
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
