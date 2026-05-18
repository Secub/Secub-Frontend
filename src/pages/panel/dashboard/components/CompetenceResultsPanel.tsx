import { useEffect, useMemo, useState } from "react";
import { GoChevronDown, GoChevronRight, GoDownload, GoEye, GoFile } from "react-icons/go";
import { Button, Table, type TableColumn } from "../../../../components/ui";
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

interface CompetenceSupportGroup {
  id: string;
  courseName: string;
  instrumentDescription?: string;
  evidenceFile?: string;
  improvementPlanFile?: string;
  improvementPlanSummary?: string;
}

function getAverageCompliance(results: EnrichedRaResult[]) {
  const measuredResults = results.filter((result) => result.hasMeasurement);
  if (measuredResults.length === 0) return 0;
  return Math.round(measuredResults.reduce((total, result) => total + result.compliance, 0) / measuredResults.length);
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
    const measuredRaGroups = raGroups.filter((raGroup) =>
      raGroup.results.some((result) => result.hasMeasurement),
    );
    const competenceCompliance = measuredRaGroups.length
      ? Math.round(
          measuredRaGroups.reduce((total, raGroup) => total + raGroup.compliance, 0) /
            measuredRaGroups.length,
        )
      : 0;

    return {
      id: competenceId,
      code: firstResult.competenceCode,
      name: firstResult.competenceName,
      compliance: competenceCompliance,
      results: competenceResults,
      raGroups,
    };
  });
}

function clampPercentage(value: number) {
  return Math.max(0, Math.min(100, value));
}

function isAvailableSupportFile(fileName?: string) {
  const value = String(fileName ?? "").trim();
  if (!value) return false;

  const normalized = value.toLowerCase();
  return !normalized.startsWith("sin ") && !normalized.includes("pendiente de repositorio");
}

function buildCompetenceSupportGroups(results: EnrichedRaResult[]): CompetenceSupportGroup[] {
  const groups = new Map<string, CompetenceSupportGroup>();

  results
    .filter((result) => result.hasMeasurement)
    .forEach((result) => {
      const id = `${result.courseId}-${result.competenceId}`;
      const current = groups.get(id) ?? {
        id,
        courseName: result.courseName,
      };

      if (result.instrumentDescription) {
        const nextDescription = `${result.raCode}: ${result.instrumentDescription}`;
        current.instrumentDescription = current.instrumentDescription
          ? current.instrumentDescription.includes(nextDescription)
            ? current.instrumentDescription
            : `${current.instrumentDescription}\n${nextDescription}`
          : nextDescription;
      }

      if (!current.evidenceFile && isAvailableSupportFile(result.evidenceFile)) {
        current.evidenceFile = result.evidenceFile;
      }

      if (!current.improvementPlanFile && isAvailableSupportFile(result.improvementPlanFile)) {
        current.improvementPlanFile = result.improvementPlanFile;
      }

      if (!current.improvementPlanSummary && result.improvementPlanSummary) {
        current.improvementPlanSummary = result.improvementPlanSummary;
      }

      groups.set(id, current);
    });

  return Array.from(groups.values());
}

function CompetencePie({ group, index }: { group: CompetenceGroup; index: number }) {
  const measuredRaGroups = group.raGroups.filter((raGroup) =>
    raGroup.results.some((result) => result.hasMeasurement),
  );
  const hasMeasurements = measuredRaGroups.length > 0;
  const compliance = clampPercentage(group.compliance);
  const gap = 100 - compliance;

  return (
    <article className="flex min-w-[260px] flex-1 flex-col items-center gap-4">
      <h3 className="text-center font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
        Competencia {index + 1}: {hasMeasurements ? `${compliance}%` : "sin medición"}
      </h3>

      <div className="flex items-center justify-center gap-6">
        <div
          className="relative flex h-36 w-36 items-center justify-center rounded-full shadow-inner"
          style={{
            background: hasMeasurements
              ? `conic-gradient(var(--color-success) 0 ${compliance}%, var(--color-gray-6) ${compliance}% 100%)`
              : "var(--color-surface-soft)",
          }}
          aria-label={
            hasMeasurements
              ? `${group.name}, ${compliance}% de cumplimiento y ${gap}% de brecha`
              : `${group.name}, sin datos suficientes para graficar`
          }
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-center font-heading text-lg font-semibold text-[var(--color-secondary-4)] shadow-sm">
            {hasMeasurements ? `${compliance}%` : "—"}
          </span>
        </div>

        <div className="space-y-3 text-sm text-[var(--color-gray-2)]">
          {hasMeasurements ? (
            <>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-sm bg-[var(--color-success)]" />
                <span>Cumplimiento: {compliance}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-sm bg-[var(--color-gray-6)]" />
                <span>Brecha: {gap}%</span>
              </div>
              <p className="text-xs text-[var(--color-gray-4)]">Meta mínima: 70%</p>
            </>
          ) : (
            <p className="max-w-[180px] text-xs leading-5 text-[var(--color-gray-4)]">
              No hay RA finalizados para graficar esta competencia.
            </p>
          )}
        </div>
      </div>

      <div className="w-full max-w-xs space-y-2 text-xs text-[var(--color-gray-3)]">
        {group.raGroups.map((raGroup) => {
          const measured = raGroup.results.some((result) => result.hasMeasurement);

          return (
            <div key={raGroup.id} className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-3 py-2">
              <span className="font-semibold text-[var(--color-secondary-4)]">{raGroup.code}</span>
              <span>{measured ? `${clampPercentage(raGroup.compliance)}%` : "Pendiente"}</span>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function RaResultsTable({
  results,
  onOpenRaDetail,
}: {
  results: EnrichedRaResult[];
  onOpenRaDetail: (result: EnrichedRaResult) => void;
}) {
  const columns: TableColumn<EnrichedRaResult>[] = [
    {
      key: "code",
      title: "Código",
      render: (result) => result.courseCode,
      className: "w-[15%] text-center",
      headerClassName: "w-[15%] text-center",
    },
    {
      key: "course",
      title: "Curso",
      render: (result) => result.courseName,
      className: "w-[30%]",
      headerClassName: "w-[30%]",
    },
    {
      key: "teacher",
      title: "Docente titular",
      render: (result) => result.teacherName,
      className: "w-[25%]",
      headerClassName: "w-[25%]",
    },
    {
      key: "status",
      title: "Estado",
      render: (result) => (result.hasMeasurement ? "Finalizado" : "Pendiente"),
      className: "w-[12%] text-center",
      headerClassName: "w-[12%] text-center",
    },
    {
      key: "compliance",
      title: "Cumplimiento",
      render: (result) => (result.hasMeasurement ? `${result.compliance}%` : "—"),
      className: "w-[12%] text-center",
      headerClassName: "w-[12%] text-center",
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
      className: "w-[6%] text-center",
      headerClassName: "w-[6%] text-center",
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

function CompetenceSupportFiles({
  results,
  onDownloadFile,
}: {
  results: EnrichedRaResult[];
  onDownloadFile: (fileName: string) => void;
}) {
  const supportGroups = useMemo(() => buildCompetenceSupportGroups(results), [results]);

  return (
    <section className="rounded-[22px] border border-[var(--color-gray-5)] bg-[var(--color-surface-soft)] p-5">
      <div>
        <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
          Soportes de la competencia
        </h3>
        <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
          Los RA se listan de forma individual, pero los archivos se muestran agrupados por competencia para evitar repeticiones.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {supportGroups.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-gray-6)] bg-white p-4 text-sm text-[var(--color-gray-4)]">
            No hay soportes registrados para esta competencia.
          </p>
        ) : (
          supportGroups.map((group) => (
            <article key={group.id} className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-4">
              <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
                Curso: {group.courseName}
              </p>

              <div className="mt-3 flex flex-col items-start gap-3">
                {group.instrumentDescription ? (
                  <div className="w-full rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm leading-6 text-[var(--color-gray-3)]">
                    <strong className="text-[var(--color-secondary-4)]">Instrumento de evaluación por RA:</strong>
                    <pre className="mt-1 whitespace-pre-wrap font-sans text-sm leading-6 text-[var(--color-gray-3)]">
                      {group.instrumentDescription}
                    </pre>
                  </div>
                ) : (
                  <span className="text-sm text-[var(--color-gray-4)]">Sin descripción de instrumento registrada.</span>
                )}

                {group.evidenceFile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<GoFile className="text-base" />}
                    rightIcon={<GoDownload className="text-base" />}
                    onClick={() => onDownloadFile(group.evidenceFile ?? "")}
                  >
                    Evidencia · {group.evidenceFile}
                  </Button>
                ) : (
                  <span className="text-sm text-[var(--color-gray-4)]">Sin evidencia registrada.</span>
                )}

                {group.improvementPlanFile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<GoFile className="text-base" />}
                    rightIcon={<GoDownload className="text-base" />}
                    onClick={() => onDownloadFile(group.improvementPlanFile ?? "")}
                    title={group.improvementPlanSummary}
                  >
                    Plan de mejora · {group.improvementPlanFile}
                  </Button>
                ) : group.improvementPlanSummary ? (
                  <p className="rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] px-3 py-2 text-sm leading-6 text-[var(--color-gray-3)]">
                    <strong>Plan de mejora:</strong> {group.improvementPlanSummary}
                  </p>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
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
                            {raGroup.results.some((result) => result.hasMeasurement)
                              ? `Porcentaje de cumplimiento: ${raGroup.compliance}%`
                              : "Estado: Pendiente de medición"}
                          </p>
                        </div>

                        <RaResultsTable
                          results={raGroup.results}
                          onOpenRaDetail={onOpenRaDetail}
                        />
                      </article>
                    ))}

                    <CompetenceSupportFiles
                      results={group.results}
                      onDownloadFile={onDownloadFile}
                    />
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
