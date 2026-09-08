import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAcademicWorkflowStepLocked } from '../../../../components/panel';
import {
  getAcademicModulePermissions,
  shouldEnforceAcademicWorkflowLock,
} from '../../../../config/access/permissions';
import {
  createCompetency,
  getCompetencyContext,
  listCompetencies,
  updateCompetency,
  type CompetencyContext,
} from '../../../../services/competencies';
import { mockBackend } from '../../../../services/mockBackend';
import { showNotification } from '../../../../shared/feedback';
import { getCurrentUser } from '../CompetenciasRa.mock';
import type {
  Catalogs,
  CompetenciasRaEnriched,
  CompetenciasRaFormacionRecord,
  FormState,
} from '../CompetenciasRa.types';
import {
  enrichCompetenciasRa,
  getEmptyFormState,
} from '../CompetenciasRa.utils';
import { useCompetenciasRAActions } from './useCompetenciasRAActions';
import { useCompetenciasRAFilters } from './useCompetenciasRAFilters';

const MAX_COMPETENCIES_PER_PLAN = 4;

const EMPTY_CATALOGS: Catalogs = {
  seccionales: [],
  lugares: [],
  facultades: [],
  programas: [],
  planes: [],
};

function buildCatalogs(context: CompetencyContext): Catalogs {
  const { scope } = context;
  return {
    seccionales: [{ id: scope.seccionalId, nombre: scope.seccionalNombre }],
    lugares: [{ id: scope.lugarId, nombre: scope.lugarNombre, seccionalId: scope.seccionalId }],
    facultades: [{ id: scope.facultadId, nombre: scope.facultadNombre, seccionalId: scope.seccionalId }],
    programas: [{
      id: scope.programaId,
      nombre: scope.programaNombre,
      facultadId: scope.facultadId,
      seccionalId: scope.seccionalId,
    }],
    planes: context.planes,
  };
}

function syncWorkflowRecord(
  record: CompetenciasRaFormacionRecord,
  user: ReturnType<typeof getCurrentUser>,
) {
  try {
    mockBackend.upsert<CompetenciasRaFormacionRecord>('competenciasRa', record, user);
  } catch {
    // El backend es la fuente de verdad. El espejo conserva el flujo académico
    // mientras los módulos siguientes continúan utilizando datos locales.
  }
}

export function useCompetenciasRAPage() {
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [catalogs, setCatalogs] = useState<Catalogs>(EMPTY_CATALOGS);
  const [records, setRecords] = useState<CompetenciasRaFormacionRecord[]>([]);
  const [maxCompetenciesPerPlan, setMaxCompetenciesPerPlan] = useState(MAX_COMPETENCIES_PER_PLAN);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadVersion, setReloadVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CompetenciasRaEnriched | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formValues, setFormValues] = useState<FormState>(() => getEmptyFormState(currentUser));
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    Promise.all([
      getCompetencyContext(controller.signal),
      listCompetencies(controller.signal),
    ])
      .then(([context, competencyRecords]) => {
        setCatalogs(buildCatalogs(context));
        setMaxCompetenciesPerPlan(context.maxCompetenciasPorPlan);
        setRecords(competencyRecords);
        competencyRecords.forEach((record) => syncWorkflowRecord(record, currentUser));
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setLoadError(
          reason instanceof Error
            ? reason.message
            : 'No fue posible cargar las competencias y RA.',
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [currentUser, reloadVersion]);

  const permissions = getAcademicModulePermissions('competenciasRa', currentUser.role);
  const isStepLocked =
    shouldEnforceAcademicWorkflowLock(currentUser.role) &&
    isAcademicWorkflowStepLocked('competencias-ra');
  const hasRecords = records.length > 0;
  const filtersState = useCompetenciasRAFilters({ records, catalogs, currentUser });
  const {
    filters,
    sortOrder,
    setFilters,
    setSortOrder,
    roleScopedRecords,
    availableFilterOptions,
    filteredRecords,
    invalidCompetencias,
    handleFilterChange,
  } = filtersState;

  const updateRecordState = useCallback((record: CompetenciasRaFormacionRecord) => {
    setRecords((current) => {
      const exists = current.some((item) => item.id === record.id);
      return exists
        ? current.map((item) => (item.id === record.id ? record : item))
        : [...current, record];
    });
    syncWorkflowRecord(record, currentUser);
    const enriched = enrichCompetenciasRa([record], catalogs)[0];
    setSelectedRecord((current) => current?.id === record.id ? enriched : current);
  }, [catalogs, currentUser]);

  const removeRecordState = useCallback((recordId: string) => {
    setRecords((current) => current.filter((record) => record.id !== recordId));
    try {
      mockBackend.remove<CompetenciasRaFormacionRecord>('competenciasRa', recordId, currentUser);
    } catch {
      // El registro ya fue eliminado de la fuente de verdad.
    }
  }, [currentUser]);

  const openCreateModal = () => {
    if (!permissions.canCreate || loading) return;
    const hasAvailablePlan = catalogs.planes.some((plan) =>
      records.filter((record) => record.planId === plan.id).length < maxCompetenciesPerPlan,
    );
    if (!hasAvailablePlan) {
      showNotification('Todos los planes disponibles ya tienen el máximo de 4 competencias.');
      return;
    }
    setFormMode('create');
    setFormValues(getEmptyFormState(currentUser));
    setSelectedRecord(null);
    setFormOpen(true);
  };

  const openViewModal = (record: CompetenciasRaEnriched) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  const raActions = useCompetenciasRAActions({
    permissions,
    selectedRecord,
    submitting,
    setSubmitting,
    setSelectedRecord,
    setDetailOpen,
    setFormOpen,
    updateRecordState,
    removeRecordState,
  });

  const handleFormSubmit = async (values: FormState) => {
    const canSubmit = formMode === 'create' ? permissions.canCreate : permissions.canUpdate;
    if (!canSubmit || submitting) return;
    const recordsForPlan = records.filter((record) =>
      record.planId === values.planId && record.id !== selectedRecord?.id,
    );
    if (recordsForPlan.length >= maxCompetenciesPerPlan) {
      showNotification({
        title: 'Límite de competencias alcanzado',
        message: 'Puedes crear máximo 4 competencias por programa y plan de estudios.',
        variant: 'warning',
      });
      return;
    }

    setSubmitting(true);
    try {
      const record = formMode === 'create'
        ? await createCompetency({
            planId: values.planId,
            descripcion: values.descripcion.trim(),
          })
        : await updateCompetency(selectedRecord!.id, {
            planId: values.planId,
            descripcion: values.descripcion.trim(),
            estado: values.estado,
          });
      updateRecordState(record);
      setFilters({
        seccionalId: values.seccionalId,
        lugarId: values.lugarId,
        facultadId: values.facultadId,
        programaId: values.programaId,
        planId: values.planId,
        estado: 'activo',
      });
      setFormOpen(false);
      setSelectedRecord(null);
      showNotification({
        message: formMode === 'create'
          ? `${record.nombre} fue creada.`
          : 'Los cambios de la competencia fueron guardados.',
        variant: 'success',
      });
    } catch (error) {
      showNotification({
        title: 'No fue posible guardar',
        message: error instanceof Error ? error.message : 'Intenta nuevamente.',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reload = useCallback(() => setReloadVersion((current) => current + 1), []);

  return {
    currentUser,
    catalogs,
    permissions,
    loading,
    loadError,
    submitting,
    maxCompetenciesPerPlan,
    reload,
    isStepLocked,
    hasRecords,
    filters,
    sortOrder,
    selectedRecord,
    detailOpen,
    formOpen,
    formMode,
    formValues,
    exportFormat,
    raModalMode: raActions.raModalMode,
    selectedRaRecord: raActions.selectedRaRecord,
    recordToDelete: raActions.recordToDelete,
    raDraft: raActions.raDraft,
    raError: raActions.raError,
    roleScopedRecords,
    filteredRecords,
    availableFilterOptions,
    invalidCompetencias,
    openCreateModal,
    openViewModal,
    openCreateRaModal: raActions.openCreateRaModal,
    openEditRaModal: raActions.openEditRaModal,
    handleSaveRa: raActions.handleSaveRa,
    handleSaveCompetenciaDescription: raActions.handleSaveCompetenciaDescription,
    handleDelete: raActions.handleDelete,
    confirmDelete: raActions.confirmDelete,
    handleFilterChange,
    handleFormSubmit,
    closeRaModal: raActions.closeRaModal,
    setFilters,
    setSortOrder,
    setDetailOpen,
    setFormOpen,
    setExportFormat,
    setRecordToDelete: raActions.setRecordToDelete,
    setRaDraft: raActions.setRaDraft,
    setRaError: raActions.setRaError,
  };
}

export type UseCompetenciasRAPageResult = ReturnType<typeof useCompetenciasRAPage>;
