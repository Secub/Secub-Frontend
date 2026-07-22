import { GoDownload, GoFile, GoPlus } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { PerfilEgresoEnriched, RolePermissions } from "../perfil-egreso.types";

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
          leftIcon={<GoPlus className="text-lg" />}
          onClick={onCreate}
          title="Crear un nuevo perfil de egreso"
        >
          Nuevo perfil
        </Button>
      ) : null}

      {permissions.canExportPdf ? (
        <Button
          variant="outline"
          leftIcon={<GoFile className="text-lg" />}
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
          leftIcon={<GoDownload className="text-lg" />}
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
