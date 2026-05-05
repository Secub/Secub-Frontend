import { Badge, Modal } from "../../../../components/ui";
import { getEstadoBadgeVariant, formatDate } from "../CompetenciasRa.utils";
import type { CompetenciasRaEnriched } from "../CompetenciasRa.types";

interface CompetenciasRaDetailModalProps {
  open: boolean;
  record: CompetenciasRaEnriched | null;
  onClose: () => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-gray-4)]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-secondary-4)]">{value}</p>
    </div>
  );
}

export function CompetenciasRaDetailModal({
  open,
  record,
  onClose,
}: CompetenciasRaDetailModalProps) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle de la Competencia y RA"
      description="Consulta la información completa de la competencia RA seleccionada."
      size="lg"
    >
      {/* Información principal */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-[var(--color-gray-4)]">Número de Competencia</p>
          <div className="mt-2 inline-block rounded-full bg-[var(--color-secondary-1)] px-4 py-2">
            <span className="text-base font-semibold text-white">{record.numero}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--color-gray-4)]">Estado</p>
          <div className="mt-2">
            <Badge variant={getEstadoBadgeVariant(record.estado)}>
              {record.estado === "activo" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Datos de localización y estructura */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 border-t border-[var(--color-gray-6)] pt-6">
        <DetailItem label="Seccional / Sede" value={record.seccionalNombre} />
        <DetailItem label="Lugar de desarrollo" value={record.lugarNombre} />
        <DetailItem label="Facultad" value={record.facultadNombre} />
        <DetailItem label="Programa académico" value={record.programaNombre} />
        <DetailItem label="Plan de estudios" value={record.planNombre} />
      </div>

      {/* Descripción */}
      <div className="mt-8 rounded-[24px] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
        <p className="text-sm font-medium text-[var(--color-gray-4)]">Descripción</p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-2)]">
          {record.descripcion}
        </p>
      </div>

      {/* Resultados de Aprendizaje */}
      {record.resultadosAprendizaje && record.resultadosAprendizaje.length > 0 && (
        <div className="mt-8 border-t border-[var(--color-gray-6)] pt-6">
          <p className="text-sm font-medium text-[var(--color-gray-4)]">
            Resultados de Aprendizaje ({record.resultadosAprendizaje.length})
          </p>
          <div className="mt-4 space-y-3">
            {record.resultadosAprendizaje.map((ra) => (
              <div
                key={ra.id}
                className="flex gap-3 rounded-md border border-[var(--color-gray-6)] bg-white p-3"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-1)] font-semibold text-white">
                  {ra.numero}
                </div>
                <p className="pt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                  {ra.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fechas */}
      <div className="mt-8 grid gap-4 border-t border-[var(--color-gray-6)] pt-6 md:grid-cols-2">
        <DetailItem label="Fecha de creación" value={formatDate(record.createdAt)} />
        <DetailItem
          label="Fecha de modificación"
          value={formatDate(record.updatedAt)}
        />
      </div>
    </Modal>
  );
}

export default CompetenciasRaDetailModal;