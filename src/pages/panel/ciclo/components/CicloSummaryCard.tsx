import {
  GoCalendar,
  GoEye,
  GoPencil,
  GoTrash,
  GoVerified,
} from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
import type { CicloEnriched, CurrentUser } from "../ciclo.types";
import {
  canManageCycle,
  cicloRolePermissions,
  getCycleActionDisabledReason,
} from "../ciclo.permissions";
import { formatCicloTitle, formatDate, formatDateTime, getNivelCompromisoLabel } from "../ciclo.utils";

interface CicloSummaryCardProps {
  ciclo: CicloEnriched;
  user: CurrentUser;
  onView: (ciclo: CicloEnriched) => void;
  onEdit: (ciclo: CicloEnriched) => void;
  onDelete: (ciclo: CicloEnriched) => void;
}

const statusVariant = {
  borrador: "warning",
  activo: "success",
  finalizado: "neutral",
  pendiente: "info",
} as const;

const statusLabel = {
  borrador: "Borrador",
  activo: "En curso",
  finalizado: "Finalizado",
  pendiente: "Pendiente",
} as const;

export default function CicloSummaryCard({
  ciclo,
  user,
  onView,
  onEdit,
  onDelete,
}: CicloSummaryCardProps) {
  const permissions = cicloRolePermissions[user.role];
  const canEdit = canManageCycle(user, ciclo);
  const disabledReason = getCycleActionDisabledReason(user, ciclo);

  return (
    <article className="surface-card p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              {formatCicloTitle(ciclo)}
            </h3>
            <Badge variant={statusVariant[ciclo.estado]}>{statusLabel[ciclo.estado]}</Badge>
            {ciclo.planEstado === "inactivo" ? (
              <Badge variant="neutral">Plan inactivo</Badge>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            {ciclo.programaNombre} · {ciclo.planNombre.replace(" (Inactivo)", "")} · {ciclo.facultadNombre} ·{" "}
            {formatDate(ciclo.fechaInicio)} — {formatDate(ciclo.fechaFin)}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {permissions.canEditCycle ? (
            <Button
              variant="outline"
              size="sm"
              leftIcon={<GoPencil className="text-lg" />}
              onClick={() => onEdit(ciclo)}
              disabled={!canEdit}
              title={!canEdit ? disabledReason : "Editar ciclo"}
            >
              Editar
            </Button>
          ) : null}

          <Button
            variant="outline"
            size="sm"
            leftIcon={<GoEye className="text-lg" />}
            onClick={() => onView(ciclo)}
            title="Se enrutará con el dashboard."
          >
            Ver detalle
          </Button>

          {permissions.canDeleteCycle ? (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<GoTrash className="text-lg" />}
              onClick={() => onDelete(ciclo)}
              disabled={!canEdit}
              title={!canEdit ? disabledReason : "Eliminar ciclo"}
            >
              Eliminar
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-5 text-center shadow-sm">
          <p className="font-heading text-4xl font-semibold text-[var(--color-secondary-4)]">
            {ciclo.cursosSeleccionados.length}
          </p>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Cursos de Síntesis seleccionados
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-5 text-center shadow-sm">
          <p className="font-heading text-4xl font-semibold text-[var(--color-secondary-4)]">
            {ciclo.duracionAnios}
          </p>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">Años de duración</p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-5 text-center shadow-sm">
          <p className="font-heading text-4xl font-semibold text-[var(--color-secondary-4)]">
            {ciclo.progreso}%
          </p>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">Completado</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
            Selección de cursos {ciclo.periodo}
          </h4>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-gray-4)]">
            <GoCalendar className="text-base text-[var(--color-secondary-1)]" />
            Última actualización: {formatDateTime(ciclo.updatedAt)}
          </span>
        </div>

        <div className="space-y-3">
          {ciclo.cursosSeleccionados.length > 0 ? (
            ciclo.cursosSeleccionados.map((curso) => (
              <div
                key={curso.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                      {curso.nombre}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                      {curso.codigo} · Semestre {curso.semestre} · Área: {curso.nucleo} · Docente:{" "}
                      {curso.docente} ({curso.tipoVinculacion})
                    </p>
                  </div>

                  <Badge variant="info">
                    {getNivelCompromisoLabel(curso.nivelCompromiso)}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5 text-sm text-[var(--color-gray-3)]">
              Este ciclo todavía no tiene cursos seleccionados.
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[var(--color-gray-3)]">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--color-surface-soft)] px-4 py-2">
          <GoVerified className="text-base text-[var(--color-secondary-1)]" />
          Responsable: {ciclo.responsableNombre}
        </span>
        <span className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2">
          Creado: {formatDateTime(ciclo.createdAt)}
        </span>
      </div>
    </article>
  );
}