import { Button, Modal, Textarea } from "../../../../components/ui";
import type { CompetenciasRaEnriched } from "../CompetenciasRa.types";

interface CompetenciasRaModalRAProps {
  mode: "create" | "edit" | null;
  record: CompetenciasRaEnriched | null;
  draft: string;
  error: string;
  onDraftChange: (value: string) => void;
  onClearError: () => void;
  onClose: () => void;
  onSave: () => void;
  isCreateLimitReached?: boolean;
}

export default function CompetenciasRaModalRA({
  mode,
  record,
  draft,
  error,
  onDraftChange,
  onClearError,
  onClose,
  onSave,
  isCreateLimitReached = false,
}: CompetenciasRaModalRAProps) {
  const limitMessage = "Ya alcanzaste el máximo de 4 resultados de aprendizaje permitidos.";
  return (
    <Modal
      open={Boolean(mode)}
      title={mode === "edit" ? "Editar RA" : "Agregar RA"}
      description={
        record
          ? `Resultado de Aprendizaje asociado a ${record.nombre}.`
          : "Resultado de Aprendizaje asociado a la competencia."
      }
      size="md"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSave} disabled={isCreateLimitReached}>
            {mode === "edit" ? "Guardar RA" : "Agregar RA"}
          </Button>
        </div>
      }
    >
      {isCreateLimitReached ? (
        <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]">
          {limitMessage}
        </div>
      ) : null}

      <Textarea
        label="Descripción del RA"
        value={draft}
        onChange={(event) => {
          onDraftChange(event.target.value);
          onClearError();
        }}
        rows={6}
        placeholder="Escribe el Resultado de Aprendizaje"
        disabled={isCreateLimitReached}
        id="raDescripcion"
        data-validation-field="raDescripcion"
        error={error || (isCreateLimitReached ? limitMessage : "")}
      />
    </Modal>
  );
}
