import { useState } from "react";
import { GoPlus, GoTrash, GoChevronRight, GoChevronLeft } from "react-icons/go";
import { Button, Badge } from "../../../../components/ui";

interface SemesterData {
  semesterId: string;
  semesterNumber: number;
  competencias: Array<{
    id: string;
    numero: number;
    descripcion: string;
    resultadosAprendizaje: Array<{
      id: string;
      numero: number;
      descripcion: string;
    }>;
  }>;
}

interface MapeoSemesterEditorProps {
  semesters: SemesterData[];
  currentSemesterIndex: number;
  totalSemesters: number;
  canEdit: boolean;
  onSemesterChange: (index: number, data: SemesterData) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinalize: () => void;
  isFinalizing?: boolean;
}

export function MapeoSemesterEditor({
  semesters,
  currentSemesterIndex,
  totalSemesters,
  canEdit,
  onSemesterChange,
  onNext,
  onPrev,
  onFinalize,
  isFinalizing = false,
}: MapeoSemesterEditorProps) {
  const currentSemester = semesters[currentSemesterIndex];
  const [newCompetencia, setNewCompetencia] = useState("");
  const [newRA, setNewRA] = useState<Record<string, string>>({});

  const handleAddCompetencia = () => {
    if (!newCompetencia.trim() || !canEdit) return;

    const updatedSemester: SemesterData = {
      ...currentSemester,
      competencias: [
        ...currentSemester.competencias,
        {
          id: `comp-${Date.now()}`,
          numero: currentSemester.competencias.length + 1,
          descripcion: newCompetencia,
          resultadosAprendizaje: [],
        },
      ],
    };

    onSemesterChange(currentSemesterIndex, updatedSemester);
    setNewCompetencia("");
  };

  const handleDeleteCompetencia = (compId: string) => {
    const updatedSemester: SemesterData = {
      ...currentSemester,
      competencias: currentSemester.competencias
        .filter((c) => c.id !== compId)
        .map((c, idx) => ({ ...c, numero: idx + 1 })),
    };

    onSemesterChange(currentSemesterIndex, updatedSemester);
  };

  const handleAddRA = (compId: string) => {
    if (!newRA[compId]?.trim() || !canEdit) return;

    const updatedSemester: SemesterData = {
      ...currentSemester,
      competencias: currentSemester.competencias.map((c) => {
        if (c.id === compId) {
          return {
            ...c,
            resultadosAprendizaje: [
              ...c.resultadosAprendizaje,
              {
                id: `ra-${Date.now()}`,
                numero: c.resultadosAprendizaje.length + 1,
                descripcion: newRA[compId],
              },
            ],
          };
        }
        return c;
      }),
    };

    onSemesterChange(currentSemesterIndex, updatedSemester);
    setNewRA({ ...newRA, [compId]: "" });
  };

  const handleDeleteRA = (compId: string, raId: string) => {
    const updatedSemester: SemesterData = {
      ...currentSemester,
      competencias: currentSemester.competencias.map((c) => {
        if (c.id === compId) {
          return {
            ...c,
            resultadosAprendizaje: c.resultadosAprendizaje
              .filter((ra) => ra.id !== raId)
              .map((ra, idx) => ({ ...ra, numero: idx + 1 })),
          };
        }
        return c;
      }),
    };

    onSemesterChange(currentSemesterIndex, updatedSemester);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-secondary-4)]">
          Semestre {currentSemester.semesterNumber}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-gray-3)]">
          Configura las competencias y resultados de aprendizaje para este semestre
        </p>
      </div>

      <div className="space-y-4">
        {currentSemester.competencias.map((competencia) => (
          <div
            key={competencia.id}
            className="space-y-3 rounded-lg border border-[var(--color-gray-6)] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge>C{competencia.numero}</Badge>
                  <p className="font-medium text-[var(--color-gray-4)]">
                    {competencia.descripcion}
                  </p>
                </div>
              </div>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<GoTrash className="text-red-600" />}
                  onClick={() => handleDeleteCompetencia(competencia.id)}
                  className="text-red-600"
                >
                  Eliminar
                </Button>
              )}
            </div>

            <div className="space-y-2 pl-4">
              {competencia.resultadosAprendizaje.map((ra) => (
                <div
                  key={ra.id}
                  className="flex items-start justify-between gap-3 rounded bg-[var(--color-surface-soft)] p-2"
                >
                  <div className="flex-1">
                    <span className="text-xs font-medium text-[var(--color-gray-3)]">
                      RA {ra.numero}:
                    </span>
                    <p className="text-sm text-[var(--color-gray-4)]">
                      {ra.descripcion}
                    </p>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteRA(competencia.id, ra.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar RA"
                    >
                      <GoTrash className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}

              {canEdit && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Nuevo resultado de aprendizaje"
                    value={newRA[competencia.id] || ""}
                    onChange={(e) =>
                      setNewRA({ ...newRA, [competencia.id]: e.target.value })
                    }
                    className="flex-1 rounded border border-[var(--color-gray-6)] px-3 py-2 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleAddRA(competencia.id);
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<GoPlus />}
                    onClick={() => handleAddRA(competencia.id)}
                  >
                    Añadir RA
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nueva competencia"
            value={newCompetencia}
            onChange={(e) => setNewCompetencia(e.target.value)}
            className="flex-1 rounded border border-[var(--color-gray-6)] px-4 py-2"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddCompetencia();
              }
            }}
          />
          <Button
            variant="primary"
            leftIcon={<GoPlus />}
            onClick={handleAddCompetencia}
          >
            Añadir Competencia
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-[var(--color-gray-6)] pt-4">
        <div className="text-sm text-[var(--color-gray-3)]">
          Semestre {currentSemesterIndex + 1} de {totalSemesters}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<GoChevronLeft />}
            onClick={onPrev}
            disabled={currentSemesterIndex === 0}
          >
            Anterior
          </Button>

          {currentSemesterIndex === totalSemesters - 1 ? (
            <Button
              variant="primary"
              onClick={onFinalize}
              disabled={isFinalizing}
            >
              {isFinalizing ? "Finalizando..." : "Finalizar Evaluación"}
            </Button>
          ) : (
            <Button
              variant="primary"
              rightIcon={<GoChevronRight />}
              onClick={onNext}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapeoSemesterEditor;
