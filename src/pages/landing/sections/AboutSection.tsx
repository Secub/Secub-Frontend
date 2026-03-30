import SectionIntro from "./SectionIntro";

export default function AboutSection() {
  return (
    <section id="acerca" className="section-space">
      <div className="container-secub">
        <SectionIntro
          eyebrow="¿Qué es SECUB?"
          title="Una plataforma para organizar, evaluar y dar seguimiento a los procesos académicos"
          description="SECUB centraliza la gestión de perfil de egreso, propósito de formación, competencias, resultados de aprendizaje, mapeo curricular y medición, permitiendo una visión clara y estructurada de los procesos formativos."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <article className="rounded-[28px] border border-[var(--color-gray-6)] bg-white p-8">
            <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              Gestión estructurada
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-gray-3)]">
              Organiza la información académica bajo una lógica clara de módulos,
              flujos y etapas del proceso institucional.
            </p>
          </article>

          <article className="rounded-[28px] border border-[var(--color-gray-6)] bg-white p-8">
            <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              Seguimiento continuo
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-gray-3)]">
              Ayuda a visualizar avances, estados y pendientes para mantener un
              control permanente sobre la implementación y evaluación.
            </p>
          </article>

          <article className="rounded-[28px] border border-[var(--color-gray-6)] bg-white p-8">
            <h3 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              Soporte a la calidad
            </h3>
            <p className="mt-4 text-base leading-7 text-[var(--color-gray-3)]">
              Facilita la articulación entre planeación, seguimiento y medición de
              resultados para fortalecer los procesos de aseguramiento de la calidad.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}