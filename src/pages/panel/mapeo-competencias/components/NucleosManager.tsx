import { useMemo } from "react";
import { GoCheckCircle, GoClock } from "react-icons/go";
import { Button, ConfirmDialog, Badge } from "../../../../components/ui";
import NucleoSemestreCard from "./NucleoSemestreCard";
import { useNucleosManager } from "../hooks/useNucleosManager";
import type { CurrentUser, MapeoCompetenciasRecord, ProgramaAcademico } from "../MapeoCompetencias.types";

interface NucleosManagerProps {
  currentUser: CurrentUser;
  programa: ProgramaAcademico;
  planId: string;
  onEvaluationComplete?: () => void;
}

export default function NucleosManager({
  currentUser: _currentUser,
  programa,
  planId,
  onEvaluationComplete,
}: NucleosManagerProps) {
  const {
    semestresNucleos,
    allSemestresEvaluated,
    nucleosSummary,
    isEvaluationLocked,
    showFinishModal,
    lastSaveStatus,
    handleSelectNucleo,
    handleSaveProgress,
    handleCancelFinish,
    handleConfirmFinish,
    handleFinishClick,
  } = useNucleosManager({
    programa,
    planId,
  });

  //   const semestresList = useMemo(() => {
  //   return Array.from({ length: programa.numeroSemestres }, (_, i) => ({
  //     numero: i + 1,
  //     cursos: [],
  //   }));
  // }, [programa.numeroSemestres]);

  const semestresList = useMemo(() => {
    return programa.semestres.map((semestre) => ({
      numero: semestre.numero,
      cursos: semestre.cursos,
      planNombre: semestre.planId,
    }));
  }, [programa.semestres]);

  const completionPercentage = useMemo(() => {
    const totalSemestres = programa.numeroSemestres;
    const evaluatedCount = Object.values(semestresNucleos).filter(
      (n) => n !== null,
    ).length;
    return totalSemestres > 0 ? Math.round((evaluatedCount / totalSemestres) * 100) : 0;
  }, [programa.numeroSemestres, semestresNucleos]);

  return (
    <div className="space-y-6 pb-24">
      {/* Encabezado con resumen */}
      <div className="surface-card rounded-lg p-6 md:p-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              {programa.nombre}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Progreso: {completionPercentage}% · {Object.values(semestresNucleos).filter((n) => n !== null).length} de{" "}
              {programa.numeroSemestres} semestres clasificados
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="info">
              F: {nucleosSummary.fundamentacion}
            </Badge>
            <Badge variant="warning">
              P: {nucleosSummary.profesionalizacion}
            </Badge>
            <Badge variant="success">
              S: {nucleosSummary.sintesis}
            </Badge>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-[var(--color-gray-4)]">
              Progreso general
            </span>
            <span className="text-sm font-semibold text-[var(--color-secondary-1)]">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-gray-6)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-secondary-1)] to-[var(--color-secondary-2)] transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mensaje de estado */}
      {isEvaluationLocked && (
        <div className="rounded-lg border-l-4 border-[var(--color-success)] bg-[var(--color-surface-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-success)]">
            ✓ Clasificación de núcleos completada y guardada correctamente.
          </p>
        </div>
      )}

      {lastSaveStatus === "saved" && (
        <div className="rounded-lg border-l-4 border-[var(--color-success)] bg-[var(--color-surface-soft)] p-4 animate-pulse">
          <p className="text-sm font-medium text-[var(--color-success)]">
            ✓ Progreso guardado correctamente.
          </p>
        </div>
      )}

      {lastSaveStatus === "error" && (
        <div className="rounded-lg border-l-4 border-[var(--color-error)] bg-[var(--color-surface-soft)] p-4">
          <p className="text-sm font-medium text-[var(--color-error)]">
            × Debes completar la clasificación de todos los semestres antes de finalizar.
          </p>
        </div>
      )}

      {/* Cards de semestres */}
      <div className="flex flex-col gap-6">
        {semestresList.map((semestre) => (
          <NucleoSemestreCard
            key={semestre.numero}
            semestreNumero={semestre.numero}
            cursos={semestre.cursos}
            planNombre={semestre.planNombre}
            selectedNucleo={
              semestresNucleos[semestre.numero] ?? null
            }
            disabled={isEvaluationLocked}
            onSelectNucleo={(nucleo) =>
              handleSelectNucleo(semestre.numero, nucleo)
            }
          />
        ))}
      </div>

      {/* Footer con botones */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-gray-6)] bg-[var(--color-white)] px-6 py-4 shadow-[var(--shadow-lg)] xl:left-[320px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Guardar permite conservar avances parciales. Finalizar valida todos los
            semestres: cada uno debe tener una clasificación asignada.
          </p>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<GoClock className="text-lg" />}
              onClick={handleSaveProgress}
              disabled={isEvaluationLocked}
              className="min-w-[220px]"
            >
              Guardar progreso
            </Button>

            <Button
              variant="primary"
              leftIcon={<GoCheckCircle className="text-lg" />}
              onClick={
                isEvaluationLocked
                  ? () => onEvaluationComplete?.()
                  : handleFinishClick
              }
              disabled={
                !allSemestresEvaluated && !isEvaluationLocked
              }
              className="min-w-[240px]"
            >
              {isEvaluationLocked
                ? "Siguiente paso"
                : allSemestresEvaluated
                  ? "Finalizar evaluación"
                  : "Completar todos los semestres"}
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmDialog
        open={showFinishModal}
        title="¿Estás seguro de que deseas finalizar la clasificación?"
        description="Después de finalizar, la información registrada quedará bloqueada y no podrás editar ni modificar las clasificaciones de núcleos."
        confirmLabel="Sí, finalizar clasificación"
        variant="warning"
        onCancel={handleCancelFinish}
        onConfirm={handleConfirmFinish}
      />
    </div>
  );
}
