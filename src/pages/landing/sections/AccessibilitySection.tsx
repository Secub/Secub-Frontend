import { GoChecklist, GoEye, GoGoal, GoInfo } from "react-icons/go";

const accessibilityOptions = [
  {
    title: "Contraste visual",
    description: "Preparado para activar modo de alto contraste cuando se conecte la preferencia institucional.",
    icon: <GoEye className="text-2xl" />,
  },
  {
    title: "Tamaño de texto",
    description: "Preparado para aumentar o reducir la lectura sin romper la estructura de la landing.",
    icon: <GoChecklist className="text-2xl" />,
  },
  {
    title: "Navegación clara",
    description: "La landing conserva enlaces descriptivos, foco visible del navegador y estructura semántica por secciones.",
    icon: <GoGoal className="text-2xl" />,
  },
];

export default function AccessibilitySection() {
  return (
    <section id="accesibilidad" className="section-space bg-[var(--color-surface-soft)]">
      <div className="container-secub">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-heading text-sm font-semibold text-[var(--color-secondary-4)] shadow-[var(--shadow-sm)]">
            <GoInfo className="text-lg text-[var(--color-secondary-1)]" />
            Accesibilidad
          </span>

          <h2 className="font-heading text-3xl font-semibold leading-[1.2] text-[var(--color-secondary-4)] md:text-4xl">
            Opciones de accesibilidad preparadas para RF10
          </h2>

          <p className="mt-5 text-base leading-8 text-[var(--color-gray-3)] md:text-lg">
            SECUB deja preparada la experiencia para incorporar preferencias de contraste, lectura y navegación accesible sin cambiar el diseño base de la landing.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {accessibilityOptions.map((option) => (
            <article key={option.title} className="rounded-[28px] border border-[var(--color-gray-6)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
                {option.icon}
              </div>
              <h3 className="mt-5 font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                {option.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-gray-3)]">
                {option.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
