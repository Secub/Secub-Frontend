import { Badge } from "../../../../components/ui";
import type { MapeoCompetenciasEnriched, SemestreResumen } from "../MapeoCompetencias.types";
import {
  getNivelShort,
  getNivelVariant,
  getNucleoLabel,
  getNucleoVariant,
  getSemestreEstadoLabel,
  getSemestreEstadoVariant,
} from "../MapeoCompetencias.utils";

interface MapeoCompetenciasSemestreResumenCardProps {
  record: MapeoCompetenciasEnriched;
  semestre: SemestreResumen;
}

export default function MapeoCompetenciasSemestreResumenCard({
  record,
  semestre,
}: MapeoCompetenciasSemestreResumenCardProps) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
            Semestre {semestre.semestreNumero}
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            {record.programaNombre} · {record.planNombre}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={getNucleoVariant(semestre.nucleo)}>
            {getNucleoLabel(semestre.nucleo)}
          </Badge>
          <Badge variant={getSemestreEstadoVariant(semestre.estado)}>
            {getSemestreEstadoLabel(semestre.estado)}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">Cursos</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-secondary-4)]">{semestre.cursos.length}</p>
        </div>
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">Asignaciones</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-secondary-4)]">
            {semestre.totalAsignadas}/{semestre.totalCeldas}
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">Competencias</p>
          <p className="mt-1 text-lg font-semibold text-[var(--color-secondary-4)]">
            {new Set(semestre.niveles.map((nivel) => nivel.competenciaId)).size}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {semestre.cursos.length === 0 ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-3 text-sm text-[var(--color-gray-3)]">
            {semestre.nucleo
              ? "Semestre clasificado sin cursos cargados en ASIS/mock. No queda marcado como en progreso."
              : "No hay cursos cargados para este semestre en ASIS/mock."}
          </p>
        ) : semestre.niveles.length === 0 ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] p-3 text-sm text-[var(--color-gray-3)]">
            Este semestre aún no tiene niveles de compromiso guardados.
          </p>
        ) : (
          semestre.cursos.map((curso) => {
            const nivelesCurso = semestre.niveles.filter((nivel) => nivel.cursoId === curso.id);

            return (
              <div key={curso.id} className="rounded-[var(--radius-md)] border border-[var(--color-gray-6)] p-3">
                <p className="font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                  {curso.codigo} · {curso.nombre}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {nivelesCurso.length ? (
                    nivelesCurso.map((nivel) => (
                      <Badge key={`${curso.id}-${nivel.competenciaId}`} variant={getNivelVariant(nivel.nivelCompromiso)}>
                        {nivel.competenciaNombre}: {getNivelShort(nivel.nivelCompromiso)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="neutral">Sin niveles</Badge>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
