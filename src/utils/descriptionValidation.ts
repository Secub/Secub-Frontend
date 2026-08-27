export const DESCRIPTION_MAX_LENGTH = 150;
export const DESCRIPTION_MAX_LENGTH_MESSAGE = `La descripción no puede superar los ${DESCRIPTION_MAX_LENGTH} caracteres.`;

export function getDescriptionLengthError(value: string) {
  return value.length > DESCRIPTION_MAX_LENGTH
    ? DESCRIPTION_MAX_LENGTH_MESSAGE
    : "";
}

export function isDescriptionLengthValid(value: string) {
  return !getDescriptionLengthError(value);
}
