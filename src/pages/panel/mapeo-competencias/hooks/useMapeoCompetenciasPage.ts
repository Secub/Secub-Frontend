import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES, buildRouteWithSearch } from "../../../../app/appRoutes";
import { mockBackend } from "../../../../services/mockBackend";
import { rolePermissions } from "../MapeoCompetencias.permissions";
import type {
  CompetenciaRaDemoRecord,
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters as FiltersState,
  MapeoCompetenciasRecord,
  NivelCompromiso,
  NivelCompromisoItem,
  SummaryMetric,
} from "../MapeoCompetencias.types";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  buildCsvLikeExcel,
  downloadTextFile,
  enrichMapeoRecords,
  getSemesterId,
  printMapeoCompetenciasPdf,
} from "../MapeoCompetencias.utils";
import { useMapeoCompetenciasData } from "./useMapeoCompetenciasData";

function buildCreatePath(role: string, programaId?: string, planId?: string) {
  const params = new URLSearchParams({ role });
  if (programaId) params.set("programaId", programaId);
  if (planId) params.set("planId", planId);
  return buildRouteWithSearch(ROUTES.panelMapeoCompetenciasCrear, params);
}

function buildEditPath(role: string, record: MapeoCompetenciasEnriched) {
  const params = new URLSearchParams({ role, id: record.id, programaId: record.programaId, planId: record.planId });
  return buildRouteWithSearch(ROUTES.panelMapeoCompetenciasEditar, params);
}

export function useMapeoCompetenciasPage() {
  const data = useMapeoCompetenciasData();
  const { currentUser, catalogs, cursos, competenciasRa, records } = data;
  const permissions = rolePermissions[currentUser.role];
  const [filters, setFilters] = useState<FiltersState>(() => ({
    ...INITIAL_FILTERS,
    seccionalId: currentUser.scope.seccionalId ?? "",
    facultadId: currentUser.scope.facultadId ?? "",
    programaId: currentUser.scope.programaId ?? currentUser.scope.academicProgramId ?? "",
    planId: currentUser.scope.planId ?? "",
  }));
  const [recordToDelete, setRecordToDelete] = useState<MapeoCompetenciasEnriched | null>(null);

  useEffect(() => {
    if (filters.programaId && !filters.planId) {
      const firstActivePlan = catalogs.planes.find(
        (plan) => plan.programaId === filters.programaId && plan.estado === "activo",
      );
      if (firstActivePlan) setFilters((current) => ({ ...current, planId: firstActivePlan.id }));
    }
  }, [catalogs.planes, filters.planId, filters.programaId]);

  const enrichedRecords = useMemo(
    () => enrichMapeoRecords(records, catalogs, cursos, competenciasRa),
    [catalogs, competenciasRa, cursos, records],
  );
  const scopedRecords = useMemo(() => applyRoleScope(enrichedRecords, currentUser), [currentUser, enrichedRecords]);
  const filteredRecords = useMemo(() => applyFilters(scopedRecords, filters), [filters, scopedRecords]);
  const selectedPrograma = useMemo(
    () => catalogs.programas.find((programa) => programa.id === filters.programaId),
    [catalogs.programas, filters.programaId],
  );
  const selectedPlan = useMemo(() => catalogs.planes.find((plan) => plan.id === filters.planId), [catalogs.planes, filters.planId]);
  const selectedRecord = useMemo(
    () => scopedRecords.find((record) => record.programaId === filters.programaId && record.planId === filters.planId) ?? null,
    [filters.planId, filters.programaId, scopedRecords],
  );

  const canOpenCreate =
    permissions.canCreate &&
    currentUser.role === "director" &&
    selectedPrograma?.estado === "activo" &&
    selectedPlan?.estado === "activo" &&
    Boolean(filters.programaId && filters.planId) &&
    !selectedRecord;
  const canOpenEdit =
    permissions.canUpdate &&
    currentUser.role === "director" &&
    selectedRecord?.programaEstado === "activo" &&
    selectedRecord?.planEstado === "activo";

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    const activeRecord = selectedRecord ?? filteredRecords[0];
    const allSemesters = filteredRecords.flatMap((record) => record.semestresResumen);
    const semestresClasificados = allSemesters.filter((semestre) => Boolean(semestre.nucleo)).length;
    const competenciasMapeadas = new Set(
      filteredRecords.flatMap((record) => (record.nivelesCompromiso ?? []).map((nivel) => nivel.competenciaId)),
    ).size;
    const cursosConAsignacion = new Set(
      filteredRecords.flatMap((record) => (record.nivelesCompromiso ?? []).map((nivel) => nivel.cursoId)),
    ).size;
    const semestresPendientes = allSemesters.filter(
      (semestre) => semestre.estado === "pendiente" || semestre.estado === "en-progreso",
    ).length;

    return [
      { label: "Semestres clasificados", value: semestresClasificados, helper: activeRecord ? "Núcleos guardados por programa y plan." : "Selecciona un programa y plan para ver datos.", variant: "info" },
      { label: "Competencias mapeadas", value: competenciasMapeadas, helper: "Competencias con al menos un nivel I-R-A-NA.", variant: "success" },
      { label: "Cursos con asignación", value: cursosConAsignacion, helper: "Cursos con niveles definidos en la matriz.", variant: "accent" },
      { label: "Semestres pendientes", value: semestresPendientes, helper: "Semestres sin clasificación o con matriz incompleta. Los clasificados sin cursos no quedan en progreso.", variant: semestresPendientes ? "warning" : "success" },
    ];
  }, [filteredRecords, selectedRecord]);

  const handleCreate = () => {
    window.location.href = buildCreatePath(currentUser.role, filters.programaId, filters.planId);
  };

  const handleEdit = (record: MapeoCompetenciasEnriched) => {
    window.location.href = buildEditPath(currentUser.role, record);
  };

  const handleExportExcel = () => {
    downloadTextFile("mapeo-competencias.csv", buildCsvLikeExcel(filteredRecords), "text/csv;charset=utf-8");
  };

  const handleExportPdf = () => {
    printMapeoCompetenciasPdf(filteredRecords);
  };

  const confirmDelete = () => {
    if (!recordToDelete) return;
    mockBackend.remove<MapeoCompetenciasRecord>("mapeosCompetencias", recordToDelete.id, currentUser);
    setRecordToDelete(null);
  };

  const handleNivelChange = useCallback(
    (recordId: string, cursoId: string, competenciaId: string, nivel: NivelCompromiso | "") => {
      const record = records.find((r) => r.id === recordId);
      if (!record) return;

      const curso = cursos.find((c) => c.id === cursoId);
      const competencia = competenciasRa.find((c) => c.id === competenciaId) as CompetenciaRaDemoRecord | undefined;
      if (!curso || !competencia) return;

      const semestreClasificado = record.semestresClasificados.find(
        (s) => s.semestreNumero === curso.semestre,
      );
      if (!semestreClasificado?.nucleo) return;

      const updatedNiveles: NivelCompromisoItem[] = record.nivelesCompromiso.filter(
        (n) => !(n.cursoId === cursoId && n.competenciaId === competenciaId),
      );

      if (nivel) {
        updatedNiveles.push({
          programaId: record.programaId,
          planId: record.planId,
          semestreId: getSemesterId(record.planId, curso.semestre),
          semestreNumero: curso.semestre,
          nucleo: semestreClasificado.nucleo,
          cursoId,
          cursoNombre: curso.nombre,
          cursoCodigo: curso.codigo,
          competenciaId,
          competenciaNombre: competencia.nombre ?? "",
          nivelCompromiso: nivel,
        });
      }

      const updatedRecord: MapeoCompetenciasRecord = {
        ...record,
        nivelesCompromiso: updatedNiveles,
        updatedAt: new Date().toISOString(),
      };

      mockBackend.upsert<MapeoCompetenciasRecord>("mapeosCompetencias", updatedRecord, currentUser);
    },
    [currentUser, records, cursos, competenciasRa],
  );

  return {
    currentUser,
    catalogs,
    competenciasRa,
    permissions,
    filters,
    filteredRecords,
    selectedPrograma,
    selectedPlan,
    selectedRecord,
    canOpenCreate,
    canOpenEdit,
    summaryMetrics,
    recordToDelete,
    setFilters,
    setRecordToDelete,
    handleCreate,
    handleEdit,
    handleExportExcel,
    handleExportPdf,
    handleNivelChange,
    confirmDelete,
  };
}
