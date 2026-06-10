interface MapeoCompetenciasCardInfoCompromisoProps {
  title?: string;
}

export default function MapeoCompetenciasCardInfoCompromiso({
  title = "Indicaciones de Niveles de Compromiso",
}: MapeoCompetenciasCardInfoCompromisoProps) {
  return (
    <section className="w-full overflow-hidden rounded-xl border border-[var(--color-gray-6)] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6 md:p-8">
        <h2 className="font-heading text-lg font-bold text-[var(--color-secondary-4)]">
          {title}
        </h2>

        <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-[var(--color-gray-2)]">
          <p>
            <strong className="font-semibold uppercase">Introduce (I): </strong>
            el curso introduce la competencia al estudiante. Se presentan conceptos fundamentales y se inicia la familiarización con la competencia.
          </p>
          <p>
            <strong className="font-semibold uppercase">Refuerza (R): </strong>
            el curso refuerza una competencia previamente introducida. Se profundizan conceptos, se amplían habilidades y se consolida el conocimiento mediante aplicaciones más complejas.
          </p>
          <p>
            <strong className="font-semibold uppercase">Afianza (A): </strong>
            el curso afianza la competencia. El estudiante demuestra mayor dominio, integración y aplicación en contextos académicos o profesionales.
          </p>
          <p>
            <strong className="font-semibold uppercase">No aplica (NA): </strong>
            el curso no aborda ni contribuye al desarrollo de esa competencia en particular.
          </p>
        </div>
      </div>
    </section>
  );
}
