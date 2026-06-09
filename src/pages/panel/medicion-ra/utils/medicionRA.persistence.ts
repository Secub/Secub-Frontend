import type { EvidenceState, EvaluationMatrix, ImprovementPlanState, InstrumentByRa } from "../medicion-ra.types";

export function buildMedicionRaDemoStateId({
  userId,
  cicloId,
  courseId,
}: {
  userId: string;
  cicloId?: string;
  courseId?: string;
}) {
  return ["medicion-ra-demo-state", userId, cicloId, courseId]
    .filter(Boolean)
    .join("-");
}

export function pickCourseEvaluationState(
  evaluationsByCourse: Record<string, EvaluationMatrix>,
  courseId: string,
) {
  const courseEvaluations = evaluationsByCourse[courseId];
  return courseEvaluations ? { [courseId]: courseEvaluations } : {};
}

export function pickCourseInstrumentState(
  instrumentsByCourse: Record<string, InstrumentByRa>,
  courseId: string,
) {
  const courseInstruments = instrumentsByCourse[courseId];
  return courseInstruments ? { [courseId]: courseInstruments } : {};
}

export function pickCourseCompetenceState<T extends EvidenceState | ImprovementPlanState>(
  state: Record<string, T>,
  courseId: string,
) {
  const coursePrefix = `${courseId}__`;

  return Object.entries(state).reduce<Record<string, T>>((acc, [key, value]) => {
    if (key.startsWith(coursePrefix)) acc[key] = value;
    return acc;
  }, {});
}

/**
 * Extrae información de auditoría (timestamps) de un registro de Medición RA.
 * 
 * VARIABLES DE AUDITORÍA DISPONIBLES:
 * ────────────────────────────────────────────────────────────────
 * • createdAt (string | undefined)
 *   - Timestamp ISO 8601 de creación del registro
 *   - Generado automáticamente en la primera creación
 *   - NO cambia en actualizaciones posteriores
 *   - Formato: "2024-06-01T14:30:45.123Z"
 *   - Ruta: MedicionRaDemoState.createdAt
 *
 * • updatedAt (string | undefined)
 *   - Timestamp ISO 8601 de última modificación
 *   - Actualizado automáticamente cada vez que el registro cambia
 *   - Cambia con cada persistencia
 *   - Formato: "2024-06-01T14:30:45.123Z"
 *   - Ruta: MedicionRaDemoState.updatedAt
 * 
 * EJEMPLO DE CONSUMO EN BD:
 * ────────────────────────────────────────────────────────────────
 * ```typescript
 * // 1. Obtener datos de auditoría
 * const records = mockBackend.list<MedicionRaDemoState>("medicionesRa");
 * const auditData = records.map(record => extractMedicionRaAuditInfo(record));
 *
 * // 2. Enviar a BD (INSERT/UPDATE)
 * INSERT INTO mediciones_ra_audit (
 *   id, created_at, updated_at, is_modified, days_since_creation
 * ) VALUES (?, ?, ?, ?, ?);
 *
 * // 3. Query de reporte
 * SELECT id, created_at, updated_at, 
 *        TIMESTAMPDIFF(HOUR, created_at, updated_at) as hours_worked
 * FROM mediciones_ra_audit
 * WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
 * ORDER BY updated_at DESC;
 * ```
 */
export function extractMedicionRaAuditInfo(record: { createdAt?: string; updatedAt?: string }) {
  return {
    // Variables de auditoría (consumibles)
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    // Valores derivados para facilitar consumo
    createdAtDate: record.createdAt ? new Date(record.createdAt) : undefined,
    updatedAtDate: record.updatedAt ? new Date(record.updatedAt) : undefined,
    isModified: record.createdAt && record.updatedAt && record.createdAt !== record.updatedAt,
    daysSinceCreation: record.createdAt
      ? Math.floor((Date.now() - new Date(record.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : undefined,
  };
}
