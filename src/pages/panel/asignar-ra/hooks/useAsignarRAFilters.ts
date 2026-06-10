import { useCallback, useEffect, useMemo, useState } from "react";
import {
  canFilterByFacultad,
  canFilterBySeccional,
} from "../AsignarRA.permissions";
import type { CicloDemoRecord } from "../AsignarRA.types";
import { getCycleCourses } from "../AsignarRA.utils";
import { asignarRAAcademicCatalogs as academicCatalogs, asignarRACurrentUser as currentUser } from "./asignarRA.shared";

interface UseAsignarRAFiltersParams {
  cyclesSource: CicloDemoRecord[];
  resetFeedback: () => void;
}

export function useAsignarRAFilters({ cyclesSource, resetFeedback }: UseAsignarRAFiltersParams) {
  const [selectedSeccionalId, setSelectedSeccionalId] = useState(() => currentUser.scope.seccionalId ?? "");
  const [selectedFacultadId, setSelectedFacultadId] = useState(() => currentUser.scope.facultadId ?? "");
  const [selectedProgramId, setSelectedProgramId] = useState(
    () => currentUser.scope.programaId ?? currentUser.scope.academicProgramId ?? "",
  );
  const [selectedPlanId, setSelectedPlanId] = useState(() => currentUser.scope.planId ?? "");
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [courseFilterId, setCourseFilterId] = useState("");
  const [courseSearchTerm, setCourseSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const scopedProgramId = currentUser.scope.programaId ?? currentUser.scope.academicProgramId;
  const scopedPlanId = currentUser.scope.planId;

  const resetCourseFilters = useCallback(() => {
    setCourseFilterId("");
    setCourseSearchTerm("");
    setSelectedCourseId("");
  }, []);

  const seccionalOptions = useMemo(
    () =>
      academicCatalogs.seccionales
        .filter((seccional) => (currentUser.scope.seccionalId ? seccional.id === currentUser.scope.seccionalId : true))
        .map((seccional) => ({ label: seccional.nombre, value: seccional.id })),
    [],
  );

  const facultadOptions = useMemo(
    () =>
      academicCatalogs.facultades
        .filter((facultad) => {
          if (currentUser.scope.facultadId && facultad.id !== currentUser.scope.facultadId) return false;
          if (currentUser.scope.seccionalId && facultad.seccionalId !== currentUser.scope.seccionalId) return false;
          if (selectedSeccionalId && facultad.seccionalId !== selectedSeccionalId) return false;
          return true;
        })
        .map((facultad) => ({ label: facultad.nombre, value: facultad.id })),
    [selectedSeccionalId],
  );

  const programOptions = useMemo(() => {
    return academicCatalogs.programas
      .filter((program) => {
        if (scopedProgramId && program.id !== scopedProgramId) return false;
        if (currentUser.scope.seccionalId && program.seccionalId !== currentUser.scope.seccionalId) return false;
        if (currentUser.scope.facultadId && program.facultadId !== currentUser.scope.facultadId) return false;
        if (selectedSeccionalId && program.seccionalId !== selectedSeccionalId) return false;
        if (selectedFacultadId && program.facultadId !== selectedFacultadId) return false;
        return true;
      })
      .map((program) => ({ label: program.nombre, value: program.id }));
  }, [scopedProgramId, selectedFacultadId, selectedSeccionalId]);

  const planOptions = useMemo(() => {
    return academicCatalogs.planes
      .filter((plan) => {
        if (scopedPlanId && plan.id !== scopedPlanId) return false;
        if (selectedProgramId && plan.programaId !== selectedProgramId) return false;
        return true;
      })
      .map((plan) => ({ label: plan.estado === "inactivo" ? `${plan.nombre} (Inactivo)` : plan.nombre, value: plan.id }));
  }, [scopedPlanId, selectedProgramId]);

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

  return {
    filters: { selectedSeccionalId, selectedFacultadId, selectedProgramId, selectedPlanId, selectedCycleId, courseFilterId, courseSearchTerm },
    filterOptions: { seccionalOptions, facultadOptions, programOptions, planOptions, cycleOptions, courseOptions },
    filterLocks: {
      isSeccionalLocked: Boolean(currentUser.scope.seccionalId),
      isFacultadLocked: Boolean(currentUser.scope.facultadId),
      isProgramLocked: Boolean(scopedProgramId),
      isPlanLocked: Boolean(scopedPlanId),
      showSeccionalFilter: canFilterBySeccional(currentUser),
      showFacultadFilter: canFilterByFacultad(currentUser),
    },
    cycles,
    selectedCycle,
    courses,
    selectedCourseId,
    setSelectedCourseId,
    setCourseSearchTerm,
    resetCourseFilters,
    handleSeccionalChange,
    handleFacultadChange,
    handleProgramChange,
    handlePlanChange,
    handleCycleChange,
    handleCourseFilterChange,
  };
}
