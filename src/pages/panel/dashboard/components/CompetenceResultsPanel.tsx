import { useEffect, useMemo, useState } from "react";
import { GoChevronDown, GoChevronRight, GoDownload, GoEye, GoFile } from "react-icons/go";
import { Table, type TableColumn } from "../../../../components/ui";
import type { EnrichedRaResult } from "../dashboard.types";

interface CompetenceResultsPanelProps {
  results: EnrichedRaResult[];
  onDownloadFile: (fileName: string) => void;
  onOpenRaDetail: (result: EnrichedRaResult) => void;
}

interface CompetenceGroup {
  id: string;
  code: string;
  name: string;
  compliance: number;
  results: EnrichedRaResult[];
  raGroups: RaGroup[];
}

interface RaGroup {
  id: string;
  code: string;
  name: string;
  compliance: number;
  results: EnrichedRaResult[];
}

function getAverageCompliance(results: EnrichedRaResult[]) {
  if (results.length === 0) return 0;
  return Math.round(results.reduce((total, result) => total + result.compliance, 0) / results.length);
}

function groupByCompetence(results: EnrichedRaResult[]): CompetenceGroup[] {
  const competenceMap = new Map<string, EnrichedRaResult[]>();

  results.forEach((result) => {
    const current = competenceMap.get(result.competenceId) ?? [];
    current.push(result);
    competenceMap.set(result.competenceId, current);
  });

  return Array.from(competenceMap.entries()).map(([competenceId, competenceResults]) => {
    const firstResult = competenceResults[0];
    const raMap = new Map<string, EnrichedRaResult[]>();

    competenceResults.forEach((result) => {
      const current = raMap.get(result.raId) ?? [];
      current.push(result);
      raMap.set(result.raId, current);
    });

    const raGroups = Array.from(raMap.entries()).map(([raId, raResults]) => {
      const firstRaResult = raResults[0];

      return {
        id: raId,
        code: firstRaResult.raCode,
        name: firstRaResult.raName,
        compliance: getAverageCompliance(raResults),
        results: raResults,
      };
    });

    return {
      id: competenceId,
      code: firstResult.competenceCode,
      name: firstResult.competenceName,
      compliance: getAverageCompliance(competenceResults),
      results: competenceResults,
      raGroups,
    };
  });
}

function CompetencePie({ group, index }: { group: CompetenceGroup; index: number }) {
  const firstRa = group.raGroups[0];
  const secondRa = group.raGroups[1];
  const firstValue = firstRa?.compliance ?? group.compliance;
  const secondValue = secondRa?.compliance ?? Math.max(100 - firstValue, 0);
  const normalizedFirstValue = Math.max(Math.min(firstValue, 100), 0);
  const firstColor = index % 2 === 0 ? "var(--color-info)" : "var(--color-warning)";
  const secondColor = index % 2 === 0 ? "var(--color-primary)" : "var(--color-gray-5)";

  return (
    <article className="flex min-w-[260px] flex-1 flex-col items-center gap-4">
      <h3 className="text-center font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
        Competencia {index + 1}: {group.compliance}%
      </h3>

      <div className="flex items-center justify-center gap-6">
        <div
          className="relative h-36 w-36 rounded-full shadow-inner"
          style={{
            background: `conic-gradient(${firstColor} 0 ${normalizedFirstValue}%, ${secondColor} ${normalizedFirstValue}% 100%)`,
          }}
          aria-label={`${group.name}, ${group.compliance}% de cumplimiento`}
        >
          <span className="absolute left-[20%] top-[42%] rounded bg-[var(--color-secondary-4)] px-2 py-1 text-xs font-semibold text-white">
            {firstValue}%
          </span>
          <span className="absolute right-[18%] top-[52%] rounded bg-[var(--color-secondary-4)] px-2 py-1 text-xs font-semibold text-white">
            {secondValue}%
          </span>
        </div>

        <div className="space-y-3 text-sm text-[var(--color-gray-2)]">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: firstColor }} />
            <span>{firstRa?.code ?? "RA 01"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: secondColor }} />
            <span>{secondRa?.code ?? "RA 02"}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function RaResultsTable({
  results,
  onDownloadFile,
  onOpenRaDetail,
}: {
  results: EnrichedRaResult[];
  onDownloadFile: (fileName: string) => void;
  onOpenRaDetail: (result: EnrichedRaResult) => void;
}) {
  const columns: TableColumn<EnrichedRaResult>[] = [
    {
      key: "code",
      title: "Código",
      render: (result) => result.courseCode,
      className: "w-[12%] text-center",
      headerClassName: "w-[12%] text-center",
    },
    {
      key: "course",
      title: "Curso",
      render: (result) => result.courseName,
      className: "w-[22%]",
      headerClassName: "w-[22%]",
    },
    {
      key: "teacher",
      title: "Docente titular",
      render: (result) => result.teacherName,
      className: "w-[20%]",
      headerClassName: "w-[20%]",
    },
    {
      key: "compliance",
      title: "Cumplimiento",
      render: (result) => `${result.compliance}%`,
      className: "w-[13%] text-center",
      headerClassName: "w-[13%] text-center",
    },
    {
      key: "improvement",
      title: "Plan de mejora",
      render: (result) => (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => result.improvementPlanFile && onDownloadFile(result.improvementPlanFile)}
            disabled={!result.improvementPlanFile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-secondary-4)] transition-colors hover:bg-[var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-40"
            title={
              result.improvementPlanFile
                ? "Descargar plan de mejora"
                : "El plan de mejora solo aplica si el cumplimiento es menor al 70%."
            }
          >
            <GoFile className="text-lg" />
          </button>
        </div>
      ),
      className: "w-[13%] text-center",
      headerClassName: "w-[13%] text-center",
    },
    {
      key: "evidence",
      title: "Evidencias",
      render: (result) => (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onDownloadFile(result.evidenceFile)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-secondary-4)] transition-colors hover:bg-[var(--color-surface-soft)]"
            title="Descargar evidencias"
          >
            <GoDownload className="text-lg" />
          </button>
        </div>
      ),
      className: "w-[10%] text-center",
      headerClassName: "w-[10%] text-center",
    },
    {
      key: "detail",
      title: "Detalle",
      render: (result) => (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onOpenRaDetail(result)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-secondary-4)] transition-colors hover:bg-[var(--color-surface-soft)]"
            title="Ver detalle informativo del RA"
          >
            <GoEye className="text-lg" />
          </button>
        </div>
      ),
      className: "w-[10%] text-center",
      headerClassName: "w-[10%] text-center",
    },
  ];

  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--color-gray-6)] bg-white">
      <Table
        columns={columns}
        data={results}
        rowKey={(result) => result.key}
        emptyMessage="No hay cursos asociados a este RA."
      />
    </div>
  );
}

export default function CompetenceResultsPanel({
  results,
  onDownloadFile,
  onOpenRaDetail,
}: CompetenceResultsPanelProps) {
  const groups = useMemo(() => groupByCompetence(results), [results]);
  const [expandedCompetenceIds, setExpandedCompetenceIds] = useState<string[]>(() =>
    groups[0] ? [groups[0].id] : [],
  );

  useEffect(() => {
    setExpandedCompetenceIds((current) => {
      if (groups.length === 0) return [];
      const validIds = new Set(groups.map((group) => group.id));
      const next = current.filter((id) => validIds.has(id));
      return next.length > 0 ? next : [groups[0].id];
    });
  }, [groups]);

  const toggleCompetence = (competenceId: string) => {
    setExpandedCompetenceIds((current) =>
      current.includes(competenceId)
        ? current.filter((id) => id !== competenceId)
        : [...current, competenceId],
    );
  };

  if (groups.length === 0) {
    return (
      <section className="surface-card rounded-[24px] p-6 text-center text-sm text-[var(--color-gray-3)]">
        No hay resultados de medición para el ciclo seleccionado.
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="surface-card rounded-[24px] p-6">
        <div className="flex flex-wrap justify-center gap-10">
          {groups.map((group, index) => (
            <CompetencePie key={group.id} group={group} index={index} />
          ))}
        </div>
      </div>

      <div className="surface-card rounded-[24px] p-6">
        <div className="space-y-5">
          {groups.map((group) => {
            const expanded = expandedCompetenceIds.includes(group.id);

            return (
              <article
                key={group.id}
                className="rounded-[22px] border border-[var(--color-gray-5)] bg-white p-5"
              >
                <button
                  type="button"
                  onClick={() => toggleCompetence(group.id)}
                  className="flex w-full flex-col gap-3 text-left md:flex-row md:items-center md:justify-between"
                >
                  <span className="flex items-center gap-3">
                    {expanded ? (
                      <GoChevronDown className="text-2xl text-[var(--color-secondary-4)]" />
                    ) : (
                      <GoChevronRight className="text-2xl text-[var(--color-secondary-4)]" />
                    )}
                    <span className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                      {group.name}
                    </span>
                  </span>

                  <span className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[var(--color-secondary-4)]">
                    <span>Porcentaje de cumplimiento: {group.compliance}%</span>
                    <span className="border-l border-[var(--color-gray-5)] pl-4 text-[var(--color-gray-4)]">
                      {group.raGroups.length} RA&apos;s
                    </span>
                  </span>
                </button>

                {expanded ? (
                  <div className="mt-6 space-y-5 pl-0 md:pl-10">
                    {group.raGroups.map((raGroup) => (
                      <article
                        key={raGroup.id}
                        className="rounded-[22px] border border-[var(--color-gray-5)] bg-white p-5"
                      >
                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                              {raGroup.code}
                            </h3>
                            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                              {raGroup.name}
                            </p>
                          </div>

                          <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
                            Porcentaje de cumplimiento: {raGroup.compliance}%
                          </p>
                        </div>

                        <RaResultsTable
                          results={raGroup.results}
                          onDownloadFile={onDownloadFile}
                          onOpenRaDetail={onOpenRaDetail}
                        />
                      </article>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
