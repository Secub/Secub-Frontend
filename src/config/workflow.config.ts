/**
 * Configuración temporal del bloqueo secuencial del workflow académico.
 * - false: permite navegar por todos los módulos sin completar pasos previos.
 * - true: exige completar cada paso antes de avanzar al siguiente.
 */
export const ENABLE_ACADEMIC_WORKFLOW_LOCK = false;

export const ACADEMIC_WORKFLOW_STORAGE_KEY = "secub-academic-workflow-progress";
