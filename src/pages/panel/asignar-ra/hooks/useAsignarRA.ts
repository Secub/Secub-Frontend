import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isAcademicWorkflowStepLocked,
} from "../../../../components/panel";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend, subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import { getCatalogs } from "../../competencias-ra/CompetenciasRa.mock";
import type { CursoSintesis } from "../../ciclo/ciclo.types";
import {
  canDeleteAsignarRA,
  canFilterByFacultad,
  canFilterBySeccional,
  canManageAsignarRA,
  canReadAsignarRA,
} from "../AsignarRA.permissions";
import type {
  AsignacionRaRecord,
  AsignarRACourseRow,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  DraftSelections,
  MapeoDemoRecord,
  MedicionRaRecord,
} from "../AsignarRA.types";
import {
  areArraysEqual,
  buildDraftSelections,
  buildSummaryMetrics,
  getAssignmentCompetenciaId,
  getAssignmentCourseId,
  getAssignmentId,
  getAssignmentRaId,
  getCompetenciaLabel,
  getCompetenciasForCycle,
  getCourseCompetencias,
  getCycleCourses,
  getLearningResults,
  getMappedCompetenceIdsForCourse,
  getUniqueAssignmentCount,
  hasMeasurementForAssignment,
  resolveCourseDocente,
} from "../AsignarRA.utils";

const currentUser = getCurrentMockUser();
const academicCatalogs = getCatalogs();

export function useAsignarRA() {
  const [records, setRecords] = useState<AsignacionRaRecord[]>(() =>
    mockBackend.list<AsignacionRaRecord>("asignacionesRa", currentUser),
  );
  const [measurements, setMeasurements] = useState<MedicionRaRecord[]>(() =>
    mockBackend.list<MedicionRaRecord>("medicionesRa", currentUser),
  );
  const [cyclesSource, setCyclesSource] = useState<CicloDemoRecord[]>(() =>
    mockBackend.list<CicloDemoRecord>("ciclosMedicion", currentUser),
  );
  const [competenciasSource, setCompetenciasSource] = useState<CompetenciaRaDemoRecord[]>(() =>
    mockBackend.list<CompetenciaRaDemoRecord>("competenciasRa", currentUser),
  );
  const [mapeosSource, setMapeosSource] = useState<MapeoDemoRecord[]>(() =>
    mockBackend.list<MapeoDemoRecord>("mapeosCompetencias", currentUser),
  );

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
  const [draftSelections, setDraftSelections] = useState<DraftSelections>({});
  const [expandedCompetenciaIds, setExpandedCompetenciaIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showMeasuredConfirm, setShowMeasuredConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveCourseConfirm, setShowLeaveCourseConfirm] = useState(false);

  const filtersRef = useRef<HTMLDivElement | null>(null);
  const coursesRef = useRef<HTMLDivElement | null>(null);
  const assignmentPanelRef = useRef<HTMLDivElement | null>(null);

  const isStepLocked = isAcademicWorkflowStepLocked("asignar-ra");
  const canRead = canReadAsignarRA(currentUser);
  const canManage = canManageAsignarRA(currentUser);
  const canDelete = canDeleteAsignarRA(currentUser);

  const scopedProgramId = currentUser.scope.programaId ?? currentUser.scope.academicProgramId;
  const scopedPlanId = currentUser.scope.planId;
  const isSeccionalLocked = Boolean(currentUser.scope.seccionalId);
  const isFacultadLocked = Boolean(currentUser.scope.facultadId);
  const isProgramLocked = Boolean(scopedProgramId);
  const isPlanLocked = Boolean(scopedPlanId);
  const showSeccionalFilter = canFilterBySeccional(currentUser);
  const showFacultadFilter = canFilterByFacultad(currentUser);

  const resetCourseFilters = useCallback(() => {
    setCourseFilterId("");
    setCourseSearchTerm("");
    setSelectedCourseId("");
  }, []);

  const resetFeedback = useCallback(() => {
    setFeedback("");
    setErrorMessage("");
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
      .map((plan) => ({
        label: plan.estado === "inactivo" ? `${plan.nombre} (Inactivo)` : plan.nombre,
        value: plan.id,
      }));
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

  const selectedCycle = useMemo(
    () => cycles.find((cycle) => cycle.id === selectedCycleId),
    [cycles, selectedCycleId],
  );

  const cycleOptions = useMemo(
    () =>
      cycles.map((cycle) => ({
        label: `${cycle.nombre ?? cycle.periodo ?? "Ciclo de medición"}${
          cycle.estado && cycle.estado !== "activo" ? ` (${cycle.estado})` : ""
        }`,
        value: cycle.id,
      })),
    [cycles],
  );

  const courses = useMemo(() => getCycleCourses(selectedCycle), [selectedCycle]);

  const courseOptions = useMemo(
    () =>
      courses.map((course) => ({
        label: `${course.codigo} · ${course.nombre}`,
        value: course.id,
      })),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedSearch = courseSearchTerm.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSelect = courseFilterId ? course.id === courseFilterId : true;
      const matchesSearch = normalizedSearch
        ? `${course.codigo} ${course.nombre} ${course.docente}`.toLowerCase().includes(normalizedSearch)
        : true;

      return matchesSelect && matchesSearch;
    });
  }, [courseFilterId, courseSearchTerm, courses]);

  const summaryMetrics = useMemo(
    () => buildSummaryMetrics(courses, records, selectedCycleId),
    [courses, records, selectedCycleId],
  );

  useEffect(() => {
    if (!selectedCourseId) return;

    if (!courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId("");
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const allCompetencias = useMemo(
    () => getCompetenciasForCycle(competenciasSource, selectedCycle),
    [competenciasSource, selectedCycle],
  );

  const courseCompetencias = useMemo(
    () => getCourseCompetencias(selectedCourse, selectedCycle, allCompetencias, mapeosSource),
    [allCompetencias, mapeosSource, selectedCourse, selectedCycle],
  );

  const selectedCourseAssignments = useMemo(() => {
    if (!selectedCycle || !selectedCourse) return [];

    return records.filter(
      (record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === selectedCourse.id,
    );
  }, [records, selectedCourse, selectedCycle]);

  const hasAnyAssignmentInCycle = useMemo(
    () => Boolean(selectedCycleId && records.some((record) => record.cicloId === selectedCycleId)),
    [records, selectedCycleId],
  );

  const isCurrentCycleAssignmentComplete = useMemo(() => {
    if (!selectedCycle || !courses.length) return false;

    return courses.every((course) => {
      const mappedCompetenceIds = getMappedCompetenceIdsForCourse(course.id, selectedCycle, mapeosSource);
      if (mappedCompetenceIds.size === 0) return false;

      const requiredCompetencias = allCompetencias.filter((competencia) => mappedCompetenceIds.has(competencia.id));
      if (!requiredCompetencias.length) return false;

      return requiredCompetencias.every((competencia) =>
        records.some(
          (record) =>
            record.cicloId === selectedCycle.id &&
            getAssignmentCourseId(record) === course.id &&
            getAssignmentCompetenciaId(record) === competencia.id &&
            Boolean(getAssignmentRaId(record)),
        ),
      );
    });
  }, [allCompetencias, courses, mapeosSource, records, selectedCycle]);

  useEffect(() => {
    const nextDraft = buildDraftSelections(courseCompetencias, selectedCourseAssignments);
    setDraftSelections(nextDraft);
    setExpandedCompetenciaIds(courseCompetencias.map((competencia) => competencia.id));
  }, [courseCompetencias, selectedCourseAssignments]);

  const refreshBackendState = useCallback(() => {
    setRecords(mockBackend.list<AsignacionRaRecord>("asignacionesRa", currentUser));
    setMeasurements(mockBackend.list<MedicionRaRecord>("medicionesRa", currentUser));
    setCyclesSource(mockBackend.list<CicloDemoRecord>("ciclosMedicion", currentUser));
    setCompetenciasSource(mockBackend.list<CompetenciaRaDemoRecord>("competenciasRa", currentUser));
    setMapeosSource(mockBackend.list<MapeoDemoRecord>("mapeosCompetencias", currentUser));
  }, []);

  useEffect(() => {
    refreshBackendState();

    return subscribeToMockBackendChanges(refreshBackendState);
  }, [refreshBackendState]);

  const scrollToCourses = useCallback(() => {
    window.requestAnimationFrame(() => {
      coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  function discardDraftAndReturnToCourses() {
    resetFeedback();
    setDraftSelections(buildDraftSelections(courseCompetencias, selectedCourseAssignments));
    setSelectedCourseId("");
    setShowLeaveCourseConfirm(false);
    scrollToCourses();
  }

  function handleBackToCourses() {
    resetFeedback();

    if (hasUnsavedChanges()) {
      setShowLeaveCourseConfirm(true);
      return;
    }

    setSelectedCourseId("");
    scrollToCourses();
  }

  const removeAssignmentAndMeasurements = useCallback((assignmentId: string) => {
    mockBackend
      .list<MedicionRaRecord>("medicionesRa", currentUser)
      .filter((measurement) => measurement.asignacionRaId === assignmentId || measurement.asignacionRaIds?.includes(assignmentId))
      .forEach((measurement) => mockBackend.remove<MedicionRaRecord>("medicionesRa", measurement.id, currentUser));

    mockBackend.remove<AsignacionRaRecord>("asignacionesRa", assignmentId, currentUser);
  }, []);

  const getCourseAssignments = useCallback(
    (courseId: string) => {
      if (!selectedCycle) return [];
      return records.filter((record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === courseId);
    },
    [records, selectedCycle],
  );

  const getCourseStatus = useCallback(
    (courseId: string) => {
      const courseAssignments = getCourseAssignments(courseId);

      if (!courseAssignments.length) {
        return { label: "Pendiente" as const, variant: "warning" as const };
      }

      const allMeasured = courseAssignments.every((record) => hasMeasurementForAssignment(measurements, record.id));
      return allMeasured
        ? { label: "Medido" as const, variant: "success" as const }
        : { label: "Pendiente" as const, variant: "warning" as const };
    },
    [getCourseAssignments, measurements],
  );

  const getRaAssignment = useCallback(
    (competenciaId: string, raId: string) => {
      return selectedCourseAssignments.find(
        (record) => getAssignmentCompetenciaId(record) === competenciaId && getAssignmentRaId(record) === raId,
      );
    },
    [selectedCourseAssignments],
  );

  const isRaSelected = useCallback(
    (competenciaId: string, raId: string) => Boolean(draftSelections[competenciaId]?.includes(raId)),
    [draftSelections],
  );

  const hasUnsavedChanges = useCallback(() => {
    return courseCompetencias.some((competencia) => {
      const originalRaIds = selectedCourseAssignments
        .filter((record) => getAssignmentCompetenciaId(record) === competencia.id)
        .map(getAssignmentRaId)
        .filter(Boolean);
      const draftRaIds = draftSelections[competencia.id] ?? [];
      return !areArraysEqual(originalRaIds, draftRaIds);
    });
  }, [courseCompetencias, draftSelections, selectedCourseAssignments]);

  function validateRequiredFilters() {
    if (!selectedProgramId) return "Selecciona un programa académico para continuar.";
    if (!selectedPlanId) return "Selecciona un plan de estudios para continuar.";
    if (!selectedCycle) return "Selecciona el ciclo de medición o periodo académico que vas a trabajar.";
    if (!courses.length) return "El ciclo seleccionado no tiene cursos de Síntesis disponibles.";
    if (!selectedCourse) return "Selecciona un curso de Síntesis para asignar RA.";
    if (selectedCourse.nucleo !== "Síntesis") return "Solo se pueden asignar RA a cursos de Síntesis.";
    if (!courseCompetencias.length) return "El curso seleccionado no tiene competencias asociadas. Revisa el Mapeo de Competencias.";
    if (!canManage) return "Solo el Director de Programa puede guardar asignaciones RA.";
    return "";
  }

  function validateDraftSelections() {
    const filterValidation = validateRequiredFilters();
    if (filterValidation) return filterValidation;

    for (const [index, competencia] of courseCompetencias.entries()) {
      const selectedRaIds = draftSelections[competencia.id] ?? [];
      const label = getCompetenciaLabel(competencia, index);

      if (selectedRaIds.length < 1) {
        return `Selecciona al menos 1 RA para la competencia ${label}.`;
      }

      if (selectedRaIds.length > 4) {
        return "Máximo 4 Resultados de Aprendizaje por competencia.";
      }
    }

    return "";
  }

  function getMeasuredAssignmentsThatWouldBeRemoved() {
    if (!selectedCourse || !selectedCycle) return [];

    return selectedCourseAssignments.filter((record) => {
      const competenciaId = getAssignmentCompetenciaId(record);
      const raId = getAssignmentRaId(record);
      const staysSelected = Boolean(draftSelections[competenciaId]?.includes(raId));
      return !staysSelected && hasMeasurementForAssignment(measurements, record.id);
    });
  }

  function toggleRaSelection(competencia: CompetenciaRaDemoRecord, raId?: string) {
    if (!canManage || !raId) return;

    resetFeedback();

    setDraftSelections((current) => {
      const currentRaIds = current[competencia.id] ?? [];
      const isSelected = currentRaIds.includes(raId);

      if (isSelected) {
        return {
          ...current,
          [competencia.id]: currentRaIds.filter((currentRaId) => currentRaId !== raId),
        };
      }

      if (currentRaIds.length >= 4) {
        setErrorMessage("Máximo 4 Resultados de Aprendizaje por competencia.");
        return current;
      }

      return {
        ...current,
        [competencia.id]: [...currentRaIds, raId],
      };
    });
  }

  function persistCourseAssignments() {
    if (!selectedCycle || !selectedCourse) return;

    const now = new Date().toISOString();
    const docente = resolveCourseDocente(selectedCourse);
    const existingAssignments = mockBackend
      .list<AsignacionRaRecord>("asignacionesRa", currentUser)
      .filter((record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === selectedCourse.id);
    const existingById = new Map(existingAssignments.map((record) => [record.id, record]));
    const desiredIds = new Set<string>();

    courseCompetencias.forEach((competencia) => {
      const validRaIds = new Set(getLearningResults(competencia).map((ra) => ra.id).filter(Boolean));
      const selectedRaIds = (draftSelections[competencia.id] ?? []).filter((raId) => validRaIds.has(raId));

      selectedRaIds.forEach((raId) => {
        const assignmentId = getAssignmentId(selectedCycle.id, selectedCourse.id, competencia.id, raId);
        const existingRecord = existingById.get(assignmentId);
        const isMeasured = existingRecord ? hasMeasurementForAssignment(measurements, existingRecord.id) : false;
        desiredIds.add(assignmentId);

        const nextRecord: AsignacionRaRecord = {
          id: assignmentId,
          cicloId: selectedCycle.id,
          periodoId: selectedCycle.periodo,
          cursoId: selectedCourse.id,
          cursoIds: [selectedCourse.id],
          competenciaRaId: competencia.id,
          competenciaRaIds: [competencia.id],
          resultadoAprendizajeId: raId,
          resultadoAprendizajeIds: [raId],
          estado: "activo",
          estadoMedicion: isMeasured ? "medido" : existingRecord?.estadoMedicion ?? "pendiente",
          seccionalId: selectedCycle.seccionalId,
          facultadId: selectedCycle.facultadId,
          programaId: selectedCycle.programaId,
          planId: selectedCycle.planId,
          docenteNombre: docente.nombre,
          docenteId: docente.id,
          docenteEmail: docente.email,
          // TODO: reemplazar resolveCourseDocente por relación curso-docente del backend institucional.
          createdAt: existingRecord?.createdAt ?? now,
          updatedAt: now,
        };

        mockBackend.upsert<AsignacionRaRecord>("asignacionesRa", nextRecord, currentUser);
      });
    });

    existingAssignments
      .filter((record) => !desiredIds.has(record.id))
      .forEach((record) => removeAssignmentAndMeasurements(record.id));

    refreshBackendState();
    setShowMeasuredConfirm(false);
    setFeedback("Asignación guardada correctamente.");
  }

  function handleSaveAssignment() {
    resetFeedback();

    const validationMessage = validateDraftSelections();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      if (!selectedCourse) {
        coursesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const measuredToRemove = getMeasuredAssignmentsThatWouldBeRemoved();
    if (measuredToRemove.length) {
      setShowMeasuredConfirm(true);
      return;
    }

    persistCourseAssignments();
  }

  function handleResetDraft() {
    resetFeedback();
    setDraftSelections(buildDraftSelections(courseCompetencias, selectedCourseAssignments));
    setFeedback("Cambios sin guardar descartados.");
  }

  function handleSelectCourse(courseId: string) {
    resetFeedback();
    setSelectedCourseId(courseId);
    window.requestAnimationFrame(() => {
      assignmentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleDeleteCourseAssignments() {
    if (!selectedCourse || !selectedCycle) return;

    selectedCourseAssignments.forEach((record) => removeAssignmentAndMeasurements(record.id));
    refreshBackendState();
    setShowDeleteConfirm(false);
    setFeedback("Asignación del curso eliminada correctamente. El workflow se recalculó con los datos actuales.");
  }

  function toggleCompetenciaAccordion(competenciaId: string) {
    setExpandedCompetenciaIds((current) =>
      current.includes(competenciaId)
        ? current.filter((id) => id !== competenciaId)
        : [...current, competenciaId],
    );
  }

  function getCourseCompetenceCount(course: CursoSintesis) {
    const mappedCompetenceIds = getMappedCompetenceIdsForCourse(course.id, selectedCycle, mapeosSource);
    return mappedCompetenceIds.size;
  }

  const courseRows = useMemo<AsignarRACourseRow[]>(() => {
    return filteredCourses.map((course) => {
      const assignments = getCourseAssignments(course.id);
      const assignedCount = getUniqueAssignmentCount(assignments);
      const actionLabel = canManage
        ? assignedCount > 0
          ? "Editar asignación"
          : "Asignar RA"
        : "Ver asignación";

      return {
        course,
        assignments,
        status: getCourseStatus(course.id),
        assignedCount,
        competenceCount: getCourseCompetenceCount(course),
        isSelected: selectedCourseId === course.id,
        actionLabel,
      };
    });
  }, [canManage, filteredCourses, getCourseAssignments, getCourseStatus, mapeosSource, selectedCourseId, selectedCycle]);

  function handleSeccionalChange(value: string) {
    resetFeedback();
    setSelectedSeccionalId(value);
    setSelectedFacultadId("");
    setSelectedProgramId("");
    setSelectedPlanId("");
    setSelectedCycleId("");
    resetCourseFilters();
  }

  function handleFacultadChange(value: string) {
    resetFeedback();
    setSelectedFacultadId(value);
    setSelectedProgramId("");
    setSelectedPlanId("");
    setSelectedCycleId("");
    resetCourseFilters();
  }

  function handleProgramChange(value: string) {
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
  }

  function handlePlanChange(value: string) {
    resetFeedback();
    setSelectedPlanId(value);
    setSelectedCycleId("");
    resetCourseFilters();
  }

  function handleCycleChange(value: string) {
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
  }

  function handleCourseFilterChange(value: string) {
    resetFeedback();
    setCourseFilterId(value);
    setSelectedCourseId(value);
  }

  return {
    currentUser,
    academicCatalogs,
    access: {
      currentUser,
      canRead,
      canManage,
      canDelete,
      isStepLocked,
    },
    filters: {
      selectedSeccionalId,
      selectedFacultadId,
      selectedProgramId,
      selectedPlanId,
      selectedCycleId,
      courseFilterId,
      courseSearchTerm,
    },
    filterOptions: {
      seccionalOptions,
      facultadOptions,
      programOptions,
      planOptions,
      cycleOptions,
      courseOptions,
    },
    filterLocks: {
      isSeccionalLocked,
      isFacultadLocked,
      isProgramLocked,
      isPlanLocked,
      showSeccionalFilter,
      showFacultadFilter,
    },
    refs: {
      filtersRef,
      coursesRef,
      assignmentPanelRef,
    },
    records,
    measurements,
    cycles,
    courses,
    filteredCourses,
    courseRows,
    selectedCycle,
    selectedCourse,
    selectedCourseAssignments,
    courseCompetencias,
    draftSelections,
    expandedCompetenciaIds,
    feedback,
    errorMessage,
    showMeasuredConfirm,
    showDeleteConfirm,
    showLeaveCourseConfirm,
    hasAnyAssignmentInCycle,
    isCurrentCycleAssignmentComplete,
    summaryMetrics,
    setCourseSearchTerm,
    setShowMeasuredConfirm,
    setShowDeleteConfirm,
    setShowLeaveCourseConfirm,
    handleSeccionalChange,
    handleFacultadChange,
    handleProgramChange,
    handlePlanChange,
    handleCycleChange,
    handleCourseFilterChange,
    handleSelectCourse,
    handleBackToCourses,
    handleSaveAssignment,
    handleResetDraft,
    handleDeleteCourseAssignments,
    discardDraftAndReturnToCourses,
    persistCourseAssignments,
    toggleCompetenciaAccordion,
    toggleRaSelection,
    getRaAssignment,
    isRaSelected,
    hasUnsavedChanges,
    getCourseStatus,
    getCourseAssignments,
  };
}

export type UseAsignarRAResult = ReturnType<typeof useAsignarRA>;
