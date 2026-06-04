import { useMemo, useState } from "react";
import { GoInfo, GoPeople } from "react-icons/go";
import { Modal } from "../../../../components/ui";
import { performanceLevels } from "../medicion-ra.mock";
import { getLevelLabel } from "../medicion-ra.utils";
import type {
  Competence,
  EvaluationMatrix,
  LearningResult,
  PerformanceLevel,
  Student,
} from "../medicion-ra.types";

interface StudentsEvaluationTableProps {
  activeCompetence: Competence;
  students: Student[];
  evaluations: EvaluationMatrix;
  disabled?: boolean;
  lockedTooltip?: string;
  showValidationErrors?: boolean;
  onLevelChange: (
    studentId: string,
    raId: string,
    level: PerformanceLevel,
  ) => void;
}

const selectTone: Record<string, string> = {
  sobresaliente:
    "border-[color:rgba(118,202,102,0.45)] bg-[color:rgba(118,202,102,0.14)] text-[var(--color-secondary-4)]",
  satisfactorio:
    "border-[color:rgba(160,195,255,0.65)] bg-[color:rgba(160,195,255,0.20)] text-[var(--color-secondary-4)]",
  "en-desarrollo":
    "border-[color:rgba(251,199,86,0.55)] bg-[color:rgba(251,199,86,0.18)] text-[var(--color-secondary-4)]",
  deficiente:
    "border-[color:rgba(235,87,87,0.35)] bg-[color:rgba(235,87,87,0.10)] text-[var(--color-secondary-4)]",
  "": "border-[var(--color-gray-6)] bg-white text-[var(--color-gray-4)]",
};

export default function StudentsEvaluationTable({
  activeCompetence,
  students,
  evaluations,
  disabled = false,
  lockedTooltip,
  showValidationErrors = false,
  onLevelChange,
}: StudentsEvaluationTableProps) {
  const [selectedRa, setSelectedRa] = useState<LearningResult | null>(null);

  const completedCells = useMemo(() => {
    return students.reduce((total, student) => {
      const completedByStudent = activeCompetence.learningResults.filter((ra) =>
        Boolean(evaluations[student.id]?.[ra.id]),
      ).length;

      return total + completedByStudent;
    }, 0);
  }, [activeCompetence.learningResults, evaluations, students]);

  const totalCells = students.length * activeCompetence.learningResults.length;

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-[var(--color-gray-6)] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(248,129,29,0.12)] text-[var(--color-primary)]">
                <GoPeople className="text-xl" />
              </span>
              <div>
                <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  Medición de Resultados de Aprendizaje
                </h2>
                <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                  {activeCompetence.code} · {activeCompetence.title}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-4 py-2 text-sm text-[var(--color-gray-3)]">
            {completedCells}/{totalCells} calificaciones completadas
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="min-w-[980px] w-full border-separate border-spacing-0" aria-label="Tabla de evaluación de estudiantes por RA">
          <thead className="bg-[var(--color-surface-soft)]">
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-[280px] border-b border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-4)]">
                Estudiante
              </th>
              <th scope="col" className="w-[170px] border-b border-[var(--color-gray-6)] px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-4)]">
                Código
              </th>
              {activeCompetence.learningResults.map((ra) => (
                <th
                  key={ra.id}
                  scope="col"
                  className="min-w-[220px] border-b border-[var(--color-gray-6)] px-5 py-4 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-4)]">
                        {ra.code}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[var(--color-secondary-4)]">
                        {ra.title}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRa(ra)}
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--color-gray-6)] bg-white text-[var(--color-secondary-1)] transition-colors hover:bg-[var(--color-surface-soft)]"
                      aria-label={`Ver descripción de ${ra.code}`}
                      title={`Ver descripción de ${ra.code}`}
                    >
                      <GoInfo aria-hidden="true" className="text-lg" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="bg-white">
                <td className="sticky left-0 z-[1] border-b border-[var(--color-gray-6)] bg-white px-5 py-4 align-middle">
                  <p className="font-semibold text-[var(--color-secondary-4)]">
                    {student.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-gray-4)]">
                    {student.email}
                  </p>
                </td>
                <td className="border-b border-[var(--color-gray-6)] px-5 py-4 align-middle text-sm text-[var(--color-gray-3)]">
                  {student.code}
                </td>

                {activeCompetence.learningResults.map((ra) => {
                  const selectedLevel = evaluations[student.id]?.[ra.id] ?? "";
                  const hasLevelError = showValidationErrors && !selectedLevel;
                  const errorId = `evaluation-${student.id}-${ra.id}-error`;

                  return (
                    <td
                      key={ra.id}
                      className="border-b border-[var(--color-gray-6)] px-5 py-4 align-middle"
                      title={disabled ? lockedTooltip : undefined}
                    >
                      <select
                        value={selectedLevel}
                        disabled={disabled}
                        onChange={(event) =>
                          onLevelChange(
                            student.id,
                            ra.id,
                            event.target.value as PerformanceLevel,
                          )
                        }
                        aria-label={`Nivel de ${student.name} para ${ra.code}`}
                        aria-invalid={hasLevelError ? "true" : undefined}
                        aria-describedby={hasLevelError ? errorId : undefined}
                        data-validation-field={`evaluation-${student.id}-${ra.id}`}
                        className={[
                          "w-full rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-[color:rgba(14,101,217,0.16)] disabled:cursor-not-allowed",
                          selectTone[selectedLevel],
                          hasLevelError
                            ? "border-[var(--color-error)] ring-4 ring-[color:rgba(235,87,87,0.14)]"
                            : "",
                        ].join(" ")}
                      >
                        <option value="">Nivel de desempeño</option>
                        {performanceLevels.map((level) => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>

                      {hasLevelError ? (
                        <p id={errorId} role="alert" className="mt-1 text-xs text-[var(--color-error)]">
                          Selecciona un nivel obligatorio.
                        </p>
                      ) : selectedLevel ? (
                        <p className="mt-1 text-xs text-[var(--color-gray-4)]">
                          {getLevelLabel(selectedLevel)}
                        </p>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(selectedRa)}
        title={selectedRa ? `${selectedRa.code} · ${selectedRa.title}` : ""}
        description="Contenido descriptivo completo del Resultado de Aprendizaje."
        size="md"
        onClose={() => setSelectedRa(null)}
      >
        <p className="text-sm leading-7 text-[var(--color-gray-3)]">
          {selectedRa?.description}
        </p>
      </Modal>
    </section>
  );
}
