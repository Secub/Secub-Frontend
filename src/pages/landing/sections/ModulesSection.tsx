import SectionIntro from "./SectionIntro";

const services = [
  {
    step: "01",
    title: "Gestión de perfil de egreso",
    description:
      "Proceso institucional mediante el cual la universidad define, actualiza, implementa y evalúa las competencias, conocimientos, actitudes y valores que debe tener un estudiante al terminar su programa académico.",
  },
  {
    step: "02",
    title: "Propósito de formación",
    description:
      "Declara de forma clara para qué se forma un profesional en un programa académico y cuál es el perfil profesional que se busca desarrollar.",
  },
  {
    step: "03",
    title: "Competencias y resultados de aprendizaje",
    description:
      "Organiza la estructura pedagógica del programa, conectando competencias y resultados de aprendizaje con el plan de estudios.",
  },
  {
    step: "04",
    title: "Mapeo curricular y medición",
    description:
      "Relaciona competencias y resultados con las asignaturas del plan de estudios y permite recoger evidencias para medir el logro de los aprendizajes.",
  },
];

function ServiceCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[28px] border border-[var(--color-gray-6)] bg-white p-6 shadow-[0_18px_50px_rgba(24,34,51,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(24,34,51,0.12)] md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="font-heading text-sm font-semibold tracking-[0.18em] text-[var(--color-primary)]">
          PASO {step}
        </span>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary)] font-heading text-lg font-semibold text-white">
          {step}
        </div>
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

export default function ModulesSection() {
  return (
    <section
      id="modulos"
      className="section-space border-y border-[var(--color-gray-6)] bg-white"
    >
      <div className="container-secub">
        <SectionIntro
          eyebrow="Módulos principales"
          title="Procesos que acompaña SECUB"
          description="La plataforma reúne los componentes clave del proceso académico para facilitar una gestión más clara, conectada y trazable."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <ServiceCard key={service.step} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}