import { performanceLevels, TARGET_PERCENTAGE } from "./medicion-ra.mock";
import type {
  Competence,
  CourseRecord,
  EvaluationMatrix,
  InstrumentByRa,
  LearningResult,
  PerformanceLevel,
  RaResultSummary,
  ValidationFeedback,
} from "./medicion-ra.types";

export function getAllLearningResults(course: CourseRecord): LearningResult[] {
  return course.competences.flatMap((competence) => competence.learningResults);
}

export function getEmptyEvaluationMatrix(course: CourseRecord): EvaluationMatrix {
  const allRas = getAllLearningResults(course);

  return course.students.reduce<EvaluationMatrix>((matrix, student) => {
    matrix[student.id] = allRas.reduce<Record<string, PerformanceLevel>>(
      (raValues, ra) => {
        raValues[ra.id] = "";
        return raValues;
      },
      {},
    );

    return matrix;
  }, {});
}

export function normalizeEvaluationMatrix(
  course: CourseRecord,
  current?: EvaluationMatrix,
): EvaluationMatrix {
  const emptyMatrix = getEmptyEvaluationMatrix(course);

  return course.students.reduce<EvaluationMatrix>((matrix, student) => {
    matrix[student.id] = {
      ...emptyMatrix[student.id],
      ...(current?.[student.id] ?? {}),
    };

    return matrix;
  }, {});
}

export function getEmptyInstrumentState(course: CourseRecord): InstrumentByRa {
  return getAllLearningResults(course).reduce<InstrumentByRa>((state, ra) => {
    state[ra.id] = {
      fileName: "",
      description: "",
    };

    return state;
  }, {});
}

export function normalizeInstrumentState(
  course: CourseRecord,
  current?: InstrumentByRa,
): InstrumentByRa {
  const emptyState = getEmptyInstrumentState(course);

  return getAllLearningResults(course).reduce<InstrumentByRa>((state, ra) => {
    state[ra.id] = {
      ...emptyState[ra.id],
      ...(current?.[ra.id] ?? {}),
    };

    return state;
  }, {});
}

export function getLevelLabel(value: PerformanceLevel) {
  return performanceLevels.find((level) => level.value === value)?.label ?? "";
}

export function isAchievedLevel(value: PerformanceLevel) {
  return (
    value === "sobresaliente" ||
    value === "satisfactorio" ||
    value === "en-desarrollo"
  );
}

export function calculateRaResults(
  course: CourseRecord,
  evaluations: EvaluationMatrix,
): RaResultSummary[] {
  return course.competences.flatMap((competence) =>
    competence.learningResults.map((ra) => {
      const totalStudents = course.students.length;
      const values = course.students.map(
        (student) => evaluations[student.id]?.[ra.id] ?? "",
      );

      const achievedCount = values.filter(isAchievedLevel).length;

      const approvalPercentage = totalStudents
        ? Math.round((achievedCount / totalStudents) * 100)
        : 0;

      const levelCounts = performanceLevels.map((level) => {
        const count = values.filter((value) => value === level.value).length;

        const percentage = totalStudents
          ? Math.round((count / totalStudents) * 100)
          : 0;

        return {
          level: level.value,
          label: level.label,
          count,
          percentage,
        };
      });

      return {
        raId: ra.id,
        raCode: ra.code,
        raTitle: ra.title,
        competenceCode: competence.code,
        achievedCount,
        totalStudents,
        approvalPercentage,
        targetPercentage: TARGET_PERCENTAGE,
        reachedTarget: approvalPercentage >= TARGET_PERCENTAGE,
        levelCounts,
      };
    }),
  );
}

export function getCompletionPercentage(
  course: CourseRecord,
  evaluations: EvaluationMatrix,
) {
  const allRas = getAllLearningResults(course);
  const totalCells = course.students.length * allRas.length;

  if (!totalCells) return 0;

  const completedCells = course.students.reduce((count, student) => {
    const completedByStudent = allRas.filter((ra) =>
      Boolean(evaluations[student.id]?.[ra.id]),
    ).length;

    return count + completedByStudent;
  }, 0);

  return Math.round((completedCells / totalCells) * 100);
}

export function getCompetenceStorageKey(courseId: string, competenceId: string) {
  return `${courseId}__${competenceId}`;
}

export function validateBeforeClosing({
  course,
  activeCompetence,
  evaluations,
  instruments,
  evidenceFileName,
}: {
  course: CourseRecord;
  activeCompetence: Competence;
  evaluations: EvaluationMatrix;
  instruments: InstrumentByRa;
  evidenceFileName: string;
}): ValidationFeedback {
  const details: string[] = [];
  const activeRas = activeCompetence.learningResults;

  const pendingStudents = course.students.filter((student) =>
    activeRas.some((ra) => !evaluations[student.id]?.[ra.id]),
  );

  const missingInstrumentDescriptions = activeRas.filter(
    (ra) => !instruments[ra.id]?.description?.trim(),
  );

  if (pendingStudents.length > 0) {
    details.push(
      `Faltan niveles de desempeño para ${pendingStudents.length} estudiante(s) en la competencia ${activeCompetence.code}.`,
    );
  }

  if (missingInstrumentDescriptions.length > 0) {
    details.push(
      `Falta definir el instrumento de evaluación en: ${missingInstrumentDescriptions
        .map((ra) => ra.code)
        .join(", ")}.`,
    );
  }

  if (!evidenceFileName) {
    details.push(
      `Falta cargar la evidencia obligatoria de la competencia ${activeCompetence.code}.`,
    );
  }

  if (details.length > 0) {
    return {
      type: "error",
      title: "No se puede finalizar todavía",
      message:
        "Corrige los puntos pendientes para cerrar la medición de la competencia seleccionada.",
      details,
    };
  }

  return {
    type: "success",
    title: "Competencia lista",
    message:
      "La competencia seleccionada tiene sus RA evaluados, los instrumentos definidos y la evidencia obligatoria cargada.",
  };
}

export function validateCourseBeforeFinalizing({
  course,
  evaluations,
  instruments,
  getEvidenceFileName,
}: {
  course: CourseRecord;
  evaluations: EvaluationMatrix;
  instruments: InstrumentByRa;
  getEvidenceFileName: (competence: Competence) => string;
}): ValidationFeedback {
  const details = course.competences.flatMap((competence) => {
    const validation = validateBeforeClosing({
      course,
      activeCompetence: competence,
      evaluations,
      instruments,
      evidenceFileName: getEvidenceFileName(competence),
    });

    return validation.details ?? [];
  });

  if (details.length > 0) {
    return {
      type: "error",
      title: "No se puede finalizar todavía",
      message:
        "Corrige los puntos pendientes antes de cerrar definitivamente la evaluación.",
      details,
    };
  }

  return {
    type: "success",
    title: "Evaluación lista para cierre",
    message:
      "Todas las competencias cumplen con la información necesaria para finalizar la evaluación.",
  };
}
