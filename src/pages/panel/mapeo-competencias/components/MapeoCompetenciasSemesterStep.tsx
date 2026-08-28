import { useEffect, useMemo, useRef } from "react";
import { Badge, Button, InfoModalTrigger, Select, Table, type TableColumn } from "../../../../components/ui";
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

function getCompetenciaDescription(competencia: CompetenciaRaDemoRecord) {
  const description = competencia.descripcion?.trim();
  const name = competencia.nombre?.trim();

  if (description) return description;
  if (name) return name;
  return "Esta competencia específica no tiene una descripción registrada todavía.";
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

  useEffect(() => {
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [semestreNumero]);

  const nivelOptions = useMemo(
    () =>
      NIVELES_COMPROMISO.map((nivel) => ({
        label: nivel.label,
        value: nivel.value,
      })),
    [],
  );
  const columns: TableColumn<CursoAsis>[] = [
    {
      key: "course",
      title: "Curso",
      render: (curso) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-[var(--color-gray-1)]">{curso.nombre}</p>
          <p className="mt-0.5 text-xs text-[var(--color-gray-4)]">
            {curso.codigo} · {curso.creditos} créditos · {curso.docente ?? "Sin docente"}
          </p>
        </div>
      ),
      sortValue: (curso) => curso.nombre,
      searchValue: (curso) => `${curso.nombre} ${curso.codigo} ${curso.docente ?? ""}`,
      className: "sticky left-0 z-[1] w-[260px] bg-[var(--secub-surface)]",
      headerClassName: "sticky left-0 z-10 w-[260px] bg-[var(--color-surface-soft)]",
    },
    ...competencias.map<TableColumn<CursoAsis>>((competencia, index) => {
      const displayName = getCompetenciaDisplayName(competencia, index);
      return {
        key: competencia.id,
        title: (
          <span className="inline-flex items-center justify-center gap-1.5">
            <span className="line-clamp-2 text-center leading-4">{displayName}</span>
            <InfoModalTrigger
              title={`Descripción de ${displayName}`}
              content={<p>{getCompetenciaDescription(competencia)}</p>}
              ariaLabel={`Ver descripción de ${displayName}`}
            />
          </span>
        ),
        sortable: false,
        className: "w-[220px] text-center",
        headerClassName: "w-[220px] text-center",
        render: (curso) => {
          const key = getMappingKey(curso.id, competencia.id);
          const nivel = nivelesDraft[key] ?? "";
          return (
            <div>
              <Select
                value={nivel || "no-aplica"}
                options={nivelOptions}
                disabled={disabled || !nucleo}
                onChange={(event) =>
                  onNivelChange(curso.id, competencia.id, event.target.value as NivelCompromiso | "")
                }
              />
              <div className="mt-2 flex justify-center">
                <Badge variant={getNivelVariant(nivel || null)}>{getNivelShort(nivel || null)}</Badge>
              </div>
            </div>
          );
        },
      };
    }),
  ];

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
          <span className="rounded-full border border-[var(--color-gray-6)] bg-[var(--secub-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
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
        <Table
          columns={columns}
          data={cursos}
          rowKey={(curso) => curso.id}
          minWidth={900}
          searchPlaceholder="Buscar curso por nombre, código o docente…"
          emptyMessage="No hay cursos cargados para este semestre."
        />
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
