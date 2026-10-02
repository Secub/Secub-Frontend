import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AcademicModulePermissions } from '../../../../config/access/permissions';
import {
  createLearningOutcome,
  deleteCompetency,
  deleteLearningOutcome,
  updateCompetency,
  updateLearningOutcome,
} from '../../../../services/competencies';
import { showNotification } from '../../../../shared/feedback';
import { scrollToFirstValidationError } from '../../../../utils/validationScroll';
import type {
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRecord,
  ResultadoAprendizaje,
} from '../CompetenciasRa.types';
import {
  MAX_RA_PER_COMPETENCIA,
  canAddLearningResult,
} from '../CompetenciasRa.utils';

interface UseCompetenciasRAActionsParams {
  permissions: AcademicModulePermissions;
  selectedRecord: CompetenciasRaEnriched | null;
  submitting: boolean;
  setSubmitting: Dispatch<SetStateAction<boolean>>;
  setSelectedRecord: Dispatch<SetStateAction<CompetenciasRaEnriched | null>>;
  setDetailOpen: Dispatch<SetStateAction<boolean>>;
  setFormOpen: Dispatch<SetStateAction<boolean>>;
  updateRecordState: (record: CompetenciasRaFormacionRecord) => void;
  removeRecordState: (recordId: string) => void;
}

export function useCompetenciasRAActions({
  permissions,
  selectedRecord,
  submitting,
  setSubmitting,
  setSelectedRecord,
  setDetailOpen,
  setFormOpen,
  updateRecordState,
  removeRecordState,
}: UseCompetenciasRAActionsParams) {
  const [raModalMode, setRaModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedRaRecord, setSelectedRaRecord] = useState<CompetenciasRaEnriched | null>(null);
  const [selectedRa, setSelectedRa] = useState<ResultadoAprendizaje | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<CompetenciasRaEnriched | null>(null);
  const [raToDelete, setRaToDelete] = useState<{
    record: CompetenciasRaEnriched;
    ra: ResultadoAprendizaje;
  } | null>(null);
  const [raDraft, setRaDraft] = useState('');
  const [raError, setRaError] = useState('');

  const closeRaModal = () => {
    if (submitting) return;
    setRaModalMode(null);
    setSelectedRaRecord(null);
    setSelectedRa(null);
    setRaDraft('');
    setRaError('');
  };

  const openCreateRaModal = (record: CompetenciasRaEnriched) => {
    if (!permissions.canUpdate) return;
    if (!canAddLearningResult(record)) {
      showNotification('Ya alcanzaste el máximo de 4 resultados de aprendizaje permitidos.');
      return;
    }
    setSelectedRaRecord(record);
    setSelectedRa(null);
    setRaDraft('');
    setRaError('');
    setRaModalMode('create');
  };

  const openEditRaModal = (
    record: CompetenciasRaEnriched,
    ra: ResultadoAprendizaje,
  ) => {
    if (!permissions.canUpdate) return;
    setSelectedRaRecord(record);
    setSelectedRa(ra);
    setRaDraft(ra.descripcion);
    setRaError('');
    setRaModalMode('edit');
  };

  const handleSaveRa = async () => {
    if (!permissions.canUpdate || submitting || !selectedRaRecord) return;
    const description = raDraft.trim();
    if (!description) {
      setRaError('Escribe la descripción del RA.');
      scrollToFirstValidationError({ fieldOrder: ['raDescripcion'] });
      return;
    }
    const currentRas = selectedRaRecord.resultadosAprendizaje ?? [];
    if (raModalMode === 'create' && currentRas.length >= MAX_RA_PER_COMPETENCIA) {
      setRaError('Ya alcanzaste el máximo de 4 resultados de aprendizaje permitidos.');
      scrollToFirstValidationError({ fieldOrder: ['raDescripcion'] });
      return;
    }

    setSubmitting(true);
    try {
      const record = raModalMode === 'edit' && selectedRa
        ? await updateLearningOutcome(selectedRaRecord.id, selectedRa.id, description)
        : await createLearningOutcome(selectedRaRecord.id, description);
      updateRecordState(record);
      setRaModalMode(null);
      setSelectedRaRecord(null);
      setSelectedRa(null);
      setRaDraft('');
      setRaError('');
      showNotification({
        message: raModalMode === 'edit'
          ? 'El resultado de aprendizaje fue actualizado.'
          : 'El resultado de aprendizaje fue agregado.',
        variant: 'success',
      });
    } catch (error) {
      setRaError(error instanceof Error ? error.message : 'No fue posible guardar el RA.');
      scrollToFirstValidationError({ fieldOrder: ['raDescripcion'] });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCompetenciaDescription = async (
    record: CompetenciasRaEnriched,
    descripcion: string,
  ) => {
    if (!permissions.canUpdate || submitting) return false;
    setSubmitting(true);
    try {
      const updated = await updateCompetency(record.id, {
        planId: record.planId,
        descripcion,
        estado: record.estado,
      });
      updateRecordState(updated);
      return true;
    } catch (error) {
      showNotification({
        title: 'No fue posible actualizar',
        message: error instanceof Error ? error.message : 'Intenta nuevamente.',
        variant: 'error',
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (record: CompetenciasRaEnriched) => {
    if (!permissions.canDelete) return;
    if (record.mapeada) {
      showNotification({
        title: 'El plan ya tiene un mapeo',
        message: 'Las competencias de un plan mapeado se pueden editar, pero no eliminar.',
        variant: 'warning',
      });
      return;
    }
    setRecordToDelete(record);
  };

  const confirmDelete = async () => {
    if (!recordToDelete || !permissions.canDelete || submitting) return;
    const deletedId = recordToDelete.id;
    setSubmitting(true);
    try {
      await deleteCompetency(deletedId);
      removeRecordState(deletedId);
      if (selectedRecord?.id === deletedId) {
        setSelectedRecord(null);
        setDetailOpen(false);
        setFormOpen(false);
        setRaModalMode(null);
      }
      setRecordToDelete(null);
      showNotification({ message: 'La competencia y sus RA fueron eliminados.', variant: 'success' });
    } catch (error) {
      showNotification({
        title: 'No fue posible eliminar',
        message: error instanceof Error ? error.message : 'Intenta nuevamente.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRa = (record: CompetenciasRaEnriched, ra: ResultadoAprendizaje) => {
    if (!permissions.canUpdate) return;
    if (ra.asignado) {
      showNotification({
        title: 'RA asignado en un ciclo',
        message: 'Este resultado de aprendizaje ya fue asignado y no se puede eliminar.',
        variant: 'warning',
      });
      return;
    }
    setRaToDelete({ record, ra });
  };

  const confirmDeleteRa = async () => {
    if (!raToDelete || !permissions.canUpdate || submitting) return;
    const { record, ra } = raToDelete;
    setSubmitting(true);
    try {
      await deleteLearningOutcome(record.id, ra.id);
      updateRecordState({
        ...record,
        resultadosAprendizaje: record.resultadosAprendizaje.filter((item) => item.id !== ra.id),
        updatedAt: new Date().toISOString(),
      });
      setRaToDelete(null);
      showNotification({ message: 'El resultado de aprendizaje fue eliminado.', variant: 'success' });
    } catch (error) {
      setRaToDelete(null);
      showNotification({
        title: 'No fue posible eliminar el RA',
        message: error instanceof Error ? error.message : 'Intenta nuevamente.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    raModalMode,
    selectedRaRecord,
    recordToDelete,
    raToDelete,
    raDraft,
    raError,
    openCreateRaModal,
    openEditRaModal,
    closeRaModal,
    handleSaveRa,
    handleSaveCompetenciaDescription,
    handleDelete,
    handleDeleteRa,
    confirmDelete,
    confirmDeleteRa,
    setRecordToDelete,
    setRaToDelete,
    setRaDraft,
    setRaError,
  };
}
