import { useMemo } from "react";
import { Badge } from "../../../../components/ui";
import { mockCompetenciasRa } from "../../competencias-ra/CompetenciasRa.mock";
import type { CompetenciasRaFormacionRecord } from "../../competencias-ra/CompetenciasRa.types";
import type {
  Catalogs,
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters,
  ProgramaAcademico,
  ProgramaAcademicoCurso,
} from "../MapeoCompetencias.types";

type MapeoCompromisoValue = "N/A" | "I" | "R" | "A";

const MAPEO_COMPROMISOS_STORAGE_KEY =
  "secub.mapeoCompetencias.compromisos";

interface MapeoCompetenciasSemestreCompromisoCardProps {
  catalogs: Catalogs;
  filters: MapeoCompetenciasFilters;
  mapeos: MapeoCompetenciasEnriched[];
}

type StoredCompromisos = Record<string, MapeoCompromisoValue>;

function readStoredCompromisos(): StoredCompromisos {
  if (typeof window === "undefined") return {};

  try {
    const rawValue = localStorage.getItem(MAPEO_COMPROMISOS_STORAGE_KEY);
    if (!rawValue) return {};

    const parsed = JSON.parse(rawValue);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function buildCompromisoKey(params: {
  programaId: string;
  planId: string;
  semestreNumero: number;
  cursoId: string;
  competenciaId: string;
}) {
  // Esta llave es el contrato con la pagina de edicion: si alla se guarda el
  // mismo identificador, esta tabla principal lo muestra automaticamente.
  return [
    params.programaId,
    params.planId,
    `sem-${params.semestreNumero}`,
    params.cursoId,
    params.competenciaId,
  ].join("__");
}

function getNucleoLabel(nucleo: ProgramaAcademicoCurso["nucleo"]) {
  const labels: Record<ProgramaAcademicoCurso["nucleo"], string> = {
    fundamentacion: "Fundamentacion",
    profesionalizacion: "Profesionalizacion",
    sintesis: "Sintesis",
  };

  return labels[nucleo];
}

function getNucleoBadgeVariant(nucleo: ProgramaAcademicoCurso["nucleo"]) {
  if (nucleo === "fundamentacion") return "info";
  if (nucleo === "profesionalizacion") return "warning";
  return "success";
}

function matchesFilters(
  programa: ProgramaAcademico,
  filters: MapeoCompetenciasFilters,
) {
  if (filters.seccionalId && programa.seccionalId !== filters.seccionalId) {
    return false;
  }

  if (filters.facultadId && programa.facultadId !== filters.facultadId) {
    return false;
  }

  if (filters.programaId && programa.id !== filters.programaId) {
    return false;
  }

  return true;
}

function getProgramasFromFilter(
  catalogs: Catalogs,
  filters: MapeoCompetenciasFilters,
  mapeos: MapeoCompetenciasEnriched[],
) {
  const mapeoProgramaIds = new Set(mapeos.map((mapeo) => mapeo.programaId));

  return catalogs.programas.filter((programa) => {
    if (!matchesFilters(programa, filters)) return false;

    // Si ya hay mapeos filtrados, la tabla se limita a esas carreras para
    // respetar tambien el filtro de plan/estado aplicado en la pagina padre.
    if (mapeoProgramaIds.size > 0) {
      return mapeoProgramaIds.has(programa.id);
    }

    return true;
  });
}

function getCompetenciasForPrograma(
  programaId: string,
  planId: string,
): CompetenciasRaFormacionRecord[] {
  return mockCompetenciasRa
    .filter((competencia) => {
      if (competencia.estado !== "activo") return false;
      if (competencia.programaId !== programaId) return false;
      if (planId && competencia.planId !== planId) return false;
      return true;
    })
    .sort((a, b) => a.numero - b.numero);
}

function getPlanIdForPrograma(
  programaId: string,
  filters: MapeoCompetenciasFilters,
  mapeos: MapeoCompetenciasEnriched[],
) {
  if (filters.planId) return filters.planId;
  return mapeos.find((mapeo) => mapeo.programaId === programaId)?.planId ?? "";
}

function getStoredValue(
  storedValues: StoredCompromisos,
  params: {
    programaId: string;
    planId: string;
    semestreNumero: number;
    cursoId: string;
    competenciaId: string;
  },
) {
  // El estado inicial solicitado es N/A: solo cambia cuando una pagina de
  // edicion guarda I, R o A usando la misma llave de compromiso.
  const key = buildCompromisoKey(params);
  return storedValues[key] ?? "N/A";
}

export function MapeoCompetenciasSemestreCompromisoCard({
  catalogs,
  filters,
  mapeos,
}: MapeoCompetenciasSemestreCompromisoCardProps) {
  const storedValues = useMemo(() => readStoredCompromisos(), []);
  const programas = useMemo(
    () => getProgramasFromFilter(catalogs, filters, mapeos),
    [catalogs, filters, mapeos],
  );

  if (programas.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-gray-5)] bg-[var(--color-surface-soft)] p-8 text-center">
        <p className="text-sm text-[var(--color-gray-3)]">
          No hay carreras con semestres para los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {programas.map((programa) => {
        const planId = getPlanIdForPrograma(programa.id, filters, mapeos);
        const competencias = getCompetenciasForPrograma(programa.id, planId);

        return (
          <section key={programa.id} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold text-[var(--color-secondary-4)]">
                  {programa.nombre}
                </h4>
                <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                  {programa.numeroSemestres} semestres - {planId || "Todos los planes"}
                </p>
              </div>
            </div>

            {competencias.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--color-gray-5)] bg-[var(--color-surface-soft)] p-6 text-sm text-[var(--color-gray-3)]">
                No hay competencias activas para esta carrera y plan de estudios.
              </div>
            ) : (
              <div className="space-y-4">
                {programa.semestres.map((semestre) => {
                  const nucleoPrincipal =
                    semestre.cursos[0]?.nucleo ?? "fundamentacion";

                  return (
                    <article
                      key={`${programa.id}-semestre-${semestre.numero}`}
                      className="overflow-hidden rounded-lg border-2 border-[var(--color-gray-5)] bg-white"
                    >
                      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-gray-6)] px-5 py-4">
                        <h5 className="font-semibold text-[var(--color-secondary-4)]">
                          Semestre {semestre.numero}
                        </h5>
                        <Badge variant={getNucleoBadgeVariant(nucleoPrincipal)}>
                          {getNucleoLabel(nucleoPrincipal)}
                        </Badge>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-sm">
                          <thead>
                            <tr className="bg-[var(--color-surface-soft)] text-xs text-[var(--color-gray-4)]">
                              <th className="w-[220px] border-b border-[var(--color-gray-6)] px-5 py-3 text-left font-medium">
                                Curso
                              </th>

                              {competencias.map((competencia) => (
                                <th
                                  key={competencia.id}
                                  className="w-[96px] border-b border-[var(--color-gray-6)] px-3 py-3 text-center font-medium"
                                  title={competencia.descripcion}
                                >
                                  C{String(competencia.numero).padStart(2, "0")}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {semestre.cursos.map((curso) => (
                              <tr key={curso.id}>
                                <td className="border-b border-[var(--color-gray-6)] px-5 py-3 align-top">
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-[var(--color-gray-1)]">
                                      {curso.nombre}
                                    </p>
                                    <p className="mt-0.5 text-xs text-[var(--color-gray-4)]">
                                      {curso.codigo} - {curso.creditos} creditos
                                    </p>
                                  </div>
                                </td>

                                {competencias.map((competencia) => (
                                  <td
                                    key={`${curso.id}-${competencia.id}`}
                                    className="border-b border-[var(--color-gray-6)] px-3 py-3 text-center text-xs font-semibold text-[var(--color-gray-4)]"
                                  >
                                    {getStoredValue(storedValues, {
                                      programaId: programa.id,
                                      planId,
                                      semestreNumero: semestre.numero,
                                      cursoId: curso.id,
                                      competenciaId: competencia.id,
                                    })}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default MapeoCompetenciasSemestreCompromisoCard;
