import { useMemo } from "react";
import { Badge } from "../../../../components/ui";
import { FlowActionBar } from "../../../../components/panel";
import type { CursoAsis, NucleoFormacion, NucleosDraft } from "../MapeoCompetencias.types";
import { buildSemesterNumbers } from "../MapeoCompetencias.utils";
import NucleoSemestreCard from "./NucleoSemestreCard";

interface NucleosManagerProps {
  value: NucleosDraft;
  disabled?: boolean;
  totalSemestres: number;
  coursesBySemester: Record<number, CursoAsis[]>;
  programaNombre?: string;
  classificationComplete: boolean;
  onChange: (semestreNumero: number, nucleo: NucleoFormacion | null) => void;
  onSave: () => void;
  onContinue: () => void;
}

export default function NucleosManager({
  value,
  disabled = false,
  totalSemestres,
  coursesBySemester,
  programaNombre = "Programa académico",
  classificationComplete,
  onChange,
  onSave,
  onContinue,
}: NucleosManagerProps) {
  const semesters = useMemo(() => buildSemesterNumbers(totalSemestres), [totalSemestres]);

  const nucleosSummary = useMemo(() => {
    return semesters.reduce(
      (summary, semester) => {
        const nucleo = value[semester];
        if (nucleo) summary[nucleo] += 1;
        return summary;
      },
      { fundamentacion: 0, profesionalizacion: 0, sintesis: 0 } as Record<NucleoFormacion, number>,
    );
  }, [semesters, value]);

  const evaluatedCount = semesters.filter((semester) => Boolean(value[semester])).length;
  const completionPercentage = totalSemestres > 0 ? Math.round((evaluatedCount / totalSemestres) * 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      <section className="surface-card rounded-lg p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              {programaNombre}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Progreso: {completionPercentage}% · {evaluatedCount} de {totalSemestres} semestres clasificados
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="info">F: {nucleosSummary.fundamentacion}</Badge>
            <Badge variant="accent">P: {nucleosSummary.profesionalizacion}</Badge>
            <Badge variant="success">S: {nucleosSummary.sintesis}</Badge>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
              Progreso general
            </span>
            <span className="text-sm font-semibold text-[var(--color-secondary-1)]">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-gray-6)]">
            <div
              className="h-full bg-[var(--color-secondary-1)] transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </section>

      {classificationComplete ? (
        <div className="rounded-lg border-l-4 border-[var(--color-success)] bg-[var(--color-surface-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-success)]">
            ✓ Clasificación de núcleos completada. Puedes continuar al mapeo de niveles de compromiso.
          </p>
        </div>
      ) : null}

      {evaluatedCount === totalSemestres && (nucleosSummary.fundamentacion === 0 || nucleosSummary.profesionalizacion === 0 || nucleosSummary.sintesis === 0) && (
        <div className="rounded-lg border-l-4 border-[var(--color-warning)] bg-[var(--color-surface-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-warning)]">
            Todos los semestres deben cubrir los tres núcleos: Fundamentación, Profesionalización y Síntesis. Ajusta la clasificación antes de continuar.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {semesters.map((semester) => (
          <NucleoSemestreCard
            key={semester}
            semestreNumero={semester}
            cursos={coursesBySemester[semester] ?? []}
            selectedNucleo={value[semester] ?? null}
            allNucleos={value}
            disabled={disabled}
            onSelectNucleo={(nucleo) => onChange(semester, nucleo)}
          />
        ))}
      </div>

      <FlowActionBar
        description="Guardar permite conservar avances parciales. Para continuar, cada semestre debe tener un núcleo asignado."
        showSaveProgress
        onSaveProgress={onSave}
        saveDisabled={disabled}
        showNext
        nextLabel={classificationComplete ? "Siguiente paso" : "Completar semestres"}
        onNext={onContinue}
        nextDisabled={disabled || !classificationComplete}
      />
    </div>
  );
}
