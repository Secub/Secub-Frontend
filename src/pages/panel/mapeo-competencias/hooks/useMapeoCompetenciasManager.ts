import { useEffect, useMemo, useRef, useState } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import { showNotification } from "../../../../shared/feedback";
import type {
  CompetenciaRaDemoRecord,
  CurrentUser,
  CursoAsis,
  MapeoCompetenciasRecord,
  NivelesDraft,
  NucleoFormacion,
  NucleosDraft,
} from "../MapeoCompetencias.types";
import {
  allNucleosRepresented,
  areAllSemestersClassified,
  buildEmptyNucleosDraft,
  buildMapeoRecord,
  getMappingKey,
  hasCompleteLevelMapping,
  readNivelesFromRecord,
  readNucleosFromRecord,
} from "../MapeoCompetencias.utils";

interface UseMapeoCompetenciasManagerParams {
  currentUser: CurrentUser;
  existingRecord?: MapeoCompetenciasRecord | null;
  seccionalId: string;
  facultadId: string;
  lugarId: string;
  programaId: string;
  planId: string;
  cursos: CursoAsis[];
  competencias: CompetenciaRaDemoRecord[];
  canManage: boolean;
  totalSemestres: number;
}

export function useMapeoCompetenciasManager({
  currentUser,
  existingRecord,
  seccionalId,
  facultadId,
  lugarId,
  programaId,
  planId,
  cursos,
  competencias,
  canManage,
  totalSemestres,
}: UseMapeoCompetenciasManagerParams) {
  console.log("useMapeoCompetenciasManager render");
  const [activeStep, setActiveStep] = useState<"nucleos" | "mapeo">("nucleos");
  const [activeSemester, setActiveSemester] = useState(1);
  const [nucleosDraft, setNucleosDraft] = useState<NucleosDraft>(() => buildEmptyNucleosDraft(totalSemestres));
  const [nivelesDraft, setNivelesDraft] = useState<NivelesDraft>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "warning" | "danger"; message: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const lastLoadedRecordId = useRef<string | null>(null);
  const initializedRef = useRef(false);
  

  useEffect(() => {
    if (!programaId || !planId) return;

    if (initializedRef.current) return;

    setNucleosDraft(
      existingRecord
        ? readNucleosFromRecord(existingRecord, totalSemestres)
        : buildEmptyNucleosDraft(totalSemestres)
    );

    setNivelesDraft(
      existingRecord
        ? readNivelesFromRecord(existingRecord)
        : {}
    );

    setActiveStep("nucleos");
    setActiveSemester(1);
    setFeedback(null);

    initializedRef.current = true;
  }, [existingRecord, programaId, planId, totalSemestres]);

  useEffect(() => {
    initializedRef.current = false;
  }, [programaId, planId]);

  useEffect(() => {
    if (activeSemester > totalSemestres) {
      setActiveSemester(totalSemestres);
    }
  }, [activeSemester, totalSemestres]);

  const classificationComplete = useMemo(
    () => areAllSemestersClassified(nucleosDraft, totalSemestres) && allNucleosRepresented(nucleosDraft),
    [nucleosDraft, totalSemestres],
  );

  const levelMappingComplete = useMemo(
    () => hasCompleteLevelMapping(cursos, competencias, nivelesDraft),
    [competencias, cursos, nivelesDraft],
  );

  const pendingLevelsCount = useMemo(() => {
    const total = cursos.length * competencias.length;
    const assigned = cursos.reduce((count, curso) => {
      return (
        count +
        competencias.filter((competencia) => Boolean(nivelesDraft[getMappingKey(curso.id, competencia.id)])).length
      );
    }, 0);

    return Math.max(total - assigned, 0);
  }, [competencias, cursos, nivelesDraft]);

  function updateNucleo(semestreNumero: number, nucleo: NucleoFormacion | null) {
    setNucleosDraft((current) => ({
      ...current,
      [semestreNumero]: nucleo,
    }));
  }

  function updateNivel(cursoId: string, competenciaId: string, nivel: string) {
    setNivelesDraft((current) => {
      const key = getMappingKey(cursoId, competenciaId);
      const next = { ...current };

      if (!nivel) {
        delete next[key];
        return next;
      }

      next[key] = nivel as NivelesDraft[string];
      return next;
    });
  }

  function buildPreparedNivelesDraft(currentDraft: NivelesDraft = nivelesDraft) {
    const next = { ...currentDraft };

    cursos.forEach((curso) => {
      competencias.forEach((competencia) => {
        const key = getMappingKey(curso.id, competencia.id);
        if (!next[key]) next[key] = "no-aplica";
      });
    });

    return next;
  }

  function fillMissingLevelsWithNoAplica() {
    const next = buildPreparedNivelesDraft();
    setNivelesDraft(next);
    return next;
  }

  function buildRecord(nextNivelesDraft: NivelesDraft = nivelesDraft) {
    return buildMapeoRecord({
      existingRecord,
      seccionalId,
      facultadId,
      lugarId,
      programaId,
      planId,
      nucleosDraft,
      nivelesDraft: nextNivelesDraft,
      cursos,
      competencias,
      totalSemestres,
    });
  }

  function saveProgress(notifySuccess = true, draftOverride?: NivelesDraft) {
    if (!canManage) return null;

    if (!programaId || !planId) {
      setFeedback({
        type: "warning",
        message: "Selecciona un programa académico y un plan de estudios para iniciar el mapeo.",
      });
      return null;
    }

    try {
      const nextNivelesDraft = draftOverride ?? nivelesDraft;
      const nextRecord = buildRecord(nextNivelesDraft);
      mockBackend.upsert<MapeoCompetenciasRecord>("mapeosCompetencias", nextRecord, currentUser);
      setFeedback(null);

      if (notifySuccess) {
        showNotification({
          title: "Progreso guardado",
          message: "Se ha guardado tu progreso correctamente.",
          variant: "success",
        });
      }

      return nextRecord;
    } catch {
      setFeedback({
        type: "danger",
        message: "No fue posible guardar el progreso. Revisa la información e inténtalo nuevamente.",
      });
      return null;
    }
  }

  function tryContinueToMapeo() {
    const isClassificationComplete =
      areAllSemestersClassified(nucleosDraft, totalSemestres) &&
      allNucleosRepresented(nucleosDraft);

    if (!isClassificationComplete) {
      setFeedback({
        type: "warning",
        message: "Debes clasificar todos los semestres antes de continuar al mapeo de competencias.",
      });
      return false;
    }

    const preparedNivelesDraft = fillMissingLevelsWithNoAplica();
    const savedRecord = saveProgress(false, preparedNivelesDraft);
    if (!savedRecord) return false;

    lastLoadedRecordId.current = `${savedRecord.id}-${programaId}-${planId}`;
    setActiveStep("mapeo");
    setActiveSemester(1);
    return true;
  }


  function tryFinish() {
    const isClassificationComplete =
      areAllSemestersClassified(nucleosDraft, totalSemestres) &&
      allNucleosRepresented(nucleosDraft);

    if (!isClassificationComplete) {
      setActiveStep("nucleos");
      setFeedback({
        type: "warning",
        message: "Debes clasificar todos los semestres antes de finalizar el mapeo.",
      });
      return null;
    }

    if (!cursos.length) {
      setFeedback({
        type: "warning",
        message: "No hay cursos cargados para este plan en ASIS/mock. No es posible finalizar el mapeo.",
      });
      return null;
    }

    if (!competencias.length) {
      setFeedback({
        type: "warning",
        message: "No hay competencias creadas para este programa y plan de estudios.",
      });
      return null;
    }

    if (!levelMappingComplete) {
      setFeedback({
        type: "warning",
        message: `Faltan ${pendingLevelsCount} nivel(es) I-R-A-NA por asignar antes de finalizar.`,
      });
      return null;
    }

    return saveProgress(false);
  }

  return {
    activeStep,
    activeSemester,
    classificationComplete,
    feedback,
    levelMappingComplete,
    nivelesDraft,
    nucleosDraft,
    pendingLevelsCount,
    showExitConfirm,
    setActiveSemester,
    setActiveStep,
    setFeedback,
    setShowExitConfirm,
    tryContinueToMapeo,
    tryFinish,
    saveProgress,
    updateNivel,
    updateNucleo,
  };
}
