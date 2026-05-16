import { useEffect, useMemo, useState } from "react";
import type { ProgramaAcademico } from "../MapeoCompetencias.types";

export type NucleoType = "fundamentacion" | "profesionalizacion" | "sintesis";

export const NUCLEOS_STORAGE_KEY = "secub.mapeoCompetencias.nucleos";
export const NUCLEOS_STORAGE_EVENT = "secub.mapeoCompetencias.nucleos.updated";

interface NucleosState {
  programaId: string;
  planId: string;
  semestres: Record<number, NucleoType | null>;
}

export function readStoredNucleos(programaId: string, planId: string): Record<number, NucleoType | null> {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = localStorage.getItem(NUCLEOS_STORAGE_KEY);
    if (!rawValue) return {};

    const parsed = JSON.parse(rawValue) as Record<string, NucleosState>;
    const key = `${programaId}__${planId}`;
    const state = parsed[key];

    return state?.semestres ?? {};
  } catch {
    return {};
  }
}

function saveNucleosToStorage(
  programaId: string,
  planId: string,
  semestres: Record<number, NucleoType | null>,
): void {
  if (typeof window === "undefined") return;

  try {
    const rawValue = localStorage.getItem(NUCLEOS_STORAGE_KEY) || "{}";
    const parsed = JSON.parse(rawValue) as Record<string, NucleosState>;
    const key = `${programaId}__${planId}`;

    parsed[key] = {
      programaId,
      planId,
      semestres,
    };

    localStorage.setItem(NUCLEOS_STORAGE_KEY, JSON.stringify(parsed));

    window.dispatchEvent(
      new CustomEvent(NUCLEOS_STORAGE_EVENT, {
        detail: {
          programaId,
          planId,
          semestres,
        },
      }),
    );
  } catch {
    // Silently fail on storage errors
  }
}

interface UseNucleosManagerProps {
  programa: ProgramaAcademico;
  planId: string;
}

export function useNucleosManager({
  programa,
  planId,
}: UseNucleosManagerProps) {
  const [semestresNucleos, setSemestresNucleos] = useState<
    Record<number, NucleoType | null>
  >(() => readStoredNucleos(programa.id, planId));

  const [isEvaluationLocked, setIsEvaluationLocked] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<"saved" | "error" | null>(null);

  // Actualizar semestres cuando el programa cambia
  useEffect(() => {
    setSemestresNucleos(readStoredNucleos(programa.id, planId));
    setIsEvaluationLocked(false);
    setShowFinishModal(false);
    setLastSaveStatus(null);
  }, [programa.id, planId]);

  // Verificar si todos los semestres están evaluados
  const allSemestresEvaluated = useMemo(() => {
    const totalSemestres = programa.semestres.length;
    const currentSemesterNumbers = new Set(
      programa.semestres.map((semestre) => semestre.numero),
    );

    const evaluatedCount = Object.entries(semestresNucleos).filter(
      ([numero, nucleo]) =>
        currentSemesterNumbers.has(Number(numero)) &&
        nucleo !== null,
    ).length;
    return evaluatedCount === totalSemestres;
  }, [programa.semestres, semestresNucleos]);

  // Contar semestres por tipo
  const nucleosSummary = useMemo(() => {
    return {
      fundamentacion: Object.values(semestresNucleos).filter(
        (n) => n === "fundamentacion",
      ).length,
      profesionalizacion: Object.values(semestresNucleos).filter(
        (n) => n === "profesionalizacion",
      ).length,
      sintesis: Object.values(semestresNucleos).filter((n) => n === "sintesis")
        .length,
    };
  }, [semestresNucleos]);

  const handleSelectNucleo = (semestreNumero: number, nucleo: NucleoType) => {
    setSemestresNucleos((prev) => ({
      ...prev,
      [semestreNumero]: nucleo,
    }));
  };

  const handleSaveProgress = () => {
    try {
      saveNucleosToStorage(programa.id, planId, semestresNucleos);
      setLastSaveStatus("saved");
      setTimeout(() => setLastSaveStatus(null), 3000);
    } catch {
      setLastSaveStatus("error");
      setTimeout(() => setLastSaveStatus(null), 3000);
    }
  };

  const handleCancelFinish = () => {
    setShowFinishModal(false);
  };

  const handleConfirmFinish = () => {
    if (!allSemestresEvaluated) {
      setLastSaveStatus("error");
      return;
    }

    // Guardar estado final
    saveNucleosToStorage(programa.id, planId, semestresNucleos);
    setIsEvaluationLocked(true);
    setShowFinishModal(false);
    setLastSaveStatus("saved");
  };

  const handleFinishClick = () => {
    if (!isEvaluationLocked && allSemestresEvaluated) {
      setShowFinishModal(true);
    }
  };

  return {
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
  };
}
