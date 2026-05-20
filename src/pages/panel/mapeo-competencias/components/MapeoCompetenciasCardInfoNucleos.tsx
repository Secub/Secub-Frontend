interface MapeoCompetenciasCardInfoNucleosProps {
  title?: string;
}

export default function MapeoCompetenciasCardInfoNucleos({
  title = "Indicaciones de Núcleos de Formación",
}: MapeoCompetenciasCardInfoNucleosProps) {
  return (
    <section className="w-full overflow-hidden rounded-xl border border-[var(--color-gray-6)] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-6 md:p-8">
        <h2 className="font-heading text-lg font-bold text-[var(--color-secondary-4)]">
          {title}
        </h2>

        <div className="mt-4 flex flex-col gap-3 text-sm leading-6 text-[var(--color-gray-2)]">
          <p>
            <strong className="font-semibold uppercase">Núcleo Fundamentación: </strong>
            aborda lo genérico del campo de formación donde se sitúa la disciplina. Trabaja conceptos, métodos de aproximación al objeto de estudio y potencia capacidades para la lectura, la indagación, el razonamiento y la comunicación oral y escrita.
          </p>
          <p>
            <strong className="font-semibold uppercase">Núcleo Profesionalización: </strong>
            se refiere a la estructura conceptual requerida para la formación del profesional en su disciplina o profesión.
          </p>
          <p>
            <strong className="font-semibold uppercase">Núcleo Síntesis: </strong>
            trabaja la contextualización, la síntesis y la aplicación del conocimiento para verificar la relación teoría-práctica, la conexión con el medio profesional y el aporte a la comunidad.
          </p>
        </div>
      </div>
    </section>
  );
}
