import { Badge } from "../../../../components/ui";
import type { CompetenciaRaDemoRecord, CursoAsis, PlanEstudio, ProgramaAcademico } from "../MapeoCompetencias.types";

interface MapeoCompetenciasCreateHeaderProps {
  selectedPrograma?: ProgramaAcademico;
  selectedPlan?: PlanEstudio;
  totalSemestres: number;
  cursos: CursoAsis[];
  competencias: CompetenciaRaDemoRecord[];
  canManage: boolean;
  disabledReason: string;
}

export default function MapeoCompetenciasCreateHeader({
  selectedPrograma,
  selectedPlan,
  totalSemestres,
  cursos,
  competencias,
  canManage,
  disabledReason,
}: MapeoCompetenciasCreateHeaderProps) {
  return (
    <section className="surface-card p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary-1)]">
            Programa y plan seleccionados
          </p>
          <h2 className="mt-1 font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
            {selectedPrograma?.nombre ?? "Sin programa"}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            {selectedPlan?.nombre ?? "Sin plan"} · {totalSemestres} semestre(s) · {cursos.length} curso(s) ASIS/mock · {competencias.length} competencia(s)
          </p>
        </div>

        <Badge variant={canManage ? "success" : "warning"}>{canManage ? "Edición habilitada" : "Solo consulta"}</Badge>
      </div>

      {!canManage ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]">
          {disabledReason}
        </div>
      ) : null}

      {cursos.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]">
          No hay cursos cargados para este plan en ASIS/mock. Puedes clasificar los semestres, pero no finalizar el mapeo I-R-A-NA hasta tener cursos.
        </div>
      ) : null}

      {competencias.length === 0 ? (
        <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm leading-6 text-[var(--color-gray-3)]">
          No hay competencias creadas para este programa y plan de estudios. Revisa el módulo Competencias y RA.
        </div>
      ) : null}
    </section>
  );
}
