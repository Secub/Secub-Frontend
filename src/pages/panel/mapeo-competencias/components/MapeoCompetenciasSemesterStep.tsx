import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { GoInfo } from "react-icons/go";
import { Badge, Button, Select } from "../../../../components/ui";
import type {
  CompetenciaRaDemoRecord,
  CursoAsis,
  NivelCompromiso,
  NivelesDraft,
  NucleoFormacion,
} from "../MapeoCompetencias.types";
import {
  NIVELES_COMPROMISO,
  getCompetenciaDisplayName,
  getMappingKey,
  getNivelShort,
  getNivelVariant,
  getNucleoLabel,
  getNucleoVariant,
} from "../MapeoCompetencias.utils";

interface MapeoCompetenciasSemesterStepProps {
  semestreNumero: number;
  totalSemestres: number;
  nucleo: NucleoFormacion | null;
  cursos: CursoAsis[];
  competencias: CompetenciaRaDemoRecord[];
  nivelesDraft: NivelesDraft;
  disabled?: boolean;
  isConfirmed: boolean;
  isConfirmReady: boolean;
  onConfirm: () => void;
  onNivelChange: (cursoId: string, competenciaId: string, nivel: NivelCompromiso | "") => void;
}

interface CompetenciaHeaderTooltipProps {
  competencia: CompetenciaRaDemoRecord;
  displayName: string;
  isOpen: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onClose: () => void;
}

function getCompetenciaDescription(competencia: CompetenciaRaDemoRecord) {
  const description = competencia.descripcion?.trim();
  const name = competencia.nombre?.trim();

  if (description) return description;
  if (name) return name;
  return "Esta competencia específica no tiene una descripción registrada todavía.";
}

function CompetenciaHeaderTooltip({
  competencia,
  displayName,
  isOpen,
  onOpen,
  onToggle,
  onClose,
}: CompetenciaHeaderTooltipProps) {
  const tooltipId = `competencia-tooltip-${competencia.id}`;
  const description = getCompetenciaDescription(competencia);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 320 });

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(onClose, 120);
  };

  const updatePosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    const viewportPadding = 12;
    const gap = 10;
    const width = Math.min(360, Math.max(240, window.innerWidth - viewportPadding * 2));
    const tooltipHeight = tooltipRef.current?.offsetHeight ?? 140;
    const preferredLeft = triggerRect.left + triggerRect.width / 2 - width / 2;
    const left = Math.min(
      Math.max(preferredLeft, viewportPadding),
      Math.max(viewportPadding, window.innerWidth - width - viewportPadding),
    );
    const canRenderBelow = triggerRect.bottom + gap + tooltipHeight <= window.innerHeight - viewportPadding;
    const top = canRenderBelow
      ? triggerRect.bottom + gap
      : Math.max(viewportPadding, triggerRect.top - tooltipHeight - gap);

    setPosition({ top, left, width });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
  }, [isOpen, competencia.id, description]);

  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => updatePosition();
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || tooltipRef.current?.contains(target)) return;
      onClose();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => () => clearCloseTimer(), []);

  const tooltip = isOpen && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className="fixed z-50 rounded-lg border border-[var(--color-secondary-5)] bg-white p-4 text-left text-xs font-normal leading-5 text-[var(--color-gray-2)] shadow-[var(--shadow-lg)]"
          style={{ top: position.top, left: position.left, width: position.width }}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        >
          <p className="mb-2 font-semibold text-[var(--color-secondary-4)]">
            Descripción de la competencia específica
          </p>
          <p>{description}</p>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="flex items-center justify-center gap-1.5">
      <span className="line-clamp-2 text-center leading-4">
        {displayName}
      </span>

      <button
        ref={triggerRef}
        type="button"
        className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-secondary-1)] bg-white text-[var(--color-secondary-1)] transition hover:bg-[var(--color-secondary-1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(14,101,217,0.28)] focus-visible:ring-offset-2"
        aria-label={`Ver descripción de ${displayName}`}
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        onMouseEnter={() => {
          clearCloseTimer();
          if (!isOpen) onOpen();
        }}
        onMouseLeave={scheduleClose}
        onFocus={() => {
          clearCloseTimer();
          if (!isOpen) onOpen();
        }}
        onBlur={scheduleClose}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return;
          event.preventDefault();
          onToggle();
        }}
        onClick={(event) => {
          if (event.detail === 0) onToggle();
        }}
      >
        <GoInfo aria-hidden="true" className="text-sm" />
      </button>

      {tooltip}
    </div>
  );
}

export default function MapeoCompetenciasSemesterStep({
  semestreNumero,
  totalSemestres,
  nucleo,
  cursos,
  competencias,
  nivelesDraft,
  disabled = false,
  isConfirmed,
  isConfirmReady,
  onConfirm,
  onNivelChange,
}: MapeoCompetenciasSemesterStepProps) {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [openCompetenciaTooltipId, setOpenCompetenciaTooltipId] = useState<string | null>(null);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [semestreNumero]);

  useEffect(() => {
    setOpenCompetenciaTooltipId(null);
  }, [semestreNumero]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenCompetenciaTooltipId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const nivelOptions = useMemo(
    () =>
      NIVELES_COMPROMISO.map((nivel) => ({
        label: nivel.label,
        value: nivel.value,
      })),
    [],
  );

  return (
    <section ref={sectionRef} className="surface-card scroll-mt-28 rounded-lg p-6 md:p-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Semestre {semestreNumero}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Selecciona cómo aplica cada competencia específica al curso: Introduce, Refuerza, Afianza o No aplica.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getNucleoVariant(nucleo)}>{getNucleoLabel(nucleo)}</Badge>
          <span className="rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
            {semestreNumero} de {totalSemestres}
          </span>
          
        </div>
      </div>

      {!nucleo ? (
        <div className="rounded-lg border border-[var(--color-warning)] bg-[var(--color-surface-soft)] p-5 text-sm leading-6 text-[var(--color-gray-3)]">
          Este semestre está pendiente por clasificar. Vuelve al paso de núcleos y selecciona una clasificación antes de mapear competencias específicas.
        </div>
      ) : cursos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-gray-5)] bg-[var(--color-surface-soft)] p-8 text-center">
          <p className="text-sm text-[var(--color-gray-3)]">
            No hay cursos cargados para este semestre en ASIS/mock.
          </p>
        </div>
      ) : competencias.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--color-gray-5)] bg-[var(--color-surface-soft)] p-8 text-center">
          <p className="text-sm text-[var(--color-gray-3)]">
            No hay competencias específicas activas para este programa y plan de estudios. Revisa el módulo Competencias y RA.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border-2 border-[var(--color-gray-5)] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="bg-[var(--color-surface-soft)] text-xs text-[var(--color-gray-4)]">
                  <th className="sticky left-0 z-10 w-[260px] border-b border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-5 py-3 text-left font-medium">
                    Curso
                  </th>

                  {competencias.map((competencia, index) => {
                    const displayName = getCompetenciaDisplayName(competencia, index);
                    const isOpen = openCompetenciaTooltipId === competencia.id;

                    return (
                      <th
                        key={competencia.id}
                        className="w-[220px] border-b border-[var(--color-gray-6)] px-3 py-3 text-center font-medium align-top"
                      >
                        <CompetenciaHeaderTooltip
                          competencia={competencia}
                          displayName={displayName}
                          isOpen={isOpen}
                          onOpen={() => setOpenCompetenciaTooltipId(competencia.id)}
                          onToggle={() =>
                            setOpenCompetenciaTooltipId((currentId) =>
                              currentId === competencia.id ? null : competencia.id,
                            )
                          }
                          onClose={() => setOpenCompetenciaTooltipId(null)}
                        />
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {cursos.map((curso) => (
                  <tr key={curso.id}>
                    <td className="sticky left-0 z-10 border-b border-[var(--color-gray-6)] bg-white px-5 py-4 align-top">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-[var(--color-gray-1)]">
                          {curso.nombre}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--color-gray-4)]">
                          {curso.codigo} · {curso.creditos} créditos · {curso.docente ?? "Sin docente"}
                        </p>
                      </div>
                    </td>

                    {competencias.map((competencia) => {
                      const key = getMappingKey(curso.id, competencia.id);
                      const nivel = nivelesDraft[key] ?? "";

                      return (
                        <td
                          key={`${curso.id}-${competencia.id}`}
                          className="border-b border-[var(--color-gray-6)] px-3 py-4 align-top text-center"
                        >
                          <Select
                            value={nivel || "no-aplica"}
                            options={nivelOptions}
                            disabled={disabled || !nucleo}
                            onChange={(event) =>
                              onNivelChange(
                                curso.id,
                                competencia.id,
                                event.target.value as NivelCompromiso | "",
                              )
                            }
                          />

                          <div className="mt-2 flex justify-center">
                            <Badge variant={getNivelVariant(nivel || null)}>{getNivelShort(nivel || null)}</Badge>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-1 justify-end gap-2">
        <Button
            variant={isConfirmed ? "outline" : "primary"}
            size="sm"
            onClick={onConfirm}
            disabled={disabled || !isConfirmReady}
          >
            {isConfirmed ? "Semestre confirmado" : "Confirmar semestre"}
          </Button>
      </div>
    </section>
  );
}
