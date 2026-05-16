import { Badge, Button } from "../../../../components/ui";
import type { NucleoType } from "../hooks/useNucleosManager";
import type { ProgramaAcademicoCurso } from "../MapeoCompetencias.types";

interface NucleoSemestreCardProps {
  semestreNumero: number;
  planNombre: string;
  cursos: ProgramaAcademicoCurso[];
  selectedNucleo: NucleoType | null;
  disabled?: boolean;
  onSelectNucleo: (nucleo: NucleoType) => void;
}

function getNucleoBadgeVariant(nucleo: NucleoType | null) {
  if (nucleo === "fundamentacion") return "info";
  if (nucleo === "profesionalizacion") return "warning";
  if (nucleo === "sintesis") return "success";
  return "neutral";
}

function getNucleoLabel(nucleo: NucleoType) {
  const labels: Record<NucleoType, string> = {
    fundamentacion: "Fundamentación",
    profesionalizacion: "Profesionalización",
    sintesis: "Síntesis",
  };
  return labels[nucleo];
}

export default function NucleoSemestreCard({
  semestreNumero,
  planNombre,
  cursos,
  selectedNucleo,
  disabled = false,
  onSelectNucleo,
}: NucleoSemestreCardProps) {
  const nucleoTypes: NucleoType[] = [
    "fundamentacion",
    "profesionalizacion",
    "sintesis",
  ];

  return (
    <div className="w-full overflow-hidden rounded-lg border-2 border-[var(--color-gray-5)] bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="border-b border-[var(--color-gray-6)] px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
              Semestre {semestreNumero} · {planNombre}
            </h4>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              {cursos
                .slice(0, 2)
                .map((curso) => curso.nombre)
                .join(" · ")}

              {cursos.length > 2
                ? ` · +${cursos.length - 2}`
                : ""}
            </p>
          </div>

          {selectedNucleo && (
            <Badge variant={getNucleoBadgeVariant(selectedNucleo)}>
              {getNucleoLabel(selectedNucleo)}
            </Badge>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-gray-4)]">
            Clasificar como:
          </p>

          <div className="flex flex-wrap gap-3">
            {nucleoTypes.map((nucleoType) => (
              <Button
                key={nucleoType}
                variant={
                  selectedNucleo === nucleoType ? "primary" : "outline"
                }
                size="sm"
                disabled={disabled}
                onClick={() => onSelectNucleo(nucleoType)}
                className="flex-1 min-w-[140px]"
              >
                {getNucleoLabel(nucleoType)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
