import { useEffect, useMemo, useState } from "react";
import { ROUTES, buildRouteWithSearch } from "../../../../app/appRoutes";
import { canManageMapeo, getManageDisabledReason, rolePermissions } from "../MapeoCompetencias.permissions";
import type { MapeoCompetenciasFilters as FiltersState, MapeoCompetenciasRecord } from "../MapeoCompetencias.types";
import {
  INITIAL_FILTERS,
  buildSemesterNumbers,
  getCompetenciasByProgramPlan,
  getCursosByProgramPlan,
  getDefaultLugarBySeccional,
  getMappingKey,
  getProgramaEstado,
  getTotalSemestersForPlan,
} from "../MapeoCompetencias.utils";
import { useMapeoCompetenciasData } from "./useMapeoCompetenciasData";
import { useMapeoCompetenciasManager } from "./useMapeoCompetenciasManager";

function readInitialFilters() {
  const params = new URLSearchParams(window.location.search);
  return { id: params.get("id") ?? "", programaId: params.get("programaId") ?? "", planId: params.get("planId") ?? "" };
}

export function navigateToMapeoList(role: string) {
  window.location.assign(buildRouteWithSearch(ROUTES.panelMapeoCompetencias, { role }));
}

export function useMapeoCompetenciasCreatePage() {
  const { currentUser, catalogs, cursos, competenciasRa, records } = useMapeoCompetenciasData();
  const permissions = rolePermissions[currentUser.role];
  const initial = useMemo(() => readInitialFilters(), []);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    ...INITIAL_FILTERS,
    seccionalId: currentUser.scope.seccionalId ?? "",
    facultadId: currentUser.scope.facultadId ?? "",
    programaId: initial.programaId || currentUser.scope.programaId || currentUser.scope.academicProgramId || "",
    planId: initial.planId || currentUser.scope.planId || "",
  }));

  useEffect(() => {
    if (filters.programaId && !filters.planId) {
      const firstActivePlan = catalogs.planes.find((plan) => plan.programaId === filters.programaId && plan.estado === "activo");
      if (firstActivePlan) setFilters((current) => ({ ...current, planId: firstActivePlan.id }));
    }
  }, [catalogs.planes, filters.planId, filters.programaId]);

  const selectedPrograma = useMemo(
    () => catalogs.programas.find((programa) => programa.id === filters.programaId),
    [catalogs.programas, filters.programaId],
  );
  const selectedPlan = useMemo(() => catalogs.planes.find((plan) => plan.id === filters.planId), [catalogs.planes, filters.planId]);
  const programaEstado = getProgramaEstado(selectedPrograma, selectedPlan);
  const canManage = canManageMapeo(currentUser.role, programaEstado);
  const disabledReason = getManageDisabledReason(currentUser.role, programaEstado);

  const existingRecord = useMemo<MapeoCompetenciasRecord | null>(() => {
    if (initial.id) return records.find((record) => record.id === initial.id) ?? null;
    return records.find((record) => record.programaId === filters.programaId && record.planId === filters.planId) ?? null;
  }, [filters.planId, filters.programaId, initial.id, records]);

  const cursosPlan = useMemo(
    () => getCursosByProgramPlan(cursos, filters.programaId, filters.planId),
    [cursos, filters.planId, filters.programaId],
  );
  const competenciasPlan = useMemo(
    () => getCompetenciasByProgramPlan(competenciasRa, filters.programaId, filters.planId),
    [competenciasRa, filters.planId, filters.programaId],
  );

  const selectedFacultadId = selectedPrograma?.facultadId ?? filters.facultadId;
  const selectedSeccionalId = selectedPrograma?.seccionalId ?? filters.seccionalId;
  const selectedLugarId = filters.lugarId || getDefaultLugarBySeccional(selectedSeccionalId, catalogs.lugares);
  const totalSemestres = useMemo(
    () => getTotalSemestersForPlan(selectedPlan, cursosPlan, existingRecord),
    [cursosPlan, existingRecord, selectedPlan],
  );

  const manager = useMapeoCompetenciasManager({
    currentUser,
    existingRecord,
    seccionalId: selectedSeccionalId,
    facultadId: selectedFacultadId,
    lugarId: selectedLugarId,
    programaId: filters.programaId,
    planId: filters.planId,
    cursos: cursosPlan,
    competencias: competenciasPlan,
    canManage,
    totalSemestres,
  });

  const coursesBySemester = useMemo(() => {
    return buildSemesterNumbers(totalSemestres).reduce<Record<number, typeof cursosPlan>>((grouped, semester) => {
      grouped[semester] = cursosPlan.filter((curso) => curso.semestre === semester);
      return grouped;
    }, {});
  }, [cursosPlan, totalSemestres]);

  const completedStepIds = useMemo(() => {
    const completed: string[] = [];
    if (manager.classificationComplete) completed.push("nucleos");
    if (manager.levelMappingComplete) completed.push("mapeo");
    return completed;
  }, [manager.classificationComplete, manager.levelMappingComplete]);

  const activeSemesterAssignedCount = useMemo(() => {
    const cursosSemestre = coursesBySemester[manager.activeSemester] ?? [];
    return cursosSemestre.reduce(
      (count, curso) => count + competenciasPlan.filter((competencia) => Boolean(manager.nivelesDraft[getMappingKey(curso.id, competencia.id)])).length,
      0,
    );
  }, [competenciasPlan, coursesBySemester, manager.activeSemester, manager.nivelesDraft]);

  const activeSemesterTotalCount = (coursesBySemester[manager.activeSemester]?.length ?? 0) * competenciasPlan.length;

  const handleGoBack = () => {
    if (!canManage) {
      navigateToMapeoList(currentUser.role);
      return;
    }
    manager.setShowExitConfirm(true);
  };

  const handleFinish = () => {
    const record = manager.tryFinish();
    if (record) navigateToMapeoList(currentUser.role);
  };

  return {
    currentUser,
    catalogs,
    permissions,
    filters,
    setFilters,
    selectedPrograma,
    selectedPlan,
    existingRecord,
    cursosPlan,
    competenciasPlan,
    canManage,
    disabledReason,
    totalSemestres,
    manager,
    coursesBySemester,
    completedStepIds,
    activeSemesterAssignedCount,
    activeSemesterTotalCount,
    handleGoBack,
    handleFinish,
  };
}
