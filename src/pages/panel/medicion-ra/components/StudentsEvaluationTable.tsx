import { SecubIcon } from "../../../../components/ui/SecubIcon";
import { useMemo, useState, type ChangeEvent } from "react";
import { IconButton, Modal, Table, type TableColumn } from "../../../../components/ui";
import { performanceLevels } from "../medicion-ra.mock";
import { getLevelLabel } from "../medicion-ra.utils";
import type {
  Competence,
  EvaluationMatrix,
  LearningResult,
  PerformanceLevel,
  Student,
} from "../medicion-ra.types";

import { ActionIcon } from "../../../../components/ui/ActionIcon";

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
  const columns: TableColumn<Student>[] = [
    {
      key: "name",
      title: "Estudiante",
      render: (student) => (
        <div>
          <p className="font-semibold text-[var(--color-secondary-4)]">{student.name}</p>
          <p className="mt-1 text-xs text-[var(--color-gray-4)]">{student.email}</p>
        </div>
      ),
      sortValue: (student) => student.name,
      searchValue: (student) => `${student.name} ${student.email}`,
      className: "sticky left-0 z-[1] w-[280px] bg-white",
      headerClassName: "sticky left-0 z-10 w-[280px] bg-[var(--color-surface-soft)]",
    },
    {
      key: "code",
      title: "Código",
      render: (student) => student.code,
      sortValue: (student) => student.code,
      searchValue: (student) => student.code,
      className: "w-[170px]",
      headerClassName: "w-[170px]",
    },
    ...activeCompetence.learningResults.map<TableColumn<Student>>((ra) => ({
      key: ra.id,
      title: (
        <span className="inline-flex items-center gap-2">
          <span>{ra.code} · {ra.title}</span>
          <IconButton
            icon={<ActionIcon name="info" />}
            label={`Ver descripción de ${ra.code}`}
            title={`Ver descripción de ${ra.code}`}
            variant="primary_soft"
            size="sm"
            onClick={() => setSelectedRa(ra)}
          />
        </span>
      ),
      sortable: false,
      sortValue: (student) => evaluations[student.id]?.[ra.id] ?? "",
      searchValue: (student) => evaluations[student.id]?.[ra.id] ?? "",
      className: "min-w-[220px]",
      headerClassName: "min-w-[220px]",
      render: (student) => {
        const selectedLevel = evaluations[student.id]?.[ra.id] ?? "";
        const hasLevelError = showValidationErrors && !selectedLevel;
        const errorId = `evaluation-${student.id}-${ra.id}-error`;

        return (
          <div title={disabled ? lockedTooltip : undefined}>
            <select
              value={selectedLevel}
              disabled={disabled}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                onLevelChange(student.id, ra.id, event.target.value as PerformanceLevel)
              }
              aria-label={`Nivel de ${student.name} para ${ra.code}`}
              aria-invalid={hasLevelError ? "true" : undefined}
              aria-describedby={hasLevelError ? errorId : undefined}
              data-validation-field={`evaluation-${student.id}-${ra.id}`}
              className={[
                "w-full rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-[color:rgba(14,101,217,0.16)] disabled:cursor-not-allowed disabled:appearance-none disabled:pr-3",
                selectTone[selectedLevel],
                hasLevelError ? "border-[var(--color-error)] ring-4 ring-[color:rgba(235,87,87,0.14)]" : "",
              ].join(" ")}
            >
              <option value="">Nivel de desempeño</option>
              {performanceLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
            {hasLevelError ? (
              <p id={errorId} role="alert" className="mt-1 text-xs text-[var(--color-error)]">
                Selecciona un nivel obligatorio.
              </p>
            ) : selectedLevel ? (
              <p className="mt-1 text-xs text-[var(--color-gray-4)]">{getLevelLabel(selectedLevel)}</p>
            ) : null}
          </div>
        );
      },
    })),
  ];

  return (
    <section className="surface-card overflow-hidden">
      <div className="border-b border-[var(--color-gray-6)] p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(248,129,29,0.12)] text-[var(--color-primary)]">
                <SecubIcon name="people" weight="fill" className="text-xl" />
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

      <Table
        columns={columns}
        data={students}
        rowKey={(student) => student.id}
        ariaLabel="Tabla de evaluación de estudiantes por RA"
        searchPlaceholder="Buscar estudiante por nombre, correo o código…"
        emptyMessage="No hay estudiantes para evaluar."
        minWidth={980}
        initialRowsPerPage={5}
      />

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
