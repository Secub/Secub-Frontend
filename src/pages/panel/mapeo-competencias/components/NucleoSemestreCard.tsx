import { Badge, Button } from "../../../../components/ui";
import type { CursoAsis, NucleoFormacion } from "../MapeoCompetencias.types";
import { getNucleoLabel, getNucleoVariant } from "../MapeoCompetencias.utils";

interface NucleoSemestreCardProps {
  semestreNumero: number;
  cursos: CursoAsis[];
  selectedNucleo: NucleoFormacion | null;
  disabled?: boolean;
  onSelectNucleo: (nucleo: NucleoFormacion) => void;
}

const NUCLEO_OPTIONS: NucleoFormacion[] = [
  "fundamentacion",
  "profesionalizacion",
  "sintesis",
];

export default function NucleoSemestreCard({
  semestreNumero,
  cursos,
  selectedNucleo,
  disabled = false,
  onSelectNucleo,
}: NucleoSemestreCardProps) {
  const coursePreview = cursos
    .slice(0, 2)
    .map((curso) => curso.nombre)
    .join(" · ");

  return (
    <article className="w-full overflow-hidden rounded-lg border-2 border-[var(--color-gray-5)] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="border-b border-[var(--color-gray-6)] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h4 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
              Semestre {semestreNumero}
            </h4>
            <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
              {coursePreview || "Sin cursos cargados en ASIS/mock"}
              {cursos.length > 2 ? ` · +${cursos.length - 2}` : ""}
            </p>
          </div>

          <Badge
            variant={getNucleoVariant(selectedNucleo)}
            className="max-w-full shrink-0 overflow-hidden text-ellipsis"
            title={getNucleoLabel(selectedNucleo)}
          >
            {getNucleoLabel(selectedNucleo)}
          </Badge>
        </div>
      </div>

      <div className="px-5 py-5 md:px-6 md:py-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gray-4)]">
          Clasificar como:
        </p>

        <div className="mt-3 flex flex-wrap gap-3">
          {NUCLEO_OPTIONS.map((nucleo) => (
            <Button
              key={nucleo}
              variant={selectedNucleo === nucleo ? "primary" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => onSelectNucleo(nucleo)}
              className="min-w-[150px] flex-1"
            >
              {getNucleoLabel(nucleo)}
            </Button>
          ))}
        </div>
      </div>
    </article>
  );
}
