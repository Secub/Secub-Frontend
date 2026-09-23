import { useEffect, useMemo, useRef, useState } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import { saveCompetencyMapping } from "../../../../services/competencyMappings";
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
  canAssignNucleo,
  getMappingKey,
  hasCompleteLevelMapping,
  isNucleoSequenceValid,
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
  const [activeStep, setActiveStep] = useState<"nucleos" | "mapeo">("nucleos");
  const [activeSemester, setActiveSemester] = useState(1);
  const [nucleosDraft, setNucleosDraft] = useState<NucleosDraft>(() => buildEmptyNucleosDraft(totalSemestres));
  const [nivelesDraft, setNivelesDraft] = useState<NivelesDraft>({});
  const [feedback, setFeedback] = useState<{ type: "success" | "warning" | "danger"; message: string } | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const initializedContextRef = useRef<string | null>(null);

  useEffect(() => {
    if (!programaId || !planId) return;

    const contextKey = `${programaId}__${planId}__${totalSemestres}`;

    if (initializedContextRef.current === contextKey) {
      return;
    }

    // Si estamos editando y todavía no tenemos el registro,
    // esperamos a que llegue antes de inicializar.
    if (existingRecord === undefined) {
      return;
    }

    const nextNucleosDraft = existingRecord
      ? readNucleosFromRecord(existingRecord, totalSemestres)
      : buildEmptyNucleosDraft(totalSemestres);
    const nextNivelesDraft = existingRecord
      ? readNivelesFromRecord(existingRecord)
      : {};
    setNucleosDraft(nextNucleosDraft);
    setNivelesDraft(nextNivelesDraft);
    setActiveStep("nucleos");
    setActiveSemester(1);
    setFeedback(null);

    initializedContextRef.current = contextKey;
  }, [programaId, planId, totalSemestres, existingRecord]);

  useEffect(() => {
    if (activeSemester > totalSemestres) {
      setActiveSemester(totalSemestres);
    }
  }, [activeSemester, totalSemestres]);

  const classificationComplete = useMemo(
    () => areAllSemestersClassified(nucleosDraft, totalSemestres) && allNucleosRepresented(nucleosDraft) && isNucleoSequenceValid(nucleosDraft, totalSemestres),
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
    if (nucleo && !canAssignNucleo(nucleosDraft, semestreNumero, nucleo)) {
      setFeedback({ type: "warning", message: "Los núcleos deben avanzar en orden: Fundamentación, Profesionalización y Síntesis, sin retroceder ni saltar etapas entre semestres." });
      return;
    }
    setFeedback(null);
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

  async function saveProgress(notifySuccess = true, draftOverride?: NivelesDraft, finalizar = false) {
    if (!canManage) return null;

    if (!isNucleoSequenceValid(nucleosDraft, totalSemestres)) {
      setFeedback({ type: "warning", message: "Corrige la secuencia de núcleos antes de guardar: cada semestre debe conservar el núcleo anterior o avanzar al siguiente." });
      return null;
    }

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
      const savedRecord = await saveCompetencyMapping(planId, {
        semestresClasificados: nextRecord.semestresClasificados,
        nivelesCompromiso: nextRecord.nivelesCompromiso,
        finalizar,
      });
      try { mockBackend.upsert<MapeoCompetenciasRecord>("mapeosCompetencias", savedRecord, currentUser); }
      catch { /* El backend conserva la fuente de verdad. */ }
      setFeedback(null);

      if (notifySuccess) {
        showNotification({
          title: "Progreso guardado",
          message: "Se ha guardado tu progreso correctamente.",
          variant: "success",
        });
      }

      return savedRecord;
    } catch (reason) {
      setFeedback({
        type: "danger",
        message: reason instanceof Error ? reason.message : "No fue posible guardar el progreso. Inténtalo nuevamente.",
      });
      return null;
    }
  }

  async function tryContinueToMapeo() {
    const isClassificationComplete =
      areAllSemestersClassified(nucleosDraft, totalSemestres) &&
      allNucleosRepresented(nucleosDraft) &&
      isNucleoSequenceValid(nucleosDraft, totalSemestres);

    if (!isClassificationComplete) {
      setFeedback({
        type: "warning",
        message: "Debes clasificar todos los semestres antes de continuar al mapeo de competencias.",
      });
      return false;
    }

    const preparedNivelesDraft = fillMissingLevelsWithNoAplica();
    const savedRecord = await saveProgress(false, preparedNivelesDraft);

    if (!savedRecord) {
      return false;
    }

    setActiveStep("mapeo");
    setActiveSemester(1);

    return true;
  }


  async function tryFinish() {
    const isClassificationComplete =
      areAllSemestersClassified(nucleosDraft, totalSemestres) &&
      allNucleosRepresented(nucleosDraft) &&
      isNucleoSequenceValid(nucleosDraft, totalSemestres);

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

    return saveProgress(false, undefined, true);
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
