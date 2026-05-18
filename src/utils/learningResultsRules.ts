export const MIN_RA_PER_COMPETENCIA = 1;
export const MAX_RA_PER_COMPETENCIA = 4;

export const MIN_RA_VALIDATION_MESSAGE =
  "Agrega al menos 1 Resultado de Aprendizaje para completar la competencia.";
export const MAX_RA_VALIDATION_MESSAGE =
  "Máximo 4 Resultados de Aprendizaje por competencia.";
export const EMPTY_RA_DESCRIPTION_MESSAGE =
  "Todos los Resultados de Aprendizaje deben tener descripción.";

export interface LearningResultLike {
  id?: string;
  numero?: number;
  descripcion?: string;
}

export interface CompetenciaWithLearningResults {
  resultadosAprendizaje?: LearningResultLike[];
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

export function getLearningResultsCount(record: CompetenciaWithLearningResults) {
  return record.resultadosAprendizaje?.length ?? 0;
}

export function getLearningResultsCountLabel(record: CompetenciaWithLearningResults) {
  const count = getLearningResultsCount(record);
  return `${count} de ${MAX_RA_PER_COMPETENCIA} Resultados de Aprendizaje`;
}

export function canAddLearningResult(record: CompetenciaWithLearningResults) {
  return getLearningResultsCount(record) < MAX_RA_PER_COMPETENCIA;
}

export function getDescribedLearningResults<T extends LearningResultLike>(
  record: { resultadosAprendizaje?: T[] },
) {
  return (record.resultadosAprendizaje ?? []).filter((ra) =>
    hasText(ra.descripcion),
  );
}

export function isCompetenciaRaValidByLearningResults(
  record: CompetenciaWithLearningResults,
) {
  const count = getLearningResultsCount(record);

  if (count < MIN_RA_PER_COMPETENCIA || count > MAX_RA_PER_COMPETENCIA) {
    return false;
  }

  return (record.resultadosAprendizaje ?? []).every((ra) =>
    hasText(ra.descripcion),
  );
}

export function getLearningResultsValidationMessage(
  record: CompetenciaWithLearningResults,
) {
  const count = getLearningResultsCount(record);

  if (count < MIN_RA_PER_COMPETENCIA) {
    return MIN_RA_VALIDATION_MESSAGE;
  }

  if (count > MAX_RA_PER_COMPETENCIA) {
    return `${MAX_RA_VALIDATION_MESSAGE} Esta competencia tiene ${count}; corrige los datos existentes antes de continuar.`;
  }

  const hasEmptyDescription = (record.resultadosAprendizaje ?? []).some(
    (ra) => !hasText(ra.descripcion),
  );

  if (hasEmptyDescription) {
    return EMPTY_RA_DESCRIPTION_MESSAGE;
  }

  return "";
}
