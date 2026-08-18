import { Button } from "../../../../components/ui";
import type { PropositoEnriched, RolePermissions } from "../proposito-formacion.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface PropositoPageActionsProps {
  permissions: RolePermissions;
  filteredRecords: PropositoEnriched[];
  onCreate: () => void;
  onExport: (format: "pdf" | "excel") => void;
}

export default function PropositoPageActions({
  permissions,
  filteredRecords,
  onCreate,
  onExport,
}: PropositoPageActionsProps) {
  const hasRecords = filteredRecords.length > 0;

  return (
    <div className="flex flex-wrap gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<ActionIcon name="add" />}
          onClick={onCreate}
          title="Crear un nuevo propósito de formación"
        >
          Nuevo propósito
        </Button>
      ) : null}

      {permissions.canExportPdf ? (
        <Button
          variant="outline"
          leftIcon={<ActionIcon name="pdf" />}
          onClick={() => onExport("pdf")}
          disabled={!hasRecords}
          title={hasRecords ? "Exportar resultados filtrados en PDF" : "No hay registros para exportar."}
        >
          PDF
        </Button>
      ) : null}

      {permissions.canExportExcel ? (
        <Button
          variant="outline"
          leftIcon={<ActionIcon name="excel" />}
          onClick={() => onExport("excel")}
          disabled={!hasRecords}
          title={hasRecords ? "Exportar resultados filtrados en Excel" : "No hay registros para exportar."}
        >
          Excel
        </Button>
      ) : null}
    </div>
  );
}
