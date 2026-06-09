import { useEffect, useMemo, useRef } from "react";
import { Badge, Select } from "../../../../components/ui";
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
  onNivelChange: (cursoId: string, competenciaId: string, nivel: NivelCompromiso | "") => void;
}

export default function MapeoCompetenciasSemesterStep({
  semestreNumero,
  totalSemestres,
  nucleo,
  cursos,
  competencias,
  nivelesDraft,
  disabled = false,
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

  return (
    <section ref={sectionRef} className="surface-card scroll-mt-28 rounded-lg p-6 md:p-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            Semestre {semestreNumero}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            Asigna competencias a opciones: Introduce, Refuerza, Afianza o No aplica.
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
          Este semestre está pendiente por clasificar. Vuelve al paso de núcleos y selecciona una clasificación antes de mapear competencias.
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
            No hay competencias activas para este programa y plan de estudios. Revisa el módulo Competencias y RA.
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

                  {competencias.map((competencia, index) => (
                    <th
                      key={competencia.id}
                      className="w-[180px] border-b border-[var(--color-gray-6)] px-3 py-3 text-center font-medium"
                      title={competencia.descripcion}
                    >
                      {getCompetenciaDisplayName(competencia, index)}
                    </th>
                  ))}
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
                      const nivel = nivelesDraft[key] ?? "no-aplica";

                      return (
                        <td
                          key={`${curso.id}-${competencia.id}`}
                          className="border-b border-[var(--color-gray-6)] px-3 py-4 align-top text-center"
                        >
                          <Select
                            value={nivel}
                            options={nivelOptions}
                            placeholder="No aplica"
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
                            <Badge variant={getNivelVariant(nivel)}>{getNivelShort(nivel) || "NA"}</Badge>
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
    </section>
  );
}
