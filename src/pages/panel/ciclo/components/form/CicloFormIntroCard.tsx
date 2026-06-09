import { GoInfo } from "react-icons/go";

export default function CicloFormIntroCard() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
      <div className="flex gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white text-[var(--color-secondary-1)]">
          <GoInfo className="text-xl" />
        </span>
        <div>
          <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
            Cursos disponibles
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
            El listado muestra únicamente cursos del núcleo de Síntesis. El periodo corresponde a la selección de estos cursos durante 1.5 años.
          </p>
        </div>
      </div>
    </div>
  );
}
