import { useEffect, useState } from "react";
import { Badge, Button, Modal, Textarea } from "../../../../components/ui";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import {
  formatDate,
  getEstadoBadgeVariant,
  getLearningResultsCountLabel,
  getLearningResultsValidationMessage,
} from "../CompetenciasRa.utils";
import type { CompetenciasRaEnriched, ResultadoAprendizaje } from "../CompetenciasRa.types";

interface CompetenciasRaDetailModalProps {
  open: boolean;
  record: CompetenciasRaEnriched | null;
  canEdit: boolean;
  canDelete: boolean;
  onClose: () => void;
  onSaveDescription: (record: CompetenciasRaEnriched, descripcion: string) => boolean;
  onDelete: (record: CompetenciasRaEnriched) => void;
  onEditRa: (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => void;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-[var(--color-gray-4)]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-secondary-4)]">{value}</p>
    </div>
  );
}

function getRaLabel(numero: number) {
  return `RA ${String(numero).padStart(2, "0")}`;
}

export function CompetenciasRaDetailModal({
  open,
  record,
  canEdit,
  canDelete,
  onClose,
  onSaveDescription,
  onDelete,
  onEditRa,
}: CompetenciasRaDetailModalProps) {
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!record || !open) return;
    setDescriptionDraft(record.descripcion ?? "");
    setDescriptionError("");
    setSuccessMessage("");
  }, [record, open]);

  if (!record) return null;

  const resultadosAprendizaje = record.resultadosAprendizaje ?? [];
  const raValidationMessage = getLearningResultsValidationMessage({
    resultadosAprendizaje,
  });

  const handleSaveDescription = () => {
    const cleanDescription = descriptionDraft.trim();

    if (!cleanDescription) {
      setDescriptionError("Escribe tu competencia.");
      scrollToFirstValidationError({ fieldOrder: ["detalleCompetenciaDescripcion"] });
      return;
    }

    const saved = onSaveDescription(record, cleanDescription);

    if (saved) {
      setDescriptionError("");
      setSuccessMessage("Los cambios de la competencia se guardaron correctamente.");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Detalle de la competencia"
      description="Consulta y actualiza la información completa de la competencia seleccionada."
      size="lg"
    >
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

      <div className="mt-8 grid gap-6 border-t border-[var(--color-gray-6)] pt-6 md:grid-cols-2">
        <DetailItem label="Seccional" value={record.seccionalNombre} />
        <DetailItem label="Lugar de desarrollo" value={record.lugarNombre} />
        <DetailItem label="Facultad" value={record.facultadNombre} />
        <DetailItem label="Programa académico" value={record.programaNombre} />
        <DetailItem label="Plan de estudios" value={record.planNombre} />
      </div>

      <div className="mt-8 rounded-[24px] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
        {canEdit ? (
          <div className="space-y-4">
            <Textarea
              label="Escribe tu competencia"
              value={descriptionDraft}
              onChange={(event) => {
                setDescriptionDraft(event.target.value);
                setDescriptionError("");
                setSuccessMessage("");
              }}
              rows={6}
              placeholder="Escribe la competencia"
              id="detalleCompetenciaDescripcion"
              data-validation-field="detalleCompetenciaDescripcion"
              error={descriptionError}
            />
            {successMessage ? (
              <div
                role="status"
                className="rounded-[var(--radius-md)] border border-[var(--color-success)]/40 bg-[color:rgba(118,202,102,0.12)] px-4 py-3 text-sm font-medium text-[var(--color-secondary-4)]"
              >
                {successMessage}
              </div>
            ) : null}

            <div className="flex justify-end">
              <Button variant="primary" onClick={handleSaveDescription}>
                Guardar cambios
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm font-medium text-[var(--color-gray-4)]">Escribe tu competencia</p>
            <p className="mt-3 text-sm leading-7 text-[var(--color-gray-2)]">
              {record.descripcion}
            </p>
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-[var(--color-gray-6)] pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-[var(--color-gray-4)]">
            {getLearningResultsCountLabel(record)}
          </p>
        </div>

        {raValidationMessage ? (
          <div
            role="alert"
            className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]"
          >
            {raValidationMessage}
          </div>
        ) : null}

        <div className="mt-4 space-y-3">
          {resultadosAprendizaje.length > 0 ? resultadosAprendizaje.map((ra) => (
            <div
              key={ra.id}
              className="flex flex-col gap-3 rounded-md border border-[var(--color-gray-6)] bg-white p-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-1)] text-xs font-semibold text-white">
                  {String(ra.numero).padStart(2, "0")}
                </div>
                <div className="min-w-0">
                  <Badge variant="info">{getRaLabel(ra.numero)}</Badge>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                    {ra.descripcion}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                {canEdit ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => onEditRa(record, ra)}>
                    Editar RA
                  </Button>
                ) : null}
              </div>
            </div>
          )) : (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
              Esta competencia todavía no tiene Resultados de Aprendizaje asociados.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 border-t border-[var(--color-gray-6)] pt-6 md:grid-cols-2">
        <DetailItem label="Fecha de creación" value={formatDate(record.createdAt)} />
        <DetailItem
          label="Fecha de modificación"
          value={formatDate(record.updatedAt)}
        />
      </div>

      {canDelete ? (
        <div className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-error)]/40 bg-[var(--color-surface-soft)] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                Eliminar competencia
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                Esta acción elimina la competencia y sus Resultados de Aprendizaje asociados. También se limpiarán relaciones demo de mapeo o asignación vinculadas.
              </p>
            </div>
            <Button variant="danger" onClick={() => onDelete(record)}>
              Eliminar competencia
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}

export default CompetenciasRaDetailModal;
