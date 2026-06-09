interface MapeoCompetenciasAccessStateProps {
  title: string;
  description: string;
}

export default function MapeoCompetenciasAccessState({
  title,
  description,
}: MapeoCompetenciasAccessStateProps) {
  return (
    <section className="surface-card p-8 text-center">
      <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
        {description}
      </p>
    </section>
  );
}
