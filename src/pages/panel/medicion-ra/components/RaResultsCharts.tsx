import { GoAlert, GoCheckCircle, GoGraph } from "react-icons/go";
import { Badge } from "../../../../components/ui";
import type { RaResultSummary } from "../medicion-ra.types";

interface RaResultsChartsProps {
  results: RaResultSummary[];
  activeCompetenceCode: string;
}

const levelBarClass: Record<string, string> = {
  sobresaliente: "bg-[var(--color-success)]",
  satisfactorio: "bg-[var(--color-info)]",
  "en-desarrollo": "bg-[var(--color-warning)]",
  deficiente: "bg-[var(--color-error)]",
};

export default function RaResultsCharts({
  results,
  activeCompetenceCode,
}: RaResultsChartsProps) {
  return (
    <section className="surface-card p-6">
      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(14,101,217,0.10)] text-[var(--color-secondary-1)]">
            <GoGraph className="text-xl" />
          </span>

          <div>
            <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Resultado de Aprendizaje
            </h2>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Gráfico porcentual de los RA asociados a la competencia{" "}
              <strong>{activeCompetenceCode}</strong>.
            </p>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="rounded-[22px] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-6 text-sm text-[var(--color-gray-3)]">
          Esta competencia no tiene Resultados de Aprendizaje mapeados.
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {results.map((result) => (
            <article
              key={result.raId}
              className="rounded-[22px] border border-[var(--color-gray-6)] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-gray-4)]">
                    {result.competenceCode} · {result.raCode}
                  </p>

                  <h3 className="mt-2 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                    {result.raTitle}
                  </h3>
                </div>

                <span
                  className={[
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                    result.reachedTarget
                      ? "bg-[color:rgba(118,202,102,0.16)] text-[var(--color-success)]"
                      : "bg-[color:rgba(235,87,87,0.10)] text-[var(--color-error)]",
                  ].join(" ")}
                >
                  {result.reachedTarget ? (
                    <GoCheckCircle className="text-xl" />
                  ) : (
                    <GoAlert className="text-xl" />
                  )}
                </span>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--color-gray-4)]">
                  <span>Aprobación</span>
                  <span>Target {result.targetPercentage}%</span>
                </div>

                <div className="relative h-4 overflow-hidden rounded-full bg-[var(--color-gray-7)]">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-secondary-1)]"
                    style={{ width: `${result.approvalPercentage}%` }}
                  />

                  <div
                    className="absolute inset-y-[-4px] w-0.5 bg-[var(--color-error)]"
                    style={{ left: `${result.targetPercentage}%` }}
                    title={`Target ${result.targetPercentage}%`}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
                      {result.approvalPercentage}%
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-gray-4)]">
                      {result.achievedCount} de {result.totalStudents}{" "}
                      estudiantes en desarrollo o superior.
                    </p>
                  </div>

                  <Badge variant={result.reachedTarget ? "success" : "danger"}>
                    {result.reachedTarget ? "Alcanzado" : "No alcanzado"}
                  </Badge>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {result.levelCounts.map((item) => (
                  <div key={item.level}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-gray-4)]">
                      <span>{item.label}</span>
                      <span>
                        {item.count} · {item.percentage}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-gray-7)]">
                      <div
                        className={`h-full rounded-full ${levelBarClass[item.level]}`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}