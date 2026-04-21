import { Badge, Modal } from "../../../../components/ui";
import { getEstadoBadgeVariant, formatDate } from "../proposito-formacion.utils";
import type { PropositoEnriched } from "../proposito-formacion.types";

interface PropositoDetailModalProps {
  open: boolean;
  record: PropositoEnriched | null;
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

export function PropositoDetailModal({
  open,
  record,
  onClose,
}: PropositoDetailModalProps) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle del propósito de formación"
      description="Consulta la información completa del propósito seleccionado."
      size="lg"
    >
      <div className="grid gap-6 md:grid-cols-2">
        <DetailItem label="Programa" value={record.programaNombre} />
        <div>
          <p className="text-sm font-medium text-[var(--color-gray-4)]">Estado</p>
          <div className="mt-2">
            <Badge variant={getEstadoBadgeVariant(record.estado)}>
              {record.estado === "activo" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </div>
        <DetailItem label="Plan de estudios" value={record.planNombre} />
        <DetailItem label="Seccional / Sede" value={record.seccionalNombre} />
        <DetailItem label="Lugar de desarrollo" value={record.lugarNombre} />
        <DetailItem label="Facultad" value={record.facultadNombre} />
      </div>

      <div className="mt-8 rounded-[24px] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
        <p className="text-sm font-medium text-[var(--color-gray-4)]">Descripción</p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-gray-2)]">
          {record.descripcion}
        </p>
      </div>

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

export default PropositoDetailModal;