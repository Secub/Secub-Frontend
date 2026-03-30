type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export default function SectionIntro({
  eyebrow,
  title,
  description,
}: SectionIntroProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="mb-4 inline-flex rounded-full bg-[var(--color-secondary-2)] px-4 py-1.5 font-heading text-sm font-semibold text-[var(--color-secondary-4)]">
        {eyebrow}
      </span>

      <h2 className="font-heading text-3xl font-semibold leading-[1.2] text-[var(--color-secondary-4)] md:text-4xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-[var(--color-gray-3)] md:text-lg">
        {description}
      </p>
    </div>
  );
}