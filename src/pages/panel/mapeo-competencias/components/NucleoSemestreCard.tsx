import { useMemo } from "react";
import { Badge, Button } from "../../../../components/ui";
import type { CursoAsis, NucleoFormacion, NucleosDraft } from "../MapeoCompetencias.types";
import { getNucleoLabel, getNucleoVariant } from "../MapeoCompetencias.utils";

interface NucleoSemestreCardProps {
  semestreNumero: number;
  cursos: CursoAsis[];
  selectedNucleo: NucleoFormacion | null;
  allNucleos: NucleosDraft;
  disabled?: boolean;
  onSelectNucleo: (nucleo: NucleoFormacion) => void;
}

const NUCLEO_OPTIONS: NucleoFormacion[] = [
  "fundamentacion",
  "profesionalizacion",
  "sintesis",
];

const NUCLEO_ORDER: Record<NucleoFormacion, number> = {
  fundamentacion: 0,
  profesionalizacion: 1,
  sintesis: 2,
};

export default function NucleoSemestreCard({
  semestreNumero,
  cursos,
  selectedNucleo,
  allNucleos,
  disabled = false,
  onSelectNucleo,
}: NucleoSemestreCardProps) {
  const coursePreview = cursos
    .slice(0, 2)
    .map((curso) => curso.nombre)
    .join(" · ");

  // Highest nucleo index selected in any earlier semester (enforces ascending order)
  const prevMax = useMemo(() => {
    const values = Object.entries(allNucleos)
      .filter(([sem, n]) => Number(sem) < semestreNumero && n != null)
      .map(([, n]) => NUCLEO_ORDER[n!]);
    return values.length > 0 ? Math.max(...values) : -1;
  }, [allNucleos, semestreNumero]);

  // Lowest nucleo index selected in any later semester
  const nextMin = useMemo(() => {
    const values = Object.entries(allNucleos)
      .filter(([sem, n]) => Number(sem) > semestreNumero && n != null)
      .map(([, n]) => NUCLEO_ORDER[n!]);
    return values.length > 0 ? Math.min(...values) : 3;
  }, [allNucleos, semestreNumero]);

  const isOptionDisabled = (nucleo: NucleoFormacion) => {
    if (disabled) return true;
    const idx = NUCLEO_ORDER[nucleo];
    return idx < prevMax || idx > nextMin;
  };

  return (
    <article className="w-full overflow-hidden rounded-lg border-2 border-[var(--color-gray-5)] bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="border-b border-[var(--color-gray-6)] px-5 py-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h4 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
              Semestre {semestreNumero}
            </h4>
            <div>
              <Badge
                variant={getNucleoVariant(selectedNucleo)}
                className="max-w-full shrink-0 overflow-hidden text-ellipsis"
                title={getNucleoLabel(selectedNucleo)}
              >
                {getNucleoLabel(selectedNucleo)}
              </Badge>
            </div>
            <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
              {coursePreview || "Sin cursos cargados en ASIS/mock"}
              {cursos.length > 2 ? ` · +${cursos.length - 2}` : ""}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {NUCLEO_OPTIONS.map((nucleo) => (
              <Button
                key={nucleo}
                variant={selectedNucleo === nucleo ? "primary" : "outline"}
                size="sm"
                disabled={isOptionDisabled(nucleo)}
                onClick={() => onSelectNucleo(nucleo)}
                className="min-w-[150px] flex-1"
              >
                {getNucleoLabel(nucleo)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
