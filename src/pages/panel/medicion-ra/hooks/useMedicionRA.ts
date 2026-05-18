import { useEffect, useMemo, useRef, useState } from "react";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import { getCurrentMockUser } from "../../../../services/auth/mockUser";
import { mockBackend, subscribeToMockBackendChanges } from "../../../../services/mockBackend";
import { getCicloCatalogs } from "../../ciclo/ciclo.mock";
import {
  mockCourses,
  mockInitialEvaluations,
  mockInitialInstruments,
} from "../medicion-ra.mock";
import {
  calculateRaResults,
  getCompetenceStorageKey,
  getCompletionPercentage,
  normalizeEvaluationMatrix,
  normalizeInstrumentState,
  validateBeforeClosing,
  validateCourseBeforeFinalizing,
} from "../medicion-ra.utils";
import type {
  Competence,
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  ImprovementPlanState,
  InstrumentByRa,
  PerformanceLevel,
  ValidationFeedback,
} from "../medicion-ra.types";

const emptyEvidence: EvidenceState = {
  fileName: "",
  link: "",
};

const emptyImprovementPlan: ImprovementPlanState = {
  analysis: "",
  actions: "",
};

export const LOCKED_TOOLTIP =
  "Esta información ya fue guardada y bloqueada. No puedes modificarla después de finalizar la evaluación.";

interface MedicionRaDemoState {
  id: string;
  cicloId?: string;
  asignacionRaId?: string;
  asignacionRaIds?: string[];
  selectedCourseId: string;
  activeCompetenceId: string;
  evaluationsByCourse: Record<string, EvaluationMatrix>;
  instrumentsByCourse: Record<string, InstrumentByRa>;
  evidenceByCompetence: Record<string, EvidenceState>;
  improvementByCompetence: Record<string, ImprovementPlanState>;
  completedCompetenceIds: string[];
  isEvaluationLocked: boolean;
  completed: boolean;
  userId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AsignacionRaDemoRecord {
  id: string;
  cicloId?: string;
  cursoId?: string;
  cursoIds?: string[];
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  resultadoAprendizajeId?: string;
  resultadoAprendizajeIds?: string[];
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  docenteId?: string;
  docenteNombre?: string;
  docenteEmail?: string;
}

interface CicloDemoRecord {
  id: string;
  nombre?: string;
  periodo?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
}

interface CompetenciaDemoRecord {
  id: string;
  nombre?: string;
  descripcion?: string;
  resultadosAprendizaje?: Array<{
    id: string;
    numero?: number;
    descripcion?: string;
  }>;
}

const MEDICION_RA_DEMO_STATE_PREFIX = "medicion-ra-demo-state";

function buildMedicionRaDemoStateId({
  userId,
  cicloId,
  courseId,
}: {
  userId: string;
  cicloId?: string;
  courseId?: string;
}) {
  return [MEDICION_RA_DEMO_STATE_PREFIX, userId, cicloId, courseId]
    .filter(Boolean)
    .join("-");
}

function getCourseIdFromAssignment(asignacion: AsignacionRaDemoRecord) {
  return asignacion.cursoId ?? asignacion.cursoIds?.[0] ?? "";
}

function getCompetenciaIdFromAssignment(asignacion: AsignacionRaDemoRecord) {
  return asignacion.competenciaRaId ?? asignacion.competenciaRaIds?.[0] ?? "";
}

function getRaIdFromAssignment(asignacion: AsignacionRaDemoRecord) {
  return asignacion.resultadoAprendizajeId ?? asignacion.resultadoAprendizajeIds?.[0] ?? "";
}

function normalizeComparableText(value?: string) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function isAssignmentVisibleForDocente(
  asignacion: AsignacionRaDemoRecord,
  course: { docente?: string } | undefined,
  user: ReturnType<typeof getCurrentMockUser>,
) {
  if (asignacion.docenteId) return asignacion.docenteId === user.id;

  const docenteNombre = normalizeComparableText(asignacion.docenteNombre);
  const courseDocenteNombre = normalizeComparableText(course?.docente);
  const currentDocenteNombre = normalizeComparableText(user.nombre);

  // Fallback demo solo para asignaciones antiguas que todavía no tengan docenteId.
  // La lógica real debe depender del id institucional del docente.
  return Boolean(
    currentDocenteNombre &&
      (docenteNombre === currentDocenteNombre || courseDocenteNombre === currentDocenteNombre),
  );
}

function getSearchCourseId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("courseId") ?? "";
}

function resolveMedicionRaContextForCourse(course?: CourseRecord) {
  const cicloId = course?.cycleId;
  const relatedCiclo = cicloId ? mockBackend.getById<CicloDemoRecord>("ciclosMedicion", cicloId) : undefined;

  return {
    relatedCiclo,
    cicloId,
    asignacionRaIds: course?.assignmentIds ?? [],
  };
}

function buildCoursesFromRealAssignments(user: ReturnType<typeof getCurrentMockUser>): CourseRecord[] {
  const assignments = mockBackend.list<AsignacionRaDemoRecord>("asignacionesRa", user);
  if (assignments.length === 0) return [];

  const cicloCatalogs = getCicloCatalogs();
  const competencias = mockBackend.list<CompetenciaDemoRecord>("competenciasRa", user);
  const cycles = mockBackend.list<CicloDemoRecord>("ciclosMedicion", user);
  const docenteAssignments = assignments.filter((assignment) => {
    const courseId = getCourseIdFromAssignment(assignment);
    const course = cicloCatalogs.cursos.find((item) => item.id === courseId);
    return isAssignmentVisibleForDocente(assignment, course, user);
  });

  const assignmentsByCourse = docenteAssignments.reduce<Record<string, AsignacionRaDemoRecord[]>>((acc, assignment) => {
    const courseId = getCourseIdFromAssignment(assignment);
    if (!courseId) return acc;
    const groupKey = `${assignment.cicloId ?? "sin-ciclo"}__${courseId}`;
    acc[groupKey] = [...(acc[groupKey] ?? []), assignment];
    return acc;
  }, {});

  const demoStudents = mockCourses[0]?.students ?? [];

  return Object.entries(assignmentsByCourse)
    .map(([, courseAssignments]): CourseRecord | null => {
      const courseId = getCourseIdFromAssignment(courseAssignments[0]);
      const course = cicloCatalogs.cursos.find((item) => item.id === courseId);
      if (!course) return null;

      const cycle = cycles.find((item) => item.id === courseAssignments[0]?.cicloId);
      const competenceGroups = courseAssignments.reduce<Record<string, AsignacionRaDemoRecord[]>>((acc, assignment) => {
        const competenciaId = getCompetenciaIdFromAssignment(assignment);
        if (!competenciaId) return acc;
        acc[competenciaId] = [...(acc[competenciaId] ?? []), assignment];
        return acc;
      }, {});

      const competences: Competence[] = Object.entries(competenceGroups)
        .map(([competenciaId, competenciaAssignments], index) => {
          const competencia = competencias.find((item) => item.id === competenciaId);
          if (!competencia) return null;

          const selectedRaIds = new Set(competenciaAssignments.map(getRaIdFromAssignment).filter(Boolean));
          const learningResults = (competencia.resultadosAprendizaje ?? [])
            .filter((ra) => selectedRaIds.has(ra.id))
            .map((ra, raIndex) => ({
              id: ra.id,
              code: `RA${String(ra.numero ?? raIndex + 1).padStart(2, "0")}`,
              title: `Resultado de Aprendizaje ${ra.numero ?? raIndex + 1}`,
              description: ra.descripcion ?? "Sin descripción registrada.",
            }));

          if (learningResults.length === 0) return null;

          return {
            id: competencia.id,
            code: `C${index + 1}`,
            title: competencia.nombre ?? `Competencia ${index + 1}`,
            description: competencia.descripcion ?? "Sin descripción registrada.",
            learningResults,
          } satisfies Competence;
        })
        .filter((item): item is Competence => Boolean(item));

      if (competences.length === 0) return null;

      return {
        id: course.id,
        name: course.nombre,
        code: course.codigo,
        group: "Grupo asignado",
        credits: course.creditos,
        period: cycle?.periodo ?? "Periodo del ciclo",
        program: course.programaId,
        studyPlan: course.planId,
        measurementCycle: cycle?.nombre ?? cycle?.id ?? "Ciclo de medición",
        teacher: courseAssignments[0]?.docenteNombre ?? course.docente,
        teacherId: courseAssignments[0]?.docenteId,
        teacherEmail: courseAssignments[0]?.docenteEmail,
        cycleId: cycle?.id ?? courseAssignments[0]?.cicloId,
        assignmentIds: courseAssignments.map((assignment) => assignment.id),
        seccionalId: courseAssignments[0]?.seccionalId ?? cycle?.seccionalId,
        facultadId: courseAssignments[0]?.facultadId ?? cycle?.facultadId,
        programaId: courseAssignments[0]?.programaId ?? course.programaId,
        planId: courseAssignments[0]?.planId ?? course.planId,
        competences,
        students: demoStudents,
      } satisfies CourseRecord;
    })
    .filter((item): item is CourseRecord => Boolean(item));
}

export function useMedicionRA() {
  const currentUser = useMemo(() => getCurrentMockUser(), []);
  const [backendVersion, setBackendVersion] = useState(0);
  const competenceContentRef = useRef<HTMLDivElement | null>(null);
  const pendingAutoScrollCompetenceIdRef = useRef<string | null>(null);
  const ignoreNextBackendChangeRef = useRef(false);

  useEffect(() => {
    return subscribeToMockBackendChanges(() => {
      if (ignoreNextBackendChangeRef.current) {
        ignoreNextBackendChangeRef.current = false;
        return;
      }

      setBackendVersion((current) => current + 1);
    });
  }, []);

  const realAssignments = useMemo(
    () => mockBackend.list<AsignacionRaDemoRecord>("asignacionesRa", currentUser),
    [backendVersion, currentUser],
  );
  const hasRealAssignments = realAssignments.length > 0;
  const availableCourses = useMemo(() => {
    const realCourses = buildCoursesFromRealAssignments(currentUser);

    // Fallback demo: se conserva únicamente cuando todavía no existen asignaciones reales desde RF07.
    // Si ya existen asignaciones reales de otros docentes, este docente ve estado vacío y no mockCourses.
    return realCourses.length > 0 ? realCourses : hasRealAssignments ? [] : mockCourses;
  }, [backendVersion, currentUser, hasRealAssignments]);
  const hasAvailableCourses = availableCourses.length > 0;
  const initialCourseId = useMemo(() => {
    const requestedCourseId = getSearchCourseId();
    if (requestedCourseId && availableCourses.some((course) => course.id === requestedCourseId)) {
      return requestedCourseId;
    }

    return availableCourses[0]?.id ?? mockCourses[0].id;
  }, [availableCourses]);
  const initialPersistedDemoState = useMemo(() => {
    const course = availableCourses.find((item) => item.id === initialCourseId);
    const stateId = buildMedicionRaDemoStateId({
      userId: currentUser.id,
      cicloId: course?.cycleId,
      courseId: initialCourseId,
    });

    return mockBackend.getById<MedicionRaDemoState>("medicionesRa", stateId);
  }, [availableCourses, backendVersion, currentUser.id, initialCourseId]);

  const [selectedCourseId, setSelectedCourseId] = useState(
    initialPersistedDemoState?.selectedCourseId ?? initialCourseId,
  );
  const [activeCompetenceId, setActiveCompetenceId] = useState(
    initialPersistedDemoState?.activeCompetenceId ?? availableCourses[0]?.competences[0]?.id ?? "",
  );

  const [evaluationsByCourse, setEvaluationsByCourse] = useState<
    Record<string, EvaluationMatrix>
  >(initialPersistedDemoState?.evaluationsByCourse ?? mockInitialEvaluations);

  const [instrumentsByCourse, setInstrumentsByCourse] = useState<
    Record<string, InstrumentByRa>
  >(initialPersistedDemoState?.instrumentsByCourse ?? mockInitialInstruments);

  const [evidenceByCompetence, setEvidenceByCompetence] = useState<
    Record<string, EvidenceState>
  >(initialPersistedDemoState?.evidenceByCompetence ?? {});

  const [improvementByCompetence, setImprovementByCompetence] = useState<
    Record<string, ImprovementPlanState>
  >(initialPersistedDemoState?.improvementByCompetence ?? {});

  const [completedCompetenceIds, setCompletedCompetenceIds] = useState<
    string[]
  >(initialPersistedDemoState?.completedCompetenceIds ?? []);

  const [isEvaluationLocked, setIsEvaluationLocked] = useState(
    initialPersistedDemoState?.isEvaluationLocked ?? false,
  );
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [feedback, setFeedback] = useState<ValidationFeedback | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const selectedCourse = useMemo(() => {
    return (
      availableCourses.find((course) => course.id === selectedCourseId) ??
      availableCourses[0] ??
      mockCourses[0]
    );
  }, [availableCourses, selectedCourseId]);

  const medicionRaContext = useMemo(
    () => resolveMedicionRaContextForCourse(selectedCourse),
    [selectedCourse],
  );
  const medicionRaDemoStateId = useMemo(
    () =>
      buildMedicionRaDemoStateId({
        userId: currentUser.id,
        cicloId: medicionRaContext.cicloId,
        courseId: selectedCourse.id,
      }),
    [currentUser.id, medicionRaContext.cicloId, selectedCourse.id],
  );
  const persistedDemoState = useMemo(
    () => mockBackend.getById<MedicionRaDemoState>("medicionesRa", medicionRaDemoStateId),
    [backendVersion, medicionRaDemoStateId],
  );

  useEffect(() => {
    if (!availableCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(availableCourses[0]?.id ?? mockCourses[0].id);
      return;
    }

    if (persistedDemoState?.selectedCourseId === selectedCourse.id) {
      setActiveCompetenceId(persistedDemoState.activeCompetenceId ?? selectedCourse.competences[0]?.id ?? "");
      setEvaluationsByCourse(persistedDemoState.evaluationsByCourse ?? mockInitialEvaluations);
      setInstrumentsByCourse(persistedDemoState.instrumentsByCourse ?? mockInitialInstruments);
      setEvidenceByCompetence(persistedDemoState.evidenceByCompetence ?? {});
      setImprovementByCompetence(persistedDemoState.improvementByCompetence ?? {});
      setCompletedCompetenceIds(persistedDemoState.completedCompetenceIds ?? []);
      setIsEvaluationLocked(persistedDemoState.isEvaluationLocked ?? false);
    } else {
      setActiveCompetenceId(selectedCourse.competences[0]?.id ?? "");
      setEvaluationsByCourse((current) => ({
        ...current,
        [selectedCourse.id]: normalizeEvaluationMatrix(selectedCourse, current[selectedCourse.id]),
      }));
      setInstrumentsByCourse((current) => ({
        ...current,
        [selectedCourse.id]: normalizeInstrumentState(selectedCourse, current[selectedCourse.id]),
      }));
      setEvidenceByCompetence({});
      setImprovementByCompetence({});
      setCompletedCompetenceIds([]);
      setIsEvaluationLocked(false);
    }

    setShowFinishModal(false);
    setFeedback(null);
    setShowValidationErrors(false);
  }, [
    availableCourses,
    persistedDemoState,
    selectedCourse,
    selectedCourseId,
  ]);

  const activeCompetence = useMemo(() => {
    return (
      selectedCourse.competences.find(
        (competence) => competence.id === activeCompetenceId,
      ) ?? selectedCourse.competences[0]
    );
  }, [activeCompetenceId, selectedCourse.competences]);

  useEffect(() => {
    if (pendingAutoScrollCompetenceIdRef.current !== activeCompetence.id) {
      return undefined;
    }

    if (typeof window === "undefined") {
      pendingAutoScrollCompetenceIdRef.current = null;
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      competenceContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      pendingAutoScrollCompetenceIdRef.current = null;
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [activeCompetence.id]);

  const activeCompetenceIndex = useMemo(() => {
    return Math.max(
      0,
      selectedCourse.competences.findIndex(
        (competence) => competence.id === activeCompetence.id,
      ),
    );
  }, [activeCompetence.id, selectedCourse.competences]);

  const isLastCompetence =
    activeCompetenceIndex === selectedCourse.competences.length - 1;

  const activeCompetenceStorageKey = useMemo(() => {
    return getCompetenceStorageKey(selectedCourse.id, activeCompetence.id);
  }, [activeCompetence.id, selectedCourse.id]);

  const evaluations = useMemo(() => {
    return normalizeEvaluationMatrix(
      selectedCourse,
      evaluationsByCourse[selectedCourse.id],
    );
  }, [evaluationsByCourse, selectedCourse]);

  const instruments = useMemo(() => {
    return normalizeInstrumentState(
      selectedCourse,
      instrumentsByCourse[selectedCourse.id],
    );
  }, [instrumentsByCourse, selectedCourse]);

  const evidence =
    evidenceByCompetence[activeCompetenceStorageKey] ?? emptyEvidence;

  const improvementPlan =
    improvementByCompetence[activeCompetenceStorageKey] ?? emptyImprovementPlan;

  const raResults = useMemo(() => {
    return calculateRaResults(selectedCourse, evaluations);
  }, [evaluations, selectedCourse]);

  const activeRaResults = useMemo(() => {
    const activeRaIds = new Set(
      activeCompetence.learningResults.map((ra) => ra.id),
    );

    return raResults.filter((result) => activeRaIds.has(result.raId));
  }, [activeCompetence, raResults]);

  const completionPercentage = useMemo(() => {
    return getCompletionPercentage(selectedCourse, evaluations);
  }, [evaluations, selectedCourse]);

  useEffect(() => {
    const hasProgress =
      completedCompetenceIds.length > 0 ||
      Object.keys(evidenceByCompetence).length > 0 ||
      Object.keys(improvementByCompetence).length > 0 ||
      isEvaluationLocked;

    if (!hasProgress) return;

    const { relatedCiclo, cicloId, asignacionRaIds } = medicionRaContext;

    ignoreNextBackendChangeRef.current = true;
    mockBackend.upsert<MedicionRaDemoState>(
      "medicionesRa",
      {
        id: medicionRaDemoStateId,
        cicloId,
        asignacionRaId: asignacionRaIds[0],
        asignacionRaIds,
        selectedCourseId,
        activeCompetenceId,
        evaluationsByCourse,
        instrumentsByCourse,
        evidenceByCompetence,
        improvementByCompetence,
        completedCompetenceIds,
        isEvaluationLocked,
        completed: isEvaluationLocked,
        userId: currentUser.id,
        seccionalId: selectedCourse.seccionalId ?? relatedCiclo?.seccionalId,
        facultadId: selectedCourse.facultadId ?? relatedCiclo?.facultadId,
        programaId: selectedCourse.programaId ?? relatedCiclo?.programaId,
        planId: selectedCourse.planId ?? relatedCiclo?.planId,
      },
      currentUser,
    );
  }, [
    activeCompetenceId,
    completedCompetenceIds,
    completionPercentage,
    evaluationsByCourse,
    evidenceByCompetence,
    improvementByCompetence,
    instrumentsByCourse,
    isEvaluationLocked,
    medicionRaContext,
    medicionRaDemoStateId,
    selectedCourse,
    selectedCourseId,
    currentUser,
  ]);

  const subProgressSteps = useMemo(() => {
    const totalCells =
      selectedCourse.students.length * activeCompetence.learningResults.length;

    const completedCells = selectedCourse.students.reduce((total, student) => {
      const completedByStudent = activeCompetence.learningResults.filter((ra) =>
        Boolean(evaluations[student.id]?.[ra.id]),
      ).length;

      return total + completedByStudent;
    }, 0);

    const evaluationsCompleted = totalCells > 0 && completedCells === totalCells;

    const instrumentsCompleted = activeCompetence.learningResults.every((ra) =>
      Boolean(instruments[ra.id]?.description?.trim()),
    );

    const evidenceCompleted = Boolean(evidence.fileName);

    const steps = [
      {
        id: "evaluations",
        label: "Calificaciones",
        completed: evaluationsCompleted,
        active: !evaluationsCompleted,
      },
      {
        id: "instruments",
        label: "Instrumento",
        completed: instrumentsCompleted,
        active: evaluationsCompleted && !instrumentsCompleted,
      },
      {
        id: "evidence",
        label: "Evidencia",
        completed: evidenceCompleted,
        active:
          evaluationsCompleted && instrumentsCompleted && !evidenceCompleted,
      },
    ];

    if (evaluationsCompleted && instrumentsCompleted && evidenceCompleted) {
      return steps.map((step) => ({ ...step, active: false }));
    }

    return steps;
  }, [
    activeCompetence.learningResults,
    evaluations,
    evidence.fileName,
    instruments,
    selectedCourse.students,
  ]);

  const getEvidenceFileNameByCompetence = (competence: Competence) => {
    const key = getCompetenceStorageKey(selectedCourse.id, competence.id);
    return evidenceByCompetence[key]?.fileName ?? "";
  };

  const validateCurrentCompetence = () => {
    return validateBeforeClosing({
      course: selectedCourse,
      activeCompetence,
      evaluations,
      instruments,
      evidenceFileName: evidence.fileName,
    });
  };

  const handleValidationError = (result: ValidationFeedback) => {
    setShowValidationErrors(true);
    setFeedback(result);

    if (
      result.firstErrorCompetenceId &&
      result.firstErrorCompetenceId !== activeCompetence.id
    ) {
      setActiveCompetenceId(result.firstErrorCompetenceId);
    }

    scrollToFirstValidationError({
      fieldOrder: result.firstErrorField ? [result.firstErrorField] : [],
      delay: 140,
    });
  };

  const markActiveCompetenceAsCompleted = () => {
    setCompletedCompetenceIds((current) => {
      if (current.includes(activeCompetence.id)) return current;
      return [...current, activeCompetence.id];
    });
  };

  const handleCourseChange = (courseId: string) => {
    if (!courseId || isEvaluationLocked) return;

    setSelectedCourseId(courseId);
  };

  const handleCompetenceChange = (competenceId: string) => {
    setActiveCompetenceId(competenceId);
  };

  const handleLevelChange = (
    studentId: string,
    raId: string,
    level: PerformanceLevel,
  ) => {
    if (isEvaluationLocked) return;

    setEvaluationsByCourse((current) => {
      const currentCourseMatrix = normalizeEvaluationMatrix(
        selectedCourse,
        current[selectedCourse.id],
      );

      return {
        ...current,
        [selectedCourse.id]: {
          ...currentCourseMatrix,
          [studentId]: {
            ...currentCourseMatrix[studentId],
            [raId]: level,
          },
        },
      };
    });

    setFeedback(null);
  };

  const handleInstrumentDescriptionChange = (raId: string, value: string) => {
    if (isEvaluationLocked) return;

    setInstrumentsByCourse((current) => {
      const currentCourseInstruments = normalizeInstrumentState(
        selectedCourse,
        current[selectedCourse.id],
      );

      return {
        ...current,
        [selectedCourse.id]: {
          ...currentCourseInstruments,
          [raId]: {
            ...currentCourseInstruments[raId],
            description: value,
          },
        },
      };
    });

    setFeedback(null);
  };

  const handleEvidenceChange = (nextEvidence: Partial<EvidenceState>) => {
    if (isEvaluationLocked) return;

    setEvidenceByCompetence((current) => ({
      ...current,
      [activeCompetenceStorageKey]: {
        ...(current[activeCompetenceStorageKey] ?? emptyEvidence),
        ...nextEvidence,
      },
    }));

    setFeedback(null);
  };

  const handleImprovementPlanChange = (
    key: keyof ImprovementPlanState,
    value: string,
  ) => {
    if (isEvaluationLocked) return;

    setImprovementByCompetence((current) => ({
      ...current,
      [activeCompetenceStorageKey]: {
        ...(current[activeCompetenceStorageKey] ?? emptyImprovementPlan),
        [key]: value,
      },
    }));

    setFeedback(null);
  };

  const handleSaveProgress = () => {
    if (isEvaluationLocked) return;

    const result = validateCurrentCompetence();

    if (result.type === "error") {
      handleValidationError(result);
      return;
    }

    setShowValidationErrors(false);
    markActiveCompetenceAsCompleted();

    setFeedback({
      type: "info",
      title: "Progreso guardado",
      message:
        "La información de la competencia seleccionada quedó conservada correctamente en mockBackend. Cuando exista backend, esta acción enviará el avance parcial al servicio correspondiente.",
    });
  };

  const handlePrimaryAction = () => {
    if (isEvaluationLocked) return;

    const result = validateCurrentCompetence();

    if (result.type === "error") {
      handleValidationError(result);
      return;
    }

    setShowValidationErrors(false);
    markActiveCompetenceAsCompleted();

    if (!isLastCompetence) {
      const nextCompetence =
        selectedCourse.competences[activeCompetenceIndex + 1];

      pendingAutoScrollCompetenceIdRef.current = nextCompetence.id;
      setActiveCompetenceId(nextCompetence.id);

      setFeedback({
        type: "success",
        title: "Competencia guardada",
        message:
          "El progreso de la competencia actual quedó guardado. Continúa con la siguiente competencia.",
      });

      return;
    }

    const courseValidation = validateCourseBeforeFinalizing({
      course: selectedCourse,
      evaluations,
      instruments,
      getEvidenceFileName: getEvidenceFileNameByCompetence,
    });

    if (courseValidation.type === "error") {
      handleValidationError(courseValidation);
      return;
    }

    setShowValidationErrors(false);
    setShowFinishModal(true);
  };

  const handleConfirmFinishEvaluation = () => {
    setCompletedCompetenceIds(
      selectedCourse.competences.map((competence) => competence.id),
    );

    setIsEvaluationLocked(true);
    setShowFinishModal(false);

    setFeedback({
      type: "success",
      title: "Evaluación finalizada",
      message:
        "La evaluación quedó guardada y bloqueada. Ya no es posible modificar la información registrada.",
    });
  };

  const handleCancelFinishEvaluation = () => {
    setShowFinishModal(false);
  };

  const handleCloseFeedback = () => {
    setFeedback(null);
  };

  return {
    availableCourses,
    selectedCourse,
    activeCompetence,
    activeRaResults,
    completionPercentage,
    subProgressSteps,
    completedCompetenceIds,
    evidence,
    improvementPlan,
    evaluations,
    instruments,
    feedback,
    showFinishModal,
    isEvaluationLocked,
    isLastCompetence,
    showValidationErrors,
    competenceContentRef,
    handleCourseChange,
    handleCompetenceChange,
    handleLevelChange,
    handleInstrumentDescriptionChange,
    handleEvidenceChange,
    handleImprovementPlanChange,
    handleSaveProgress,
    handlePrimaryAction,
    handleConfirmFinishEvaluation,
    handleCancelFinishEvaluation,
    handleCloseFeedback,
    hasAvailableCourses,
  };
}
