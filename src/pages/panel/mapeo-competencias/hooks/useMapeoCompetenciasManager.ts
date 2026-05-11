import { useEffect, useMemo, useState } from "react";
import type {
  ProgramaAcademico,
  MapeoSemesterData,
//   MapeoCompetencia,
} from "../MapeoCompetencias.types";

export type CompetenciaOption = "introduce" | "refuerza" | "afianza" | "no-aplica";

const MAPEO_COMPETENCIAS_STORAGE_KEY = "secub.mapeoCompetencias.mapeos";

interface CompetenciaMapping {
  competenciaId: string;
  option: CompetenciaOption | null;
}

interface SemesterMapping {
  semesterId: string;
  semesterNumber: number;
  competenciaMappings: CompetenciaMapping[];
}

interface MapeoCompetenciasState {
  programaId: string;
  planId: string;
  semestres: SemesterMapping[];
}

function readStoredMapeoCompetencias(
  programaId: string,
  planId: string,
  semestresData: MapeoSemesterData[]
): SemesterMapping[] {
  if (typeof window === "undefined") return initializeSemesterMappings(semestresData);

  try {
    const rawValue = localStorage.getItem(MAPEO_COMPETENCIAS_STORAGE_KEY);
    if (!rawValue) return initializeSemesterMappings(semestresData);

    const parsed = JSON.parse(rawValue) as Record<
      string,
      MapeoCompetenciasState
    >;
    const key = `${programaId}__${planId}`;
    const state = parsed[key];

    if (state?.semestres) {
      return state.semestres;
    }
    return initializeSemesterMappings(semestresData);
  } catch {
    return initializeSemesterMappings(semestresData);
  }
}

function initializeSemesterMappings(
  semestresData: MapeoSemesterData[]
): SemesterMapping[] {
  return semestresData.map((sem) => ({
    semesterId: sem.semesterId,
    semesterNumber: sem.semesterNumber,
    competenciaMappings: sem.competencias.map((comp) => ({
      competenciaId: comp.id,
      option: null,
    })),
  }));
}

function saveMapeoCompetenciasToStorage(
  programaId: string,
  planId: string,
  semestres: SemesterMapping[]
): void {
  if (typeof window === "undefined") return;

  try {
    const rawValue = localStorage.getItem(MAPEO_COMPETENCIAS_STORAGE_KEY) || "{}";
    const parsed = JSON.parse(rawValue) as Record<
      string,
      MapeoCompetenciasState
    >;
    const key = `${programaId}__${planId}`;

    parsed[key] = {
      programaId,
      planId,
      semestres,
    };

    localStorage.setItem(MAPEO_COMPETENCIAS_STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    // Silently fail on storage errors
  }
}

interface UseMapeoCompetenciasManagerProps {
  programa: ProgramaAcademico | null;
  planId: string;
  semestresData: MapeoSemesterData[];
}

export function useMapeoCompetenciasManager({
  programa,
  planId,
  semestresData,
}: UseMapeoCompetenciasManagerProps) {
  const [semestresMapping, setSemestresMapping] = useState<SemesterMapping[]>(
    () => {
      if (!programa) return [];
      return readStoredMapeoCompetencias(programa.id, planId, semestresData);
    }
  );

  const [currentSemesterIndex, setCurrentSemesterIndex] = useState(0);
  const [isEvaluationLocked, setIsEvaluationLocked] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [lastSaveStatus, setLastSaveStatus] = useState<"saved" | "error" | null>(null);

  // Actualizar semestres cuando el programa cambia
  useEffect(() => {
    if (!programa) {
      setSemestresMapping([]);
      return;
    }
    setSemestresMapping(
      readStoredMapeoCompetencias(programa.id, planId, semestresData)
    );
    setCurrentSemesterIndex(0);
    setIsEvaluationLocked(false);
    setShowFinishModal(false);
    setLastSaveStatus(null);
  }, [programa?.id, planId, semestresData]);

  // Verificar si el semestre actual está completado
  const currentSemesterComplete = useMemo(() => {
    if (semestresMapping.length === 0) return false;
    const currentSem = semestresMapping[currentSemesterIndex];
    return currentSem.competenciaMappings.every((m) => m.option !== null);
  }, [semestresMapping, currentSemesterIndex]);

  // Verificar si todos los semestres están completados
  const allSemestresEvaluated = useMemo(() => {
    return semestresMapping.every((sem) =>
      sem.competenciaMappings.every((m) => m.option !== null)
    );
  }, [semestresMapping]);

  // Resumen de asignaciones por opción
  const mappingSummary = useMemo(() => {
    const summary = {
      introduces: 0,
      refuerza: 0,
      afianza: 0,
      noAplica: 0,
    };

    semestresMapping.forEach((sem) => {
      sem.competenciaMappings.forEach((mapping) => {
        if (mapping.option === "introduce") summary.introduces++;
        else if (mapping.option === "refuerza") summary.refuerza++;
        else if (mapping.option === "afianza") summary.afianza++;
        else if (mapping.option === "no-aplica") summary.noAplica++;
      });
    });

    return summary;
  }, [semestresMapping]);

  const handleSetCompetenciaOption = (
    semesterIndex: number,
    competenciaIndex: number,
    option: CompetenciaOption
  ) => {
    setSemestresMapping((prev) => {
      const newMappings = [...prev];
      newMappings[semesterIndex].competenciaMappings[competenciaIndex].option = option;
      return newMappings;
    });
  };

  const handleNextSemester = () => {
    if (currentSemesterComplete && currentSemesterIndex < semestresMapping.length - 1) {
      setCurrentSemesterIndex((prev) => prev + 1);
    }
  };

  const handlePrevSemester = () => {
    if (currentSemesterIndex > 0) {
      setCurrentSemesterIndex((prev) => prev - 1);
    }
  };

  const handleSaveProgress = () => {
    if (!programa) return;
    try {
      saveMapeoCompetenciasToStorage(programa.id, planId, semestresMapping);
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
    if (!programa) return;
    if (!allSemestresEvaluated) {
      setLastSaveStatus("error");
      return;
    }

    // Guardar estado final
    saveMapeoCompetenciasToStorage(programa.id, planId, semestresMapping);
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
    semestresMapping,
    currentSemesterIndex,
    currentSemesterComplete,
    allSemestresEvaluated,
    mappingSummary,
    isEvaluationLocked,
    showFinishModal,
    lastSaveStatus,
    handleSetCompetenciaOption,
    handleNextSemester,
    handlePrevSemester,
    handleSaveProgress,
    handleCancelFinish,
    handleConfirmFinish,
    handleFinishClick,
  };
}
