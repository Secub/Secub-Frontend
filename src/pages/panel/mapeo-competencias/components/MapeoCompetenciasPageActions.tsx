import type { AcademicModulePermissions } from "../../../../config/access/permissions";
// import { useMemo, useState, useEffect } from "react";
import { Button, IconButton } from "../../../../components/ui";
import type { MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters, Catalogs, CurrentUser } from "../MapeoCompetencias.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
export interface MapeoCompetenciasPageActionsProps {
  permissions: AcademicModulePermissions;
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
        <Button
          variant="outline"
          leftIcon={<ActionIcon name="pdf" />}
          onClick={() => onExport("pdf")}
          disabled={!permissions.canExportPdf || filteredRecords.length === 0}
          title={filteredRecords.length > 0 ? "Exportar resultados filtrados en PDF" : "No hay registros para exportar."}
        >
          PDF
        </Button>
      ) : null}
      {permissions.canExportExcel ? (
        <Button
          variant="outline"
          leftIcon={<ActionIcon name="excel" />}
          onClick={() => onExport("excel")}
          disabled={!permissions.canExportExcel || filteredRecords.length === 0}
          title={filteredRecords.length > 0 ? "Exportar resultados filtrados en Excel" : "No hay registros para exportar."}
        >
          Excel
        </Button>
      ) : null}
      {canOpenEdit && selectedRecord ? (
        <IconButton
          variant="primary"
          icon={<ActionIcon name="edit" />}
          label={`Editar mapeo de ${selectedRecord.programaNombre ?? "programa seleccionado"}`}
          onClick={() => onEdit(selectedRecord)}
        />
      ) : canOpenCreate ? (
        <Button variant="primary" leftIcon={<ActionIcon name="add" />} onClick={onCreate}>
          Crear mapeo
        </Button>
      ) : null}
    </>
  );
}
