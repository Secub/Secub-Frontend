import { GoDownload, GoFile, GoPlus } from "react-icons/go";
import { Button } from "../../../../components/ui";
import type { PropositoEnriched, RolePermissions } from "../proposito-formacion.types";

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
  return (
    <div className="flex flex-wrap gap-3">
      {permissions.canCreate ? (
        <Button
          variant="primary"
          leftIcon={<GoPlus className="text-lg" />}
          onClick={onCreate}
          title="Crear un nuevo propósito de formación"
        >
          Nuevo propósito
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
