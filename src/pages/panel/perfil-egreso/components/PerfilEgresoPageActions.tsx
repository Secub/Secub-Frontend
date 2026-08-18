import { Button } from "../../../../components/ui";
import type { PerfilEgresoEnriched, RolePermissions } from "../perfil-egreso.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface PerfilEgresoPageActionsProps {
  permissions: RolePermissions;
  filteredRecords: PerfilEgresoEnriched[];
  onCreate: () => void;
  onExport: (format: "pdf" | "excel") => void;
}

export default function PerfilEgresoPageActions({
  permissions,
  filteredRecords,
  onCreate,
  onExport,
}: PerfilEgresoPageActionsProps) {
  const hasRecords = filteredRecords.length > 0;

  return (
    <div className="flex flex-wrap gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<ActionIcon name="add" />}
          onClick={onCreate}
          title="Crear un nuevo perfil de egreso"
        >
          Nuevo perfil
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
