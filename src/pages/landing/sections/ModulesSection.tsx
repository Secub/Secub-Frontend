import SectionIntro from "./SectionIntro";

import PerfilEgresoImg from "../../../assets/modulos/perfil-egreso.png";
import PropositoFormacionImg from "../../../assets/modulos/proposito-formacion.png";
import CompetenciasResultadosImg from "../../../assets/modulos/competencias-resultados.png";
import MapeoCurricularImg from "../../../assets/modulos/mapeo-curricular.png";

const services = [
  {
    step: "01",
    title: "Gestión de perfil de egreso",
    description:
      "Proceso institucional mediante el cual la universidad define, actualiza, implementa y evalúa las competencias, conocimientos, actitudes y valores que debe tener un estudiante al terminar su programa académico.",
    image: PerfilEgresoImg,
    alt: "Gestión de perfil de egreso",
  },
  {
    step: "02",
    title: "Propósito de formación",
    description:
      "Declara de forma clara para qué se forma un profesional en un programa académico y cuál es el perfil profesional que se busca desarrollar.",
    image: PropositoFormacionImg,
    alt: "Propósito de formación",
  },
  {
    step: "03",
    title: "Competencias y resultados de aprendizaje",
    description:
      "Organiza la estructura pedagógica del programa, conectando competencias y resultados de aprendizaje con el plan de estudios.",
    image: CompetenciasResultadosImg,
    alt: "Competencias y resultados de aprendizaje",
  },
  {
    step: "04",
    title: "Mapeo curricular y medición",
    description:
      "Relaciona competencias y resultados con las asignaturas del plan de estudios y permite recoger evidencias para medir el logro de los aprendizajes.",
    image: MapeoCurricularImg,
    alt: "Mapeo curricular y medición",
  },
];

function ServiceCard({
  step,
  title,
  description,
  image,
  alt,
}: {
  step: string;
  title: string;
  description: string;
  image: string;
  alt: string;
}) {
  return (
    <article className="w-full rounded-[24px] border border-[var(--color-gray-6)] bg-white p-4 shadow-[0_18px_50px_rgba(24,34,51,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(24,34,51,0.12)] md:p-5">
      <div className="mb-5">
        <img
          src={image}
          alt={alt}
          className="mx-auto block h-auto w-40 lg:w-36 xl:w-40"
        />
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="font-heading text-xs font-semibold tracking-[0.16em] text-[var(--color-primary)] sm:text-sm">
          MODULO {step}
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-primary)] font-heading text-base font-semibold text-white">
          {step}
        </div>
      </div>

      <h3 className="font-heading text-xl font-semibold leading-snug text-[var(--color-secondary-4)] xl:text-[22px]">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-[var(--color-gray-3)] xl:text-[15px]">
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

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.step} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}