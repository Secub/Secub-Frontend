import { GoInfo } from "react-icons/go";
import { Badge } from "../../../../components/ui";

interface MapeoCompetenciasCardInfoNucleosProps {
  title?: string;
}

const nucleosInfo = [
  {
    title: "Fundamentación",
    eyebrow: "Núcleo fundamentación",
    description:
      "Aborda lo genérico del campo de formación donde se sitúa la disciplina. Trabaja conceptos, métodos de aproximación al objeto de estudio y potencia capacidades para la lectura, la indagación, el razonamiento y la comunicación oral y escrita.",
    tone: "border-[color:rgba(160,195,255,0.65)] bg-[color:rgba(160,195,255,0.18)]",
  },
  {
    title: "Profesionalización",
    eyebrow: "Núcleo profesionalización",
    description:
      "Se refiere a la estructura conceptual requerida para la formación del profesional en su disciplina o profesión.",
    tone: "border-[color:rgba(14,101,217,0.24)] bg-[color:rgba(14,101,217,0.08)]",
  },
  {
    title: "Síntesis",
    eyebrow: "Núcleo síntesis",
    description:
      "Trabaja la contextualización, la síntesis y la aplicación del conocimiento para verificar la relación teoría-práctica, la conexión con el medio profesional y el aporte a la comunidad.",
    tone: "border-[color:rgba(118,202,102,0.45)] bg-[color:rgba(118,202,102,0.12)]",
  },
] as const;

export default function MapeoCompetenciasCardInfoNucleos({
  title = "Indicaciones de Núcleos de Formación",
}: MapeoCompetenciasCardInfoNucleosProps) {
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
                {title}
              </h2>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Consulta la descripción de cada núcleo antes de validar el mapeo por semestre.
              </p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-[var(--color-gray-3)]">
            Usa estas indicaciones como guía informativa para clasificar cada semestre según la etapa de formación que corresponde dentro del plan de estudios.
          </p>
        </div>

        <div className="shrink-0">
          <Badge variant="info" className="px-4 py-2">
            3 núcleos
          </Badge>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {nucleosInfo.map((nucleo) => (
          <article
            key={nucleo.title}
            className={`rounded-2xl border p-4 ${nucleo.tone}`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
              {nucleo.eyebrow}
            </p>
            <h3 className="mt-2 font-heading text-base font-semibold text-[var(--color-secondary-4)]">
              {nucleo.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)]">
              {nucleo.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
