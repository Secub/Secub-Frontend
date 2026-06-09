import { ACCEPTED_FILE_FORMATS, performanceLevels, TARGET_PERCENTAGE } from "./medicion-ra.mock";
import type {
  Competence,
  CourseRecord,
  EvaluationMatrix,
  InstrumentByRa,
  InstrumentState,
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

export function getCompetenceStorageKey(courseId: string, competenceId: string) {
  return `${courseId}__${competenceId}`;
}

export function getEmptyInstrumentState(course: CourseRecord): InstrumentByRa {
  return getAllLearningResults(course).reduce<InstrumentByRa>((state, ra) => {
    state[ra.id] = { description: "" };
    return state;
  }, {});
}

function normalizeInstrumentValue(value?: InstrumentState) {
  return {
    description: value?.description ?? "",
    fileName: value?.fileName ?? "",
  };
}

function getLegacyInstrumentForRa(
  course: CourseRecord,
  competence: Competence,
  ra: LearningResult,
  current?: InstrumentByRa,
): InstrumentState | undefined {
  if (!current) return undefined;

  const directRaInstrument = current[ra.id];
  if (directRaInstrument?.description?.trim()) {
    return normalizeInstrumentValue(directRaInstrument);
  }

  const competenceKey = getCompetenceStorageKey(course.id, competence.id);
  const legacyCompetenceInstrument = current[competenceKey];
  if (legacyCompetenceInstrument?.description?.trim()) {
    return normalizeInstrumentValue(legacyCompetenceInstrument);
  }

  return undefined;
}

export function normalizeInstrumentState(
  course: CourseRecord,
  current?: InstrumentByRa,
): InstrumentByRa {
  const emptyState = getEmptyInstrumentState(course);

  return course.competences.reduce<InstrumentByRa>((state, competence) => {
    competence.learningResults.forEach((ra) => {
      state[ra.id] = {
        ...emptyState[ra.id],
        ...(getLegacyInstrumentForRa(course, competence, ra, current) ?? {}),
      };
    });

    return state;
  }, {});
}

// Compatibilidad para lecturas antiguas. La nueva pantalla usa la llave de cada RA.
export function getInstrumentStorageKey(course: CourseRecord, competence: Competence) {
  return getCompetenceStorageKey(course.id, competence.id);
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

function getAllowedEvidenceExtensions() {
  return ACCEPTED_FILE_FORMATS.split(",")
    .map((item) => item.trim().replace(/^\./, "").toLowerCase())
    .filter(Boolean);
}

function isAcceptedEvidenceFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";
  return getAllowedEvidenceExtensions().includes(extension);
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

  let firstPendingEvaluationField = "";
  for (const student of course.students) {
    const firstMissingRa = activeRas.find(
      (ra) => !evaluations[student.id]?.[ra.id],
    );

    if (firstMissingRa) {
      firstPendingEvaluationField = `evaluation-${student.id}-${firstMissingRa.id}`;
      break;
    }
  }

  const firstMissingInstrumentRa = activeRas.find(
    (ra) => !instruments[ra.id]?.description?.trim(),
  );

  const evidenceFileExtensionInvalid = Boolean(
    evidenceFileName && !isAcceptedEvidenceFileName(evidenceFileName),
  );

  if (pendingStudents.length > 0) {
    details.push(
      `Faltan niveles de desempeño para ${pendingStudents.length} estudiante(s) en la competencia ${activeCompetence.code}.`,
    );
  }

  if (firstMissingInstrumentRa) {
    details.push(
      `Falta describir el instrumento o criterio de evaluación para ${firstMissingInstrumentRa.code}.`,
    );
  }

  if (!evidenceFileName) {
    details.push(
      `Falta cargar la evidencia obligatoria de la competencia ${activeCompetence.code}.`,
    );
  }

  if (evidenceFileExtensionInvalid) {
    details.push(
      "El archivo de evidencia debe estar en formato Word, PDF, PNG o JPG.",
    );
  }

  if (details.length > 0) {
    const firstErrorField =
      firstPendingEvaluationField ||
      (firstMissingInstrumentRa ? `instrument-description-${firstMissingInstrumentRa.id}` : "") ||
      (!evidenceFileName || evidenceFileExtensionInvalid ? "evidence-file" : "");

    return {
      type: "error",
      title: "No se puede finalizar todavía",
      message:
        "Corrige los puntos pendientes para cerrar la medición de la competencia seleccionada.",
      details,
      firstErrorField,
      firstErrorCompetenceId: activeCompetence.id,
    };
  }

  return {
    type: "success",
    title: "Competencia lista",
    message:
      "La competencia seleccionada tiene sus RA evaluados, la descripción individual del instrumento por RA y la evidencia obligatoria cargada una sola vez por competencia.",
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
  const details: string[] = [];
  let firstErrorField = "";
  let firstErrorCompetenceId = "";

  course.competences.forEach((competence) => {
    const validation = validateBeforeClosing({
      course,
      activeCompetence: competence,
      evaluations,
      instruments,
      evidenceFileName: getEvidenceFileName(competence),
    });

    if (validation.details?.length) {
      details.push(...validation.details);
    }

    if (!firstErrorField && validation.firstErrorField) {
      firstErrorField = validation.firstErrorField;
      firstErrorCompetenceId = validation.firstErrorCompetenceId ?? competence.id;
    }
  });

  if (details.length > 0) {
    return {
      type: "error",
      title: "No se puede finalizar todavía",
      message:
        "Corrige los puntos pendientes antes de cerrar definitivamente la evaluación.",
      details,
      firstErrorField,
      firstErrorCompetenceId,
    };
  }

  return {
    type: "success",
    title: "Evaluación lista para cierre",
    message:
      "Todas las competencias cumplen con la información necesaria para finalizar la evaluación.",
  };
}
