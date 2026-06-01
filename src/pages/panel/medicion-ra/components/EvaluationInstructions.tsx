import { GoInfo } from "react-icons/go";
import { Badge } from "../../../../components/ui";
import { performanceLevels, TARGET_PERCENTAGE } from "../medicion-ra.mock";

const toneClasses = {
  success: "border-[color:rgba(118,202,102,0.45)] bg-[color:rgba(118,202,102,0.12)]",
  info: "border-[color:rgba(160,195,255,0.65)] bg-[color:rgba(160,195,255,0.18)]",
  warning: "border-[color:rgba(251,199,86,0.55)] bg-[color:rgba(251,199,86,0.14)]",
  danger: "border-[color:rgba(235,87,87,0.35)] bg-[color:rgba(235,87,87,0.08)]",
} as const;

export default function EvaluationInstructions() {
  return (
    <section className="surface-card p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:rgba(14,101,217,0.10)] text-[var(--color-secondary-1)]">
              <GoInfo className="text-xl" />
            </span>
            <div>
              <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                Indicaciones de evaluación
              </h2>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Selecciona el nivel que mejor refleje el desempeño del estudiante con base en la evidencia disponible.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--color-gray-3)]">
            Para considerar logrado un Resultado de Aprendizaje, se espera que al menos el {TARGET_PERCENTAGE}% del grupo alcance el nivel <strong>En desarrollo</strong> o superior. Cada RA conserva su evaluación individual y su descripción de instrumento o criterio. La evidencia se carga una sola vez al final de la competencia.
          </p>
        </div>

        <div className="shrink-0">
          <Badge variant="info" className="px-4 py-2">
            Target mínimo: {TARGET_PERCENTAGE}%
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {performanceLevels.map((level) => (
          <article
            key={level.value}
            className={`rounded-2xl border p-4 ${toneClasses[level.tone]}`}
          >
            <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
              {level.label}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)]">
              {level.descriptor}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
