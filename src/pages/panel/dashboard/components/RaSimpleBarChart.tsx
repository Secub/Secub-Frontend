import { TARGET_RA_PERCENTAGE } from "../dashboard-ra.mock";
import type { RaResultSummary } from "../dashboard-ra.types";

interface RaSimpleBarChartProps {
  results: RaResultSummary[];
}

export default function RaSimpleBarChart({ results }: RaSimpleBarChartProps) {
  const maxStudents = Math.max(...results.map((item) => item.totalStudents), 1);

  if (results.length === 0) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5 text-sm text-[var(--color-gray-3)]">
        Aún no hay resultados estadísticos para graficar.
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-[var(--color-gray-6)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
            Gráfico estadístico por RA
          </h3>
          <p className="mt-1 text-sm text-[var(--color-gray-3)]">
            Eje X: Resultado de Aprendizaje · Eje Y: estudiantes aprobados y no aprobados.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-surface-soft)] px-4 py-2 text-xs font-semibold text-[var(--color-gray-3)]">
          Target {TARGET_RA_PERCENTAGE}%
        </span>
      </div>

      <div className="grid min-h-[260px] gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {results.map((result) => {
          const approvedHeight = Math.max((result.approvedStudents / maxStudents) * 180, 8);
          const notApprovedHeight = Math.max((result.notApprovedStudents / maxStudents) * 180, 8);

          return (
            <div key={result.id} className="flex flex-col justify-end rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] p-4">
              <div className="flex h-[190px] items-end justify-center gap-3 border-b border-[var(--color-gray-6)] pb-3">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-gray-4)]">
                    {result.approvedStudents}
                  </span>
                  <span
                    className="w-8 rounded-t-xl bg-[var(--color-success)]"
                    style={{ height: `${approvedHeight}px` }}
                    title="Estudiantes aprobados"
                  />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--color-gray-4)]">
                    {result.notApprovedStudents}
                  </span>
                  <span
                    className="w-8 rounded-t-xl bg-[var(--color-error)]"
                    style={{ height: `${notApprovedHeight}px` }}
                    title="Estudiantes no aprobados"
                  />
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
                  {result.raCode}
                </p>
                <p className="mt-1 text-xs text-[var(--color-gray-4)]">
                  {result.fulfillment}% cumplimiento
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[var(--color-gray-4)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--color-success)]" /> Aprobados
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--color-error)]" /> No aprobados
        </span>
      </div>
    </div>
  );
}
