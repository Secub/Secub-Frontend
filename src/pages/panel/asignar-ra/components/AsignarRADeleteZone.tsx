import { Button } from "../../../../components/ui";

interface AsignarRADeleteZoneProps {
  canDelete: boolean;
  hasAssignments: boolean;
  onDelete: () => void;
}

export function AsignarRADeleteZone({ canDelete, hasAssignments, onDelete }: AsignarRADeleteZoneProps) {
  if (!canDelete || !hasAssignments) return null;

  return (
    <div className="mt-8 rounded-[var(--radius-lg)] border border-[color:rgba(235,87,87,0.25)] bg-[color:rgba(235,87,87,0.05)] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="font-heading text-base font-semibold text-[var(--color-error)]">Eliminar asignación</h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Elimina los RA asignados a este curso para el ciclo seleccionado. También se limpiarán mediciones relacionadas.
          </p>
        </div>
        <Button variant="danger" onClick={onDelete}>Eliminar asignación</Button>
      </div>
    </div>
  );
}
