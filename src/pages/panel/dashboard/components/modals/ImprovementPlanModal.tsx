import { Button, Modal, Textarea, Input } from "../../../../../components/ui";
import type { EnrichedCycle } from "../../dashboard.types";
import { downloadLetterPdf } from "../../../../../components/PdfTemplate";
import { SECUB_PDF_BRANDING } from "../../../../../config/pdfBranding";

interface ImprovementPlanModalProps {
  improvementCycle: EnrichedCycle | null;
  improvementTitle: string;
  improvementDraft: string;
  improvementError: string;
  onClose: () => void;
  onSave: () => void;
  onDraftChange: (value: string) => void;
  setImprovementTitle: (value: string) => void;
}

export default function ImprovementPlanModal({
  improvementCycle,
  improvementTitle = "",
  improvementDraft = "",
  improvementError,
  onClose,
  onSave,
  onDraftChange = () => {},
  setImprovementTitle = () => {},
}: ImprovementPlanModalProps) {
  return (
    <Modal
      open={Boolean(improvementCycle)}
      title="Cargar plan de mejora"
      description={improvementCycle ? `${improvementCycle.name} · ${improvementCycle.period}` : undefined}
      size="md"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              if (!improvementCycle) return;

              await downloadLetterPdf(
                {
                  title: `Plan de mejora — ${improvementCycle.name}`,
                  subtitle: improvementCycle.period,
                  logoUrl: SECUB_PDF_BRANDING.logoUrl,
                  logoUrl2: SECUB_PDF_BRANDING.logoUrl2,
                  logoUrlfoot1: SECUB_PDF_BRANDING.logoUrlfoot1,
                  logoUrlfoot2: SECUB_PDF_BRANDING.logoUrlfoot2,
                  improvementTitle: improvementTitle ?? "",
                  improvementDraft: improvementDraft ?? "",
                },
                `plan-mejora-${improvementCycle.id}.pdf`,
              );
            }}
          >
            Descargar PDF
          </Button>
          <Button variant="primary" onClick={onSave}>
            Guardar plan de mejora
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input
          label="Título del plan de mejora"
          value={improvementTitle ?? ""}
          maxLength={180}
          helperText={`${(improvementTitle ?? "").length}/180 caracteres`}
          placeholder="Escribe un título breve para el plan de mejora"
          data-validation-field="dashboard-improvement-title"
          onChange={(event) => setImprovementTitle(event.target.value)}
        />
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
          El plan se guarda temporalmente en el navegador y queda relacionado con el ciclo,
          el programa y el plan de estudios seleccionados.
        </div>


        <Textarea
          label="Descripción del plan de mejora general"
          value={improvementDraft ?? ""}
          rows={6}
          maxLength={900}
          helperText={`${(improvementDraft ?? "").length}/900 caracteres`}
          placeholder="Describe las acciones generales para cerrar brechas del ciclo, responsables, tiempos y seguimiento esperado."
          data-validation-field="dashboard-improvement-plan"
          error={improvementError || undefined}
          onChange={(event) => onDraftChange(event.target.value)}
        />
      </div>
    </Modal>
  );
}
