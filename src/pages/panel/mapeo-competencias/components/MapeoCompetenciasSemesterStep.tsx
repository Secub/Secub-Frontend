import { useMemo, useState } from "react";
import { Button, Select } from "../../../../components/ui";
import type {
  ProgramaAcademico,
  MapeoSemesterData,
  MapeoCompetencia,
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

// interface Competencia {
//   id: string;
//   codigo: string;
//   nombre: string;
//   descripcion: string;
//   tipo: string;
//   programaId: string;
//   planId: string;
//   semestreId: string;
// }

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
  // semestresMapping, // Usado para tipos, pero el estado local es el que gestiona la UI
  isCompletionLocked,
  // onCompetenciaChange, // Los cambios se manejan con handleCompetenciaChange local
  onNextSemester,
  onPrevSemester,
  // canAdvance, // isCurrentSemesterComplete es el que valida
}: MapeoCompetenciasSemesterStepProps) {
  // Estado local para mapeo curso x competencia
  const [mapeoLocal, setMapeoLocal] = useState<
    Record<string, Record<string, string>>
  >({});

  const currentSemester = useMemo(() => {
    return semestresData[currentSemesterIndex];
  }, [semestresData, currentSemesterIndex]);

  const semestreNumero = useMemo(() => {
    return currentSemesterIndex + 1;
  }, [currentSemesterIndex]);

  // Obtener cursos del semestre actual desde el programa
  const cursosDelSemestre = useMemo(() => {
    if (!programa.semestres || !programa.semestres[currentSemesterIndex]) {
      return [];
    }
    return programa.semestres[currentSemesterIndex].cursos || [];
  }, [programa.semestres, currentSemesterIndex]);

  // Obtener competencias del semestre actual
  const competenciasDelSemestre = useMemo(() => {
    if (!currentSemester) return [];
    return currentSemester.competencias || [];
  }, [currentSemester]);

  // Inicializar mapeo con "no-aplica" como default
  const mappingInitialized = useMemo(() => {
    if (Object.keys(mapeoLocal).length === 0 && cursosDelSemestre.length > 0) {
      const newMapping: Record<string, Record<string, string>> = {};
      cursosDelSemestre.forEach((curso) => {
        newMapping[curso.id] = {};
        competenciasDelSemestre.forEach((comp) => {
          newMapping[curso.id][comp.id] = "no-aplica";
        });
      });
      setMapeoLocal(newMapping);
      return newMapping;
    }
    return mapeoLocal;
  }, [cursosDelSemestre, competenciasDelSemestre, mapeoLocal]);

  // Verificar si todas las competencias están evaluadas
  const isCurrentSemesterComplete = useMemo(() => {
    return cursosDelSemestre.length > 0 &&
      competenciasDelSemestre.length > 0 &&
      cursosDelSemestre.every((curso) =>
        competenciasDelSemestre.some((comp) =>
          mappingInitialized[curso.id]?.[comp.id] !== "no-aplica"
        )
      );
  }, [cursosDelSemestre, competenciasDelSemestre, mappingInitialized]);

  const handleCompetenciaChange = (cursoId: string, competenciaId: string, value: string) => {
    const newMapping = { ...mappingInitialized };
    if (!newMapping[cursoId]) {
      newMapping[cursoId] = {};
    }
    newMapping[cursoId][competenciaId] = value;
    setMapeoLocal(newMapping);
  };

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

      {/* Tabla de competencias - Cursos x Competencias */}
      <div className="surface-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-gray-6)] bg-[var(--color-gray-7)]">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-[var(--color-gray-3)] min-w-[250px]">
                  Curso
                </th>

                {competenciasDelSemestre.map((comp, idx) => (
                  <th 
                    key={comp.id}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase text-[var(--color-gray-3)] min-w-[140px]"
                  >
                    C{String(idx + 1).padStart(2, '0')}
                    
                  </th>
                ))}
                <th>
                </th>
              </tr>
            </thead>
            <tbody>
              {cursosDelSemestre.length > 0 ? (
                cursosDelSemestre.map((curso) => (
                  <tr
                    key={curso.id}
                    className="border-b border-[var(--color-gray-6)] hover:bg-[var(--color-gray-7)]"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-[var(--color-gray-2)]">
                      <div>
                        <p className="font-semibold">{curso.nombre}</p>
                        <p className="text-xs text-[var(--color-gray-3)] mt-1">{curso.codigo}</p>
                      </div>
                    </td>
                    {competenciasDelSemestre.map((comp) => (
                      <td 
                        key={`${curso.id}-${comp.id}`}
                        className="px-4 py-4 text-center"
                      >
                        <Select
                          placeholder="No Aplica"
                          value={mappingInitialized[curso.id]?.[comp.id] ?? "no-aplica"}
                          onChange={(e) => {
                            const value = (e.target as HTMLSelectElement).value;
                            handleCompetenciaChange(curso.id, comp.id, value);
                          }}
                          disabled={isCompletionLocked}
                          options={COMPETENCIA_OPTIONS}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={competenciasDelSemestre.length + 1} className="px-6 py-8 text-center">
                    <p className="text-sm text-[var(--color-gray-3)]">
                      No hay cursos disponibles para este semestre.
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
        >
          Anterior
        </Button>

        {currentSemesterIndex < semestresData.length - 1 ? (
          <Button
            variant="primary"
            onClick={onNextSemester}
            disabled={!isCurrentSemesterComplete || isCompletionLocked}
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
