import { useEffect, useMemo, useState } from "react";
import {
  GoCheck,
  GoChevronLeft,
  GoChevronRight,
} from "react-icons/go";

// ==============================
// TYPES
// ==============================

export interface Curso {
  id: string;
  nombre: string;
}

export interface Semestre {
  id: string;
  numero: number;
  tipo?: string;
  cursos: Curso[];
}

interface Props {
  semestres: Semestre[];

  onSaveProgress?: (
    currentStep: number
  ) => void;

  onFinishEvaluation?: () => void;
}

// ==============================
// COMPONENT
// ==============================

export default function SemesterStepper({
  semestres,
  onSaveProgress,
  onFinishEvaluation,
}: Props) {
  const [currentStep, setCurrentStep] =
    useState(0);

  // =========================================
  // LOAD SAVED STEP
  // =========================================

  useEffect(() => {
    const savedStep =
      localStorage.getItem(
        "semester-stepper-progress"
      );

    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }
  }, []);

  // =========================================
  // SAVE PROGRESS
  // =========================================

  const saveProgress = () => {
    localStorage.setItem(
      "semester-stepper-progress",
      String(currentStep)
    );

    onSaveProgress?.(currentStep);
  };

  // =========================================
  // DATA
  // =========================================

  const currentSemester =
    semestres[currentStep];

  const progressPercentage = useMemo(() => {
    return (
      ((currentStep + 1) /
        semestres.length) *
      100
    );
  }, [currentStep, semestres.length]);

  // =========================================
  // NAVIGATION
  // =========================================

  const goNext = () => {
    if (
      currentStep <
      semestres.length - 1
    ) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="w-full">

      {/* ========================= */}
      {/* STEPPER */}
      {/* ========================= */}

      <div className="mb-10 flex items-center justify-between gap-2 overflow-x-auto">

        {semestres.map(
          (semestre, index) => {
            const isActive =
              index === currentStep;

            const isCompleted =
              index < currentStep;

            return (
              <div
                key={semestre.id}
                className="flex flex-1 items-center"
              >
                {/* STEP */}
                <button
                  onClick={() =>
                    setCurrentStep(index)
                  }
                  className={`relative flex h-10 min-w-[120px] items-center justify-center rounded-md border text-sm font-semibold transition-all

                  ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : isCompleted
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 bg-white text-gray-500"
                  }
                `}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <GoCheck />
                    )}

                    <span>
                      Semestre{" "}
                      {semestre.numero}
                    </span>
                  </div>
                </button>

                {/* LINE */}
                {index <
                  semestres.length -
                    1 && (
                  <div
                    className={`h-1 flex-1

                    ${
                      index <
                      currentStep
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }
                  `}
                  />
                )}
              </div>
            );
          }
        )}
      </div>

      {/* ========================= */}
      {/* CARD */}
      {/* ========================= */}

      <div className="rounded-2xl border-2 border-[var(--color-gray-4)] bg-white p-6 shadow-sm">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <h2 className="font-heading text-2xl font-bold text-[var(--color-secondary-4)]">
              Semestre{" "}
              {
                currentSemester.numero
              }
            </h2>

            {currentSemester.tipo && (
              <span className="mt-2 inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                {
                  currentSemester.tipo
                }
              </span>
            )}
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">
              Progreso
            </p>

            <p className="text-xl font-bold">
              {Math.round(
                progressPercentage
              )}
              %
            </p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="mb-8 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>

        {/* CONTENT */}
        <div className="rounded-xl border border-gray-200 p-5">

          <h3 className="mb-4 text-lg font-semibold">
            Cursos
          </h3>

          <div className="flex flex-col gap-3">

            {currentSemester.cursos.map(
              (curso) => (
                <div
                  key={curso.id}
                  className="rounded-lg border border-gray-200 p-3"
                >
                  <p className="font-medium">
                    {curso.nombre}
                  </p>
                </div>
              )
            )}
          </div>

          {/* ===================================== */}
          {/* AQUÍ PUEDES AGREGAR TU CONTENIDO */}
          {/* ===================================== */}

          {/*
          
          Aquí puedes agregar:

          - tablas
          - selects
          - inputs
          - competencias
          - RA
          - evaluación
          - matrices
          - cards
          - gráficos

          según el semestre actual

          */}
        </div>

        {/* ========================= */}
        {/* ACTIONS */}
        {/* ========================= */}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">

          <div className="flex gap-3">

            <button
              onClick={goPrevious}
              disabled={
                currentStep === 0
              }
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GoChevronLeft />
              Anterior
            </button>

            <button
              onClick={goNext}
              disabled={
                currentStep ===
                semestres.length - 1
              }
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
              <GoChevronRight />
            </button>
          </div>

          <div className="flex gap-3">

            <button
              onClick={saveProgress}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100"
            >
              Guardar progreso
            </button>

            {currentStep ===
              semestres.length - 1 && (
              <button
                onClick={
                  onFinishEvaluation
                }
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700"
              >
                Finalizar evaluación
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}