import type { AcademicModulePermissions } from "../../../../config/access/permissions";
import { Button } from "../../../../components/ui";
import type { CompetenciasRaEnriched } from "../CompetenciasRa.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface CompetenciasRaPageActionsProps {
  permissions: AcademicModulePermissions;
  canCreate: boolean;
  createDisabledReason: string;
  filteredRecords: CompetenciasRaEnriched[];
  onCreate: () => void;
  onExport: (format: "pdf" | "excel") => void;
}

export default function CompetenciasRaPageActions({
  permissions,
  canCreate,
  createDisabledReason,
  filteredRecords,
  onCreate,
  onExport,
}: CompetenciasRaPageActionsProps) {
  const hasRecords = filteredRecords.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<ActionIcon name="add" />}
          onClick={onCreate}
          disabled={!canCreate}
          title={canCreate ? "Crear una nueva competencia" : createDisabledReason}
        >
          Nueva competencia
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
