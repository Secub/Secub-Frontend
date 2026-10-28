import { useCallback, useEffect, useMemo, useState } from "react";
import { getAsignarRaPermissions } from "../../../../config/access/permissions";
import type { MeasurementCycleRecord } from "../AsignarRA.types";
import type { CicloCatalogs } from "../../ciclo/ciclo.types";
import { getCycleCourses } from "../AsignarRA.utils";
import type { CurrentUser } from "../../../../services/auth/currentUser";

interface UseAsignarRAFiltersParams {
  currentUser: CurrentUser;
  cyclesSource: MeasurementCycleRecord[];
  academicCatalogs: CicloCatalogs;
  resetFeedback: () => void;
}

export function useAsignarRAFilters({ currentUser, cyclesSource, academicCatalogs, resetFeedback }: UseAsignarRAFiltersParams) {
  const { scope } = currentUser;
  const [selectedSeccionalId, setSelectedSeccionalId] = useState(() => scope.seccionalId ?? "");
  const [selectedFacultadId, setSelectedFacultadId] = useState(() => scope.facultadId ?? "");
  const [selectedProgramId, setSelectedProgramId] = useState(
    () => scope.programaId ?? scope.academicProgramId ?? "",
  );
  const [selectedPlanId, setSelectedPlanId] = useState(() => scope.planId ?? "");
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [courseFilterId, setCourseFilterId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const scopedProgramId = scope.programaId ?? scope.academicProgramId;
  const scopedPlanId = scope.planId;

  const resetCourseFilters = useCallback(() => {
    setCourseFilterId("");
    setSelectedCourseId("");
  }, []);

  const seccionalOptions = useMemo(
    () =>
      academicCatalogs.seccionales
        .filter((seccional) => (scope.seccionalId ? seccional.id === scope.seccionalId : true))
        .map((seccional) => ({ label: seccional.nombre, value: seccional.id })),
    [academicCatalogs.seccionales, scope.seccionalId],
  );

  const facultadOptions = useMemo(
    () =>
      academicCatalogs.facultades
        .filter((facultad) => {
          if (scope.facultadId && facultad.id !== scope.facultadId) return false;
          if (scope.seccionalId && facultad.seccionalId !== scope.seccionalId) return false;
          if (selectedSeccionalId && facultad.seccionalId !== selectedSeccionalId) return false;
          return true;
        })
        .map((facultad) => ({ label: facultad.nombre, value: facultad.id })),
    [academicCatalogs.facultades, scope.facultadId, scope.seccionalId, selectedSeccionalId],
  );

  const programOptions = useMemo(() => {
    return academicCatalogs.programas
      .filter((program) => {
        if (scopedProgramId && program.id !== scopedProgramId) return false;
        if (scope.seccionalId && program.seccionalId !== scope.seccionalId) return false;
        if (scope.facultadId && program.facultadId !== scope.facultadId) return false;
        if (selectedSeccionalId && program.seccionalId !== selectedSeccionalId) return false;
        if (selectedFacultadId && program.facultadId !== selectedFacultadId) return false;
        return true;
      })
      .map((program) => ({ label: program.nombre, value: program.id }));
  }, [academicCatalogs.programas, scope.facultadId, scope.seccionalId, scopedProgramId, selectedFacultadId, selectedSeccionalId]);

  const planOptions = useMemo(() => {
    return academicCatalogs.planes
      .filter((plan) => {
        if (scopedPlanId && plan.id !== scopedPlanId) return false;
        if (selectedProgramId && plan.programaId !== selectedProgramId) return false;
        return true;
      })
      .map((plan) => ({ label: plan.estado === "inactivo" ? `${plan.nombre} (Inactivo)` : plan.nombre, value: plan.id }));
  }, [academicCatalogs.planes, scopedPlanId, selectedProgramId]);

  const cycles = useMemo(() => {
    return cyclesSource.filter((cycle) => {
      if (selectedSeccionalId && cycle.seccionalId !== selectedSeccionalId) return false;
      if (selectedFacultadId && cycle.facultadId !== selectedFacultadId) return false;
      if (selectedProgramId && cycle.programaId !== selectedProgramId) return false;
      if (selectedPlanId && cycle.planId !== selectedPlanId) return false;
      return true;
    });
  }, [cyclesSource, selectedFacultadId, selectedPlanId, selectedProgramId, selectedSeccionalId]);

  useEffect(() => {
    if (!selectedCycleId && cycles.length === 1) {
      const onlyCycle = cycles[0];
      setSelectedCycleId(onlyCycle.id);
      setSelectedSeccionalId(onlyCycle.seccionalId ?? selectedSeccionalId);
      setSelectedFacultadId(onlyCycle.facultadId ?? selectedFacultadId);
      setSelectedProgramId(onlyCycle.programaId ?? selectedProgramId);
      setSelectedPlanId(onlyCycle.planId ?? selectedPlanId);
      return;
    }

    if (selectedCycleId && !cycles.some((cycle) => cycle.id === selectedCycleId)) {
      const nextCycle = cycles.length === 1 ? cycles[0] : undefined;
      setSelectedCycleId(nextCycle?.id ?? "");
      resetCourseFilters();
    }
  }, [cycles, resetCourseFilters, selectedCycleId, selectedFacultadId, selectedPlanId, selectedProgramId, selectedSeccionalId]);

  const selectedCycle = useMemo(() => cycles.find((cycle) => cycle.id === selectedCycleId), [cycles, selectedCycleId]);
  const courses = useMemo(() => getCycleCourses(selectedCycle), [selectedCycle]);
  const courseOptions = useMemo(
    () => courses.map((course) => ({ label: `${course.codigo} · ${course.nombre}`, value: course.id })),
    [courses],
  );
  const cycleOptions = useMemo(
    () =>
      cycles.map((cycle) => ({
        label: `${cycle.nombre ?? cycle.periodo ?? "Ciclo de medición"}${cycle.estado && cycle.estado !== "activo" ? ` (${cycle.estado})` : ""}`,
        value: cycle.id,
      })),
    [cycles],
  );

  const handleSeccionalChange = (value: string) => {
    resetFeedback();
    setSelectedSeccionalId(value);
    setSelectedFacultadId("");
    setSelectedProgramId("");
    setSelectedPlanId("");
    setSelectedCycleId("");
    resetCourseFilters();
  };

  const handleFacultadChange = (value: string) => {
    resetFeedback();
    setSelectedFacultadId(value);
    setSelectedProgramId("");
    setSelectedPlanId("");
    setSelectedCycleId("");
    resetCourseFilters();
  };

  const handleProgramChange = (value: string) => {
    resetFeedback();
    const program = academicCatalogs.programas.find((item) => item.id === value);
    setSelectedProgramId(value);
    setSelectedPlanId("");
    setSelectedCycleId("");
    resetCourseFilters();

    if (program) {
      setSelectedSeccionalId(program.seccionalId);
      setSelectedFacultadId(program.facultadId);
    }
  };

  const handlePlanChange = (value: string) => {
    resetFeedback();
    setSelectedPlanId(value);
    setSelectedCycleId("");
    resetCourseFilters();
  };

  const handleCycleChange = (value: string) => {
    resetFeedback();
    const cycle = cycles.find((item) => item.id === value);
    setSelectedCycleId(value);
    resetCourseFilters();

    if (cycle) {
      setSelectedSeccionalId(cycle.seccionalId ?? selectedSeccionalId);
      setSelectedFacultadId(cycle.facultadId ?? selectedFacultadId);
      setSelectedProgramId(cycle.programaId ?? selectedProgramId);
      setSelectedPlanId(cycle.planId ?? selectedPlanId);
    }
  };

  const handleCourseFilterChange = (value: string) => {
    resetFeedback();
    setCourseFilterId(value);
    setSelectedCourseId(value);
  };

  const handleResetFilters = () => {
    resetFeedback();
    setSelectedSeccionalId(scope.seccionalId ?? "");
    setSelectedFacultadId(scope.facultadId ?? "");
    setSelectedProgramId(scopedProgramId ?? "");
    setSelectedPlanId(scopedPlanId ?? "");
    setSelectedCycleId("");
    resetCourseFilters();
  };

  return {
    filters: { selectedSeccionalId, selectedFacultadId, selectedProgramId, selectedPlanId, selectedCycleId, courseFilterId },
    filterOptions: { seccionalOptions, facultadOptions, programOptions, planOptions, cycleOptions, courseOptions },
    filterLocks: {
      isSeccionalLocked: Boolean(scope.seccionalId),
      isFacultadLocked: Boolean(scope.facultadId),
      isProgramLocked: Boolean(scopedProgramId),
      isPlanLocked: Boolean(scopedPlanId),
      showSeccionalFilter: getAsignarRaPermissions(currentUser.role).canFilterBySeccional,
      showFacultadFilter: getAsignarRaPermissions(currentUser.role).canFilterByFacultad,
    },
    cycles,
    selectedCycle,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    resetCourseFilters,
    handleSeccionalChange,
    handleFacultadChange,
    handleProgramChange,
    handlePlanChange,
    handleCycleChange,
    handleCourseFilterChange,
    handleResetFilters,
  };
}
