import { useMemo } from "react";
import { Button, Select } from "../../../../components/ui";
import type {
  ProgramaAcademico,
  MapeoSemesterData,
} from "../MapeoCompetencias.types";
import type { CompetenciaOption } from "../hooks/useMapeoCompetenciasManager";

interface MapeoCompetenciasSemesterStepProps {
  programa: ProgramaAcademico;
  semestresData: MapeoSemesterData[];
  currentSemesterIndex: number;
  semestresMapping: Array<{
    semesterId: string;
    semesterNumber: number;
    competenciaMappings: Array<{
      competenciaId: string;
      option: CompetenciaOption | null;
    }>;
  }>;
  isCompletionLocked: boolean;
  onCompetenciaChange: (
    semesterIndex: number,
    competenciaIndex: number,
    option: CompetenciaOption
  ) => void;
  onNextSemester: () => void;
  onPrevSemester: () => void;
  canAdvance: boolean;
}

const COMPETENCIA_OPTIONS = [
  { value: "introduce", label: "Introduce" },
  { value: "refuerza", label: "Refuerza" },
  { value: "afianza", label: "Afianza" },
  { value: "no-aplica", label: "No Aplica" },
];

export default function MapeoCompetenciasSemesterStep({
  programa,
  semestresData,
  currentSemesterIndex,
  semestresMapping,
  isCompletionLocked,
  onCompetenciaChange,
  onNextSemester,
  onPrevSemester,
  canAdvance,
}: MapeoCompetenciasSemesterStepProps) {
  const currentSemester = useMemo(() => {
    return semestresData[currentSemesterIndex];
  }, [semestresData, currentSemesterIndex]);

  const currentMapping = useMemo(() => {
    return semestresMapping[currentSemesterIndex];
  }, [semestresMapping, currentSemesterIndex]);

  const semestreNumero = useMemo(() => {
    return programa.semestres[currentSemesterIndex]?.numero ?? currentSemesterIndex + 1;
  }, [programa.semestres, currentSemesterIndex]);

  // Agrupar competencias por curso (si aplica)
  const competenciasGroupedByCurso = useMemo(() => {
    if (!currentSemester || !currentMapping) return [];

    return currentMapping.competenciaMappings.map((mapping, idx) => {
      const competencia = currentSemester.competencias.find(
        (c) => c.id === mapping.competenciaId
      );
      return {
        index: idx,
        competencia,
        option: mapping.option,
      };
    });
  }, [currentSemester, currentMapping]);

  const isCurrentSemesterComplete = useMemo(() => {
    return currentMapping?.competenciaMappings.every((m) => m.option !== null) ?? false;
  }, [currentMapping]);

  return (
    <div className="space-y-6">
      {/* Encabezado del semestre */}
      <div className="surface-card rounded-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Semestre {semestreNumero}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Asigna competencias a opciones: Introduce, Refuerza, Afianza o No Aplica
            </p>
          </div>
          <span className="rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
            {currentSemesterIndex + 1} de {semestresData.length}
          </span>
        </div>

        {/* Indicador de progreso del semestre */}
        {isCurrentSemesterComplete && !isCompletionLocked && (
          <div className="rounded-lg border-l-4 border-[var(--color-success)] bg-[var(--color-surface-soft)] p-3">
            <p className="text-sm font-medium text-[var(--color-success)]">
              ✓ Semestre completado. Puedes avanzar al siguiente.
            </p>
          </div>
        )}

        {!isCurrentSemesterComplete && (
          <div className="rounded-lg border-l-4 border-[var(--color-warning)] bg-[var(--color-surface-soft)] p-3">
            <p className="text-sm font-medium text-[var(--color-warning)]">
              ⚠ Completa todas las competencias antes de avanzar.
            </p>
          </div>
        )}
      </div>

      {/* Tabla de competencias */}
      <div className="surface-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-gray-6)] bg-[var(--color-gray-7)]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-gray-3)]">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-gray-3)]">
                  Competencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-gray-3)]">
                  Clasificación
                </th>
              </tr>
            </thead>
            <tbody>
              {competenciasGroupedByCurso.length > 0 ? (
                competenciasGroupedByCurso.map((item) => (
                  <tr
                    key={item.competencia?.id || `comp-${item.index}`}
                    className="border-b border-[var(--color-gray-6)] hover:bg-[var(--color-gray-7)]"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-gray-2)]">
                      {item.index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--color-gray-2)]">
                      <div>
                        <p className="font-medium">{item.competencia?.descripcion}</p>
                        {item.competencia?.resultadosAprendizaje &&
                          item.competencia.resultadosAprendizaje.length > 0 && (
                            <ul className="mt-2 space-y-1 text-xs text-[var(--color-gray-3)]">
                              {item.competencia.resultadosAprendizaje.map((ra) => (
                                <li key={ra.id} className="flex gap-2">
                                  <span className="text-[var(--color-secondary-1)]">•</span>
                                  <span>{ra.descripcion}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        placeholder="Selecciona una opción"
                        value={item.option ?? ""}
                        onChange={(e) => {
                          const value = (e.target as HTMLSelectElement).value;
                          if (value) {
                            onCompetenciaChange(
                              currentSemesterIndex,
                              item.index,
                              value as unknown as CompetenciaOption
                            );
                          }
                        }}
                        disabled={isCompletionLocked}
                        options={COMPETENCIA_OPTIONS}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <p className="text-sm text-[var(--color-gray-3)]">
                      No hay competencias para este semestre.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Navegación entre semestres */}
      <div className="flex gap-3 justify-between">
        <Button
          variant="outline"
          onClick={onPrevSemester}
          disabled={currentSemesterIndex === 0 || isCompletionLocked}
        //   icon={<GoChevronLeft />}
        >
          Anterior
        </Button>

        {currentSemesterIndex < semestresData.length - 1 ? (
          <Button
            variant="primary"
            onClick={onNextSemester}
            disabled={!canAdvance || isCompletionLocked}
            // icon={<GoChevronRight/>}
          >
            Siguiente
          </Button>
        ) : (
          <div className="text-sm text-[var(--color-success)] font-medium flex items-center">
            ✓ Último semestre
          </div>
        )}
      </div>
    </div>
  );
}
