import { useState, type Dispatch, type SetStateAction } from "react";
import { mockBackend } from "../../../../services/mockBackend";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import { getCurrentUser } from "../CompetenciasRa.mock";
import {
  MAX_RA_PER_COMPETENCIA,
  canAddLearningResult,
  getLearningResultsValidationMessage,
} from "../CompetenciasRa.utils";
import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRecord,
  ResultadoAprendizaje,
} from "../CompetenciasRa.types";

const currentUser = getCurrentUser();

interface UseCompetenciasRAActionsParams {
  selectedRecord: CompetenciasRaEnriched | null;
  setRecords: Dispatch<SetStateAction<CompetenciasRaFormacionRecord[]>>;
  setSelectedRecord: Dispatch<SetStateAction<CompetenciasRaEnriched | null>>;
  setDetailOpen: Dispatch<SetStateAction<boolean>>;
  setFormOpen: Dispatch<SetStateAction<boolean>>;
  refreshRecordsState: (nextRecords: CompetenciasRaFormacionRecord[], selectedId?: string) => void;
}

export function useCompetenciasRAActions({
  selectedRecord,
  setRecords,
  setSelectedRecord,
  setDetailOpen,
  setFormOpen,
  refreshRecordsState,
}: UseCompetenciasRAActionsParams) {
  const [raModalMode, setRaModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedRaRecord, setSelectedRaRecord] = useState<CompetenciasRaEnriched | null>(null);
  const [selectedRa, setSelectedRa] = useState<ResultadoAprendizaje | null>(null);
  const [raDraft, setRaDraft] = useState("");
  const [raError, setRaError] = useState("");

  const closeRaModal = () => {
    setRaModalMode(null);
    setSelectedRaRecord(null);
    setSelectedRa(null);
    setRaDraft("");
    setRaError("");
  };

  const openCreateRaModal = (record: CompetenciasRaEnriched) => {
    if (!canAddLearningResult(record)) {
      window.alert("Máximo 4 Resultados de Aprendizaje por competencia.");
      return;
    }

    setSelectedRaRecord(record);
    setSelectedRa(null);
    setRaDraft("");
    setRaError("");
    setRaModalMode("create");
  };

  const openEditRaModal = (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => {
    setSelectedRaRecord(record);
    setSelectedRa(ra);
    setRaDraft(ra.descripcion);
    setRaError("");
    setRaModalMode("edit");
  };

  const handleSaveRa = () => {
    if (!selectedRaRecord) return;
    const description = raDraft.trim();

    if (!description) {
      setRaError("Escribe la descripción del RA.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
      return;
    }

    const currentRas = selectedRaRecord.resultadosAprendizaje ?? [];
    if (raModalMode === "create" && currentRas.length >= MAX_RA_PER_COMPETENCIA) {
      setRaError("Máximo 4 Resultados de Aprendizaje por competencia.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
      return;
    }

    const nextRas =
      raModalMode === "edit" && selectedRa
        ? currentRas.map((ra) => (ra.id === selectedRa.id ? { ...ra, descripcion: description } : ra))
        : [
            ...currentRas,
            { id: `ra-${selectedRaRecord.id}-${Date.now()}`, numero: currentRas.length + 1, descripcion: description },
          ];

    const nextRecord: CompetenciasRaFormacionRecord = {
      ...selectedRaRecord,
      resultadosAprendizaje: nextRas.map((ra, index) => ({ ...ra, numero: index + 1 })),
      updatedAt: new Date().toISOString(),
    };

    const validationMessage = getLearningResultsValidationMessage(nextRecord);
    if (nextRecord.resultadosAprendizaje.length > MAX_RA_PER_COMPETENCIA) {
      setRaError(validationMessage || "Máximo 4 Resultados de Aprendizaje por competencia.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
      return;
    }

    try {
      const nextRecords = mockBackend.update<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser);
      refreshRecordsState(nextRecords, nextRecord.id);
      closeRaModal();
    } catch (error) {
      setRaError(error instanceof Error ? error.message : "No fue posible guardar el RA.");
      scrollToFirstValidationError({ fieldOrder: ["raDescripcion"] });
    }
  };

  const handleSaveCompetenciaDescription = (record: CompetenciasRaEnriched, descripcion: string) => {
    const nextRecord: CompetenciasRaFormacionRecord = {
      ...record,
      descripcion,
      nombre: record.nombre,
      updatedAt: new Date().toISOString(),
    };

    try {
      const nextRecords = mockBackend.update<CompetenciasRaFormacionRecord>("competenciasRa", nextRecord, currentUser);
      refreshRecordsState(nextRecords, record.id);
      return true;
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "No fue posible actualizar la competencia.");
      return false;
    }
  };

  const handleDelete = (record: CompetenciasRaEnriched) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar la competencia de ${record.programaNombre}? También se eliminarán sus RA asociados y se limpiarán relaciones demo vinculadas.`,
    );
    if (!confirmed) return;

    const nextRecords = mockBackend.remove<CompetenciasRaFormacionRecord>("competenciasRa", record.id, currentUser);
    setRecords(nextRecords);

    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
      setDetailOpen(false);
      setFormOpen(false);
      closeRaModal();
    }
  };

  return {
    raModalMode,
    selectedRaRecord,
    raDraft,
    raError,
    openCreateRaModal,
    openEditRaModal,
    closeRaModal,
    handleSaveRa,
    handleSaveCompetenciaDescription,
    handleDelete,
    setRaDraft,
    setRaError,
  };
}
