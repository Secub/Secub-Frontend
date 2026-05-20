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
}: CompetenciasRaModalRAProps) {
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
          <Button variant="primary" onClick={onSave}>
            {mode === "edit" ? "Guardar RA" : "Agregar RA"}
          </Button>
        </div>
      }
    >
      <Textarea
        label="Descripción del RA"
        value={draft}
        onChange={(event) => {
          onDraftChange(event.target.value);
          onClearError();
        }}
        rows={6}
        placeholder="Escribe el Resultado de Aprendizaje"
        id="raDescripcion"
        data-validation-field="raDescripcion"
        error={error}
      />
    </Modal>
  );
}
