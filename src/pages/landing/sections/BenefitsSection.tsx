import SectionIntro from "./SectionIntro";

const benefits = [
  {
    title: "Trazabilidad académica",
    description:
      "Permite seguir el estado de los procesos, visualizar avances y mantener una lectura clara de cada etapa del flujo académico.",
  },
  {
    title: "Organización por roles",
    description:
      "La plataforma habilita acciones según el tipo de usuario, facilitando una experiencia más ordenada y alineada con cada responsabilidad.",
  },
  {
    title: "Apoyo a la calidad",
    description:
      "Centraliza información clave para la toma de decisiones y fortalece el seguimiento de los procesos asociados al aseguramiento de la calidad.",
  },
];

function BenefitCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[28px] border border-[var(--color-gray-6)] bg-white p-8">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] font-heading text-lg font-semibold text-white">
        ✓
      </div>

      <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
        {title}
      </h3>

      <p className="mt-4 text-base leading-7 text-[var(--color-gray-3)]">
        {description}
      </p>
    </article>
  );
}

export default function BenefitsSection() {
  return (
    <section id="beneficios" className="section-space">
      <div className="container-secub">
        <SectionIntro
          eyebrow="Beneficios"
          title="Una plataforma pensada para hacer más claro el proceso"
          description="SECUB permite que la información académica se gestione de forma ordenada y útil para el seguimiento institucional."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <BenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}