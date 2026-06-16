import { NIVELES_COMPROMISO, NUCLEOS, SAFE_FALLBACK_TOTAL_SEMESTERS } from "./MapeoCompetencias.constants";
import type {
  BadgeVariant,
  CompetenciaRaDemoRecord,
  CursoAsis,
  MapeoCompetenciasEstado,
  MapeoCompetenciasRecord,
  NivelCompromiso,
  NivelCompromisoCorto,
  NivelesDraft,
  NucleoFormacion,
  NucleosDraft,
  PlanEstudio,
  SemestreClasificado,
  SemestreMapeoEstado,
  SemestreResumen,
} from "./MapeoCompetencias.types";

export function getNucleoLabel(value?: NucleoFormacion | null) {
  return NUCLEOS.find((item) => item.value === value)?.label ?? "Sin clasificar";
}

export function getNucleoVariant(value?: NucleoFormacion | null): BadgeVariant {
  return NUCLEOS.find((item) => item.value === value)?.variant ?? "neutral";
}

export function getNivelLabel(value?: NivelCompromiso | null) {
  return NIVELES_COMPROMISO.find((item) => item.value === value)?.label ?? "Sin nivel";
}

export function getNivelShort(value?: NivelCompromiso | null): NivelCompromisoCorto | "" {
  return NIVELES_COMPROMISO.find((item) => item.value === value)?.short ?? "";
}

export function getNivelFromShort(value?: NivelCompromisoCorto | "") {
  return NIVELES_COMPROMISO.find((item) => item.short === value)?.value;
}

export function getNivelVariant(value?: NivelCompromiso | null): BadgeVariant {
  return NIVELES_COMPROMISO.find((item) => item.value === value)?.variant ?? "neutral";
}

export function getEstadoBadgeVariant(estado: MapeoCompetenciasEstado): BadgeVariant {
  return estado === "activo" ? "success" : "neutral";
}

export function getSemestreEstadoVariant(estado: SemestreMapeoEstado): BadgeVariant {
  if (estado === "completo") return "success";
  if (estado === "sin-cursos") return "info";
  if (estado === "en-progreso") return "warning";
  return "neutral";
}

export function getSemestreEstadoLabel(estado: SemestreMapeoEstado) {
  if (estado === "completo") return "Completo";
  if (estado === "sin-cursos") return "Clasificado sin cursos";
  if (estado === "en-progreso") return "En progreso";
  return "Pendiente";
}

export function getSemesterId(planId: string, semestreNumero: number) {
  return `${planId || "plan"}__semestre_${semestreNumero}`;
}

export function getMappingKey(cursoId: string, competenciaId: string) {
  return `${cursoId}__${competenciaId}`;
}

export function getTotalSemestersForPlan(
  plan: PlanEstudio | undefined | null,
  cursos: CursoAsis[] = [],
  record?: MapeoCompetenciasRecord | null,
) {
  const totalFromPlan = Number(plan?.totalSemestres ?? 0);
  if (Number.isFinite(totalFromPlan) && totalFromPlan > 0) return Math.floor(totalFromPlan);

  const totalFromCourses = Math.max(0, ...cursos.map((curso) => Number(curso.semestre) || 0));
  if (totalFromCourses > 0) return totalFromCourses;

  const totalFromRecord = Math.max(
    0,
    ...(record?.semestresClasificados ?? []).map((semestre) => Number(semestre.semestreNumero) || 0),
  );
  if (totalFromRecord > 0) return totalFromRecord;

  return SAFE_FALLBACK_TOTAL_SEMESTERS;
}

export function buildSemesterNumbers(total = SAFE_FALLBACK_TOTAL_SEMESTERS) {
  const normalizedTotal = Math.max(1, Math.floor(Number(total) || SAFE_FALLBACK_TOTAL_SEMESTERS));
  return Array.from({ length: normalizedTotal }, (_, index) => index + 1);
}

export function buildEmptyNucleosDraft(total = SAFE_FALLBACK_TOTAL_SEMESTERS): NucleosDraft {
  return buildSemesterNumbers(total).reduce<NucleosDraft>((draft, semester) => {
    draft[semester] = null;
    return draft;
  }, {});
}

export function readNucleosFromRecord(record?: MapeoCompetenciasRecord | null, total = SAFE_FALLBACK_TOTAL_SEMESTERS) {
  const draft = buildEmptyNucleosDraft(total);

  record?.semestresClasificados?.forEach((item) => {
    draft[item.semestreNumero] = item.nucleo;
  });

  return draft;
}

export function readNivelesFromRecord(record?: MapeoCompetenciasRecord | null) {
  const draft: NivelesDraft = {};

  record?.nivelesCompromiso?.forEach((item) => {
    draft[getMappingKey(item.cursoId, item.competenciaId)] = item.nivelCompromiso;
  });

  if (!record?.nivelesCompromiso?.length && record?.cursosMapeados?.length) {
    record.cursosMapeados.forEach((item) => {
      const nivel = getNivelFromShort(item.nivel ?? "");
      if (item.cursoId && item.competenciaRaId && nivel) {
        draft[getMappingKey(item.cursoId, item.competenciaRaId)] = nivel;
      }
    });
  }

  return draft;
}

export function areAllSemestersClassified(draft: NucleosDraft, total = SAFE_FALLBACK_TOTAL_SEMESTERS) {
  return buildSemesterNumbers(total).every((semester) => Boolean(draft[semester]));
}

export function allNucleosRepresented(draft: NucleosDraft): boolean {
  const values = Object.values(draft).filter(Boolean) as NucleoFormacion[];
  return (
    values.includes("fundamentacion") &&
    values.includes("profesionalizacion") &&
    values.includes("sintesis")
  );
}

export function serializeSemestresClasificados(
  draft: NucleosDraft,
  planId: string,
  total = SAFE_FALLBACK_TOTAL_SEMESTERS,
): SemestreClasificado[] {
  return buildSemesterNumbers(total).map((semester) => ({
    semestreId: getSemesterId(planId, semester),
    semestreNumero: semester,
    nucleo: draft[semester] ?? null,
  }));
}

export function buildSemestresResumen(
  record: MapeoCompetenciasRecord | undefined | null,
  cursos: CursoAsis[],
  competencias: CompetenciaRaDemoRecord[],
  total = SAFE_FALLBACK_TOTAL_SEMESTERS,
): SemestreResumen[] {
  const semestres = record?.semestresClasificados ?? serializeSemestresClasificados(buildEmptyNucleosDraft(total), record?.planId ?? "", total);
  const niveles = record?.nivelesCompromiso ?? [];

  return buildSemesterNumbers(total).map((semestreNumero) => {
    const semestreId = getSemesterId(record?.planId ?? "", semestreNumero);
    const clasificacion = semestres.find((item) => item.semestreNumero === semestreNumero);
    const cursosSemestre = cursos.filter((course) => course.semestre === semestreNumero);
    const nivelesSemestre = niveles.filter((item) => item.semestreNumero === semestreNumero);
    const totalCeldas = cursosSemestre.length * competencias.length;
    const totalAsignadas = nivelesSemestre.length;
    const nucleo = clasificacion?.nucleo ?? null;

    let estado: SemestreMapeoEstado = "pendiente";
    if (nucleo && cursosSemestre.length === 0) estado = "sin-cursos";
    else if (nucleo || totalAsignadas > 0) estado = "en-progreso";
    if (nucleo && totalCeldas > 0 && totalAsignadas >= totalCeldas) estado = "completo";

    return {
      semestreNumero,
      semestreId,
      nucleo,
      estado,
      cursos: cursosSemestre,
      niveles: nivelesSemestre,
      totalCeldas,
      totalAsignadas,
    };
  });
}

export function hasCompleteLevelMapping(
  cursos: CursoAsis[],
  competencias: CompetenciaRaDemoRecord[],
  nivelesDraft: NivelesDraft,
) {
  if (!cursos.length || !competencias.length) return false;

  return cursos.every((curso) =>
    competencias.every((competencia) => Boolean(nivelesDraft[getMappingKey(curso.id, competencia.id)])),
  );
}
