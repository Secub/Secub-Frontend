import { GoDownload, GoFile, GoPlus } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { CompetenciasRaEnriched, RolePermissions } from "../CompetenciasRa.types";

interface CompetenciasRaPageActionsProps {
  permissions: RolePermissions;
  filteredRecords: CompetenciasRaEnriched[];
  onCreate: () => void;
  onExport: (format: "pdf" | "excel") => void;
}

export default function CompetenciasRaPageActions({
  permissions,
  filteredRecords,
  onCreate,
  onExport,
}: CompetenciasRaPageActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<GoPlus className="text-lg" />}
          onClick={onCreate}
          title="Crear una nueva competencia"
        >
          Nueva competencia
        </Button>
      ) : null}

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
    </div>
  );
}
