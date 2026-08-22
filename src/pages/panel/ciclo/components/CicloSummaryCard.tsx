import { useEffect, useRef, useState } from "react";
import { SecubIcon } from "../../../../components/ui/SecubIcon";
import { Badge, IconButton } from "../../../../components/ui";
import type { CicloEnriched, CurrentUser } from "../ciclo.types";
import {
  canDuplicateCycle,
  canManageCycle,
  getCycleActionDisabledReason,
  getCyclePermissions,
  getDuplicateCycleDisabledReason,
} from "../../../../config/access/permissions";
import { formatCicloTitle, formatDate, formatDateTime, getNivelCompromisoLabel } from "../ciclo.utils";

import { ActionIcon } from "../../../../components/ui/ActionIcon";

interface CicloSummaryCardProps {
  ciclo: CicloEnriched;
  user: CurrentUser;
  activeCycle: CicloEnriched | null;
  onView: (ciclo: CicloEnriched) => void;
  onEdit: (ciclo: CicloEnriched) => void;
  onDelete: (ciclo: CicloEnriched) => void;
  onDuplicate: (ciclo: CicloEnriched) => void;
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
  activeCycle,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
}: CicloSummaryCardProps) {
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const permissions = getCyclePermissions(user.role);
  const canEdit = canManageCycle(user, ciclo);
  const disabledReason = getCycleActionDisabledReason(user, ciclo);
  const activeCycleDuplicateReason = activeCycle
    ? `Ya existe un ciclo en curso: "${activeCycle.nombre}". No se podrá duplicar un ciclo existente hasta que su estado sea diferente a "En curso".`
    : "";
  const canDuplicate = !activeCycle && canDuplicateCycle(user, ciclo);
  const duplicateDisabledReason = activeCycleDuplicateReason || getDuplicateCycleDisabledReason(user, ciclo);
  const hasSecondaryActions =
    permissions.canEditCycle || permissions.canDuplicateCycle || permissions.canDeleteCycle;

  useEffect(() => {
    if (!isActionsMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!actionsMenuRef.current?.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActionsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActionsMenuOpen]);

  const runMenuAction = (action: () => void) => {
    setIsActionsMenuOpen(false);
    action();
  };

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

        <div className="flex shrink-0 flex-nowrap items-center gap-3">
          <IconButton
            variant="outline"
            icon={<ActionIcon name="view" />}
            label={`Ver detalle del ciclo ${formatCicloTitle(ciclo)}`}
            onClick={() => onView(ciclo)}
          />

          {hasSecondaryActions ? (
            <div ref={actionsMenuRef} className="relative">
              <button
                type="button"
                aria-label={`Más acciones para el ciclo ${formatCicloTitle(ciclo)}`}
                title="Más acciones"
                aria-haspopup="menu"
                aria-expanded={isActionsMenuOpen}
                onClick={() => setIsActionsMenuOpen((isOpen) => !isOpen)}
                className="inline-flex h-10 w-10 shrink-0 appearance-none items-center justify-center border-0 bg-transparent p-0 text-[var(--color-gray-4)] shadow-none transition-colors hover:bg-transparent hover:text-[var(--color-secondary-1)] focus-visible:bg-transparent focus-visible:text-[var(--color-secondary-1)] focus-visible:outline-none active:bg-transparent active:text-[var(--color-secondary-1)]"
              >
                <ActionIcon name="more" />
              </button>

              {isActionsMenuOpen ? (
                <div
                  role="menu"
                  aria-label={`Acciones del ciclo ${formatCicloTitle(ciclo)}`}
                  className="absolute right-0 top-full z-30 mt-2 min-w-44 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--secub-surface)] p-1.5 shadow-lg"
                >
                  {permissions.canEditCycle ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!canEdit}
                      title={!canEdit ? disabledReason : `Editar ciclo ${formatCicloTitle(ciclo)}`}
                      onClick={() => runMenuAction(() => onEdit(ciclo))}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-1)] focus-visible:bg-[var(--color-surface-soft)] focus-visible:text-[var(--color-secondary-1)] focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[var(--color-gray-5)] disabled:opacity-55"
                    >
                      <ActionIcon name="edit" size="sm" />
                      <span>Editar</span>
                    </button>
                  ) : null}

                  {permissions.canDuplicateCycle ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!canDuplicate}
                      title={!canDuplicate ? duplicateDisabledReason : "Duplicar ciclo"}
                      onClick={() => runMenuAction(() => onDuplicate(ciclo))}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-1)] focus-visible:bg-[var(--color-surface-soft)] focus-visible:text-[var(--color-secondary-1)] focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[var(--color-gray-5)] disabled:opacity-55"
                    >
                      <ActionIcon name="copy" size="sm" />
                      <span>Duplicar</span>
                    </button>
                  ) : null}

                  {permissions.canDeleteCycle ? (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!canEdit}
                      title={!canEdit ? disabledReason : `Eliminar ciclo ${formatCicloTitle(ciclo)}`}
                      onClick={() => runMenuAction(() => onDelete(ciclo))}
                      className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-left text-sm font-medium text-[var(--color-error)] transition-colors hover:bg-[var(--color-surface-soft)] focus-visible:bg-[var(--color-surface-soft)] focus-visible:outline-none disabled:cursor-not-allowed disabled:text-[var(--color-gray-5)] disabled:opacity-55"
                    >
                      <ActionIcon name="delete" size="sm" />
                      <span>Eliminar</span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--secub-surface)] p-5 text-center shadow-sm">
          <p className="font-heading text-4xl font-semibold text-[var(--color-secondary-4)]">
            {ciclo.cursosSeleccionados.length}
          </p>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Cursos de Síntesis seleccionados
          </p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--secub-surface)] p-5 text-center shadow-sm">
          <p className="font-heading text-4xl font-semibold text-[var(--color-secondary-4)]">
            {ciclo.duracionAnios}
          </p>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">Años de duración</p>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--secub-surface)] p-5 text-center shadow-sm">
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
            <SecubIcon name="calendar" weight="fill" className="text-base text-[var(--color-secondary-1)]" />
            Última actualización: {formatDateTime(ciclo.updatedAt)}
          </span>
        </div>

        <div className="space-y-3">
          {ciclo.cursosSeleccionados.length > 0 ? (
            ciclo.cursosSeleccionados.map((curso) => (
              <div
                key={curso.id}
                className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--secub-surface)] p-4 shadow-sm"
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
          <SecubIcon name="verified" weight="fill" className="text-base text-[var(--color-secondary-1)]" />
          Responsable: {ciclo.responsableNombre}
        </span>
        <span className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2">
          Creado: {formatDateTime(ciclo.createdAt)}
        </span>
      </div>
    </article>
  );
}
