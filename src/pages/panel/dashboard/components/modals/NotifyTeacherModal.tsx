import { Button, Modal } from "../../../../../components/ui";
import type { EnrichedCourse } from "../../dashboard.types";

interface NotifyTeacherModalProps {
  notifyCourse: EnrichedCourse | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function NotifyTeacherModal({
  notifyCourse,
  onClose,
  onConfirm,
}: NotifyTeacherModalProps) {
  return (
    <Modal
      open={Boolean(notifyCourse)}
      title="Enviar correo recordatorio"
      description="SECUB registrará la notificación y enviará el recordatorio al correo institucional del docente de tiempo completo."
      size="md"
      onClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            Enviar recordatorio
          </Button>
        </div>
      }
    >
      {notifyCourse ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
          <p className="text-sm leading-6 text-[var(--color-gray-3)]">
            Se enviará un recordatorio para <strong>{notifyCourse.teacherName}</strong> por el curso{" "}
            <strong>{notifyCourse.name}</strong>, que tiene{" "}
            <strong>{notifyCourse.pendingRa}</strong> RA pendientes de medición.
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
