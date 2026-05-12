import { useMemo, useState } from "react";
import { GoDownload, GoEye, GoFile, GoGraph } from "react-icons/go";
import { Button, Select, Table, type SelectOption, type TableColumn } from "../../../../components/ui";
import type { EnrichedCourse, EnrichedRaResult } from "../dashboard.types";

interface ResultsMeasurementPanelProps {
  results: EnrichedRaResult[];
  courses: EnrichedCourse[];
  selectedCourseId: string;
  selectedCompetenceId: string;
  onCourseChange: (courseId: string) => void;
  onCompetenceChange: (competenceId: string) => void;
  onDownloadFile: (fileName: string) => void;
  onOpenRaDetail: (result: EnrichedRaResult) => void;
}

function toCourseOptions(courses: EnrichedCourse[]): SelectOption[] {
  return courses.map((course) => ({ label: course.name, value: course.id }));
}

function toCompetenceOptions(results: EnrichedRaResult[]): SelectOption[] {
  const options = new Map<string, SelectOption>();

  results.forEach((result) => {
    if (!options.has(result.competenceId)) {
      options.set(result.competenceId, {
        label: `${result.competenceCode}: ${result.competenceName}`,
        value: result.competenceId,
      });
    }
  });

  return Array.from(options.values());
}

function MiniRaChart({
  result,
  onOpenRaDetail,
}: {
  result: EnrichedRaResult;
  onOpenRaDetail: (result: EnrichedRaResult) => void;
}) {
  const approved = Math.max(Math.min(result.compliance, 100), 0);
  const notApproved = Math.max(100 - approved, 0);

  return (
    <article className="min-w-[260px] flex-1">
      <h4 className="text-center font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
        Resultado de Aprendizaje
      </h4>

      <div className="mt-5 h-[150px] border-l border-b border-[var(--color-gray-6)] px-4">
        <div className="flex h-full items-end justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[110px] w-8 items-end rounded-t-md bg-[var(--color-gray-7)]">
              <span
                className="block w-full rounded-t-md bg-[var(--color-success)]"
                style={{ height: `${approved}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--color-gray-4)]">Aprobó</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-[110px] w-8 items-end rounded-t-md bg-[var(--color-gray-7)]">
              <span
                className="block w-full rounded-t-md bg-[var(--color-error)]"
                style={{ height: `${notApproved}%` }}
              />
            </div>
            <span className="text-[10px] text-[var(--color-gray-4)]">No aprobó</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-start justify-center gap-3 text-xs">
        <button
          type="button"
          className="font-heading font-semibold text-[var(--color-secondary-4)] underline-offset-2 hover:underline"
          onClick={() => onOpenRaDetail(result)}
          title={result.raName}
        >
          {result.raCode}
        </button>
        <span className="max-w-[120px] text-[var(--color-error)]">
          Aprobación: {result.compliance}% (target: 70%)
        </span>
      </div>
    </article>
  );
}

function ResultsCharts({
  results,
  onOpenRaDetail,
}: {
  results: EnrichedRaResult[];
  onOpenRaDetail: (result: EnrichedRaResult) => void;
}) {
  return (
    <section className="surface-card rounded-[24px] p-6">
      <div className="mb-6 flex items-center justify-center gap-3">
        <GoGraph className="text-xl text-[var(--color-secondary-1)]" />
        <h2 className="text-center font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
          Gráficos de Resultados por RA
        </h2>
      </div>

      {results.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-6 text-center text-sm text-[var(--color-gray-3)]">
          No hay resultados para los filtros seleccionados.
        </div>
      ) : (
        <div className="flex flex-wrap gap-8">
          {results.slice(0, 3).map((result) => (
            <MiniRaChart key={result.key} result={result} onOpenRaDetail={onOpenRaDetail} />
          ))}
        </div>
      )}
    </section>
  );
}

function EvidencePanel({
  results,
  onDownloadFile,
}: {
  results: EnrichedRaResult[];
  onDownloadFile: (fileName: string) => void;
}) {
  return (
    <article className="surface-card rounded-[24px] p-6">
      <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">Evidencia</h2>
      <p className="mt-4 text-sm text-[var(--color-gray-3)]">
        Seleccione la evidencia que desea descargar
      </p>

      <div className="mt-5 flex flex-col items-start gap-3">
        {results.length === 0 ? (
          <p className="text-sm text-[var(--color-gray-4)]">No hay evidencias disponibles.</p>
        ) : (
          results.slice(0, 4).map((result) => (
            <Button
              key={`${result.key}-evidence`}
              variant="outline"
              size="sm"
              leftIcon={<GoFile className="text-base" />}
              rightIcon={<GoDownload className="text-base" />}
              onClick={() => onDownloadFile(result.evidenceFile)}
            >
              {result.evidenceFile}
            </Button>
          ))
        )}
      </div>
    </article>
  );
}

function ImprovementPlanPanel({ result }: { result?: EnrichedRaResult }) {
  return (
    <article className="surface-card rounded-[24px] p-6">
      <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">Plan de Mejora</h2>

      <div className="mt-5 space-y-5">
        <div>
          <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
            1. Análisis de los resultados obtenidos
          </p>
          <div className="mt-3 rounded-xl bg-[var(--color-gray-7)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
            {result?.improvementPlanSummary ??
              "El cumplimiento del RA se mantiene sobre el target institucional. No se requiere plan de mejora para este resultado."}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
            2. Acciones propuestas para próximas mediciones
          </p>
          <div className="mt-3 rounded-xl bg-[var(--color-gray-7)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
            {result?.reachedTarget
              ? "Mantener la estrategia actual de evaluación y seguimiento de evidencias."
              : "Fortalecer actividades prácticas, retroalimentación y seguimiento previo a la próxima medición del ciclo."}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ResultsMeasurementPanel({
  results,
  courses,
  selectedCourseId,
  selectedCompetenceId,
  onCourseChange,
  onCompetenceChange,
  onDownloadFile,
  onOpenRaDetail,
}: ResultsMeasurementPanelProps) {
  const [supportResultKey, setSupportResultKey] = useState("");
  const courseOptions = toCourseOptions(courses);
  const allCompetenceOptions = toCompetenceOptions(results);

  const filteredResults = useMemo(() => {
    return results.filter((result) => {
      if (selectedCourseId && result.courseId !== selectedCourseId) return false;
      if (selectedCompetenceId && result.competenceId !== selectedCompetenceId) return false;
      return true;
    });
  }, [results, selectedCompetenceId, selectedCourseId]);

  const supportResult =
    filteredResults.find((result) => result.key === supportResultKey) ??
    filteredResults.find((result) => !result.reachedTarget) ??
    filteredResults[0];

  const columns: TableColumn<EnrichedRaResult>[] = [
    {
      key: "course",
      title: "Nombre Curso",
      render: (result) => (
        <p className="font-heading font-semibold text-[var(--color-secondary-4)]">{result.courseName}</p>
      ),
    },
    {
      key: "ra",
      title: "RA",
      render: (result) => (
        <button
          type="button"
          className="inline-flex items-center gap-2 font-heading font-semibold text-[var(--color-secondary-4)] underline-offset-2 hover:underline"
          onClick={() => {
            setSupportResultKey(result.key);
            onOpenRaDetail(result);
          }}
        >
          <GoEye className="text-base" />
          {result.raCode}
        </button>
      ),
    },
    {
      key: "compliance",
      title: "Cumplimiento",
      render: (result) => `${result.compliance}%`,
      className: "text-center",
      headerClassName: "text-center",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Select
          placeholder="Todas las competencias"
          value={selectedCompetenceId}
          options={allCompetenceOptions}
          onChange={(event) => onCompetenceChange(event.target.value)}
        />

        <Select
          placeholder="Todos los cursos"
          value={selectedCourseId}
          options={courseOptions}
          onChange={(event) => onCourseChange(event.target.value)}
        />
      </div>

      <ResultsCharts results={filteredResults} onOpenRaDetail={onOpenRaDetail} />

      <Table
        columns={columns}
        data={filteredResults}
        rowKey={(result) => result.key}
        emptyMessage="No hay resultados de medición para mostrar."
      />

      <div className="grid gap-5 xl:grid-cols-2">
        <EvidencePanel results={filteredResults} onDownloadFile={onDownloadFile} />
        <ImprovementPlanPanel result={supportResult} />
      </div>
    </section>
  );
}
