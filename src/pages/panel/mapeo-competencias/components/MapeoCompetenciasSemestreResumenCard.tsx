import { useMemo } from "react";

import { Badge } from "../../../../components/ui";

import {
  readStoredNucleos,
  type NucleoType,
} from "../hooks/useNucleosManager";

import type {
  MapeoCompetencia,
  MapeoCompetenciasEnriched,
  MapeoSemesterData,
  ProgramaAcademico,
  ProgramaAcademicoCurso,
  TipoClasificacion,
} from "../MapeoCompetencias.types";

type StoredMapeo = Record<string, Record<string, string>>;

interface MapeoCompetenciasSemestreResumenCardProps {
  record: MapeoCompetenciasEnriched;
  programa?: ProgramaAcademico;
  semestre: MapeoSemesterData;
  semesterIndex: number;
}

const COMPROMISO_LABELS: Record<string, string> = {
  introduce: "Introduce",
  refuerza: "Refuerza",
  afianza: "Afianza",
  "no-aplica": "No aplica",
};

const NUCLEO_LABELS: Record<NucleoType, string> = {
  fundamentacion: "Fundamentacion",
  profesionalizacion: "Profesionalizacion",
  sintesis: "Sintesis",
};

function readStoredSemestreMapeo(
  semesterNumber: number,
  semesterIndex: number,
): StoredMapeo {
  if (typeof window === "undefined") return {};

  const candidateKeys = Array.from(
    new Set([
      `mapeo-competencias-semestre-${semesterIndex}`,
      `mapeo-competencias-semestre-${semesterNumber - 1}`,
      `mapeo-competencias-semestre-${semesterNumber}`,
      `mapeo-competencias-semestre-${semesterIndex + 1}`,
    ]),
  );

  for (const key of candidateKeys) {
    try {
      const rawValue = localStorage.getItem(key);
      if (!rawValue) continue;

      const parsed = JSON.parse(rawValue);
      if (parsed && typeof parsed === "object") {
        return parsed as StoredMapeo;
      }
    } catch {
      continue;
    }
  }

  return {};
}

function getNucleoBadgeVariant(nucleo?: NucleoType | TipoClasificacion | null) {
  if (nucleo === "fundamentacion") return "info";
  if (nucleo === "profesionalizacion") return "warning";
  if (nucleo === "sintesis") return "success";
  return "neutral";
}

function getNucleoLabel(nucleo?: NucleoType | TipoClasificacion | null) {
  return nucleo ? NUCLEO_LABELS[nucleo] : "Sin clasificar";
}

function getCompromisoLabel(value?: string) {
  return COMPROMISO_LABELS[value ?? ""] ?? "No aplica";
}

function getCompromisoClassName(value?: string) {
  if (value === "introduce") {
    return "bg-[var(--color-primary-6)] text-[var(--color-primary-1)]";
  }

  if (value === "refuerza") {
    return "bg-[var(--color-warning)] text-[var(--color-secondary-4)]";
  }

  if (value === "afianza") {
    return "bg-[var(--color-success)] text-[var(--color-secondary-4)]";
  }

  return "bg-[var(--color-gray-6)] text-[var(--color-gray-3)]";
}

function getCursosDelSemestre(
  programa: ProgramaAcademico | undefined,
  semestre: MapeoSemesterData,
  storedMapeo: StoredMapeo,
): ProgramaAcademicoCurso[] {
  const semestresPrograma = programa?.semestres ?? [];

  const cursos =
    semestresPrograma.find(
      (item) =>
        item.id === semestre.semesterId ||
        item.numero === semestre.semesterNumber,
    )?.cursos ?? [];

  if (cursos.length > 0) {
    return cursos;
  }

  return Object.keys(storedMapeo).map((cursoId) => ({
    id: cursoId,
    codigo: cursoId,
    nombre: cursoId,
    creditos: 0,
    horasSemanales: 0,
    nucleo: "Sin Clasificar",
    descripcion: "",
  }));
}

function getCompetenciaLabel(competencia: MapeoCompetencia, index: number) {
  const numero = competencia.numero || index + 1;
  return `C${String(numero).padStart(2, "0")}`;
}

export default function MapeoCompetenciasSemestreResumenCard({
  record,
  programa,
  semestre,
  semesterIndex,
}: MapeoCompetenciasSemestreResumenCardProps) {
  const storedMapeo = useMemo(
    () => readStoredSemestreMapeo(semestre.semesterNumber, semesterIndex),
    [semestre.semesterNumber, semesterIndex],
  );

  const cursos = useMemo(
    () => getCursosDelSemestre(programa, semestre, storedMapeo),
    [programa, semestre, storedMapeo],
  );

  const storedNucleos = useMemo(
    () => readStoredNucleos(record.programaId, record.planId),
    [record.programaId, record.planId],
  );

  const nucleo =
    storedNucleos[semestre.semesterNumber] ??
    semestre.tipo ??
    programa?.semestres.find(
      (item) =>
        item.id === semestre.semesterId ||
        item.numero === semestre.semesterNumber,
    )?.tipo ??
    null;

  const competencias = semestre.competencias ?? [];

  return (
    <article className="overflow-hidden rounded-lg border border-[var(--color-gray-6)] bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-[var(--color-gray-6)] p-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-[var(--color-gray-4)]">
            Semestre
          </p>

          <h4 className="mt-1 text-xl font-semibold text-[var(--color-secondary-4)]">
            Semestre {semestre.semesterNumber}
          </h4>

          <p className="mt-2 text-sm text-[var(--color-gray-3)]">
            {programa?.nombre ?? record.programaNombre}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          <span className="inline-flex rounded-full border border-[var(--color-gray-6)] px-3 py-1 text-xs font-semibold text-[var(--color-gray-3)]">
            Plan: {record.planNombre}
          </span>

          <Badge variant={getNucleoBadgeVariant(nucleo)}>
            Nucleo: {getNucleoLabel(nucleo)}
          </Badge>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-[var(--color-secondary-4)]">
            Cursos del semestre
          </h5>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--color-gray-6)]">
          <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[var(--color-surface-soft)] text-xs text-[var(--color-gray-4)]">
                <th className="w-[260px] border-b border-[var(--color-gray-6)] px-5 py-3 text-left font-semibold uppercase">
                  Curso
                </th>

                {competencias.map((competencia, index) => (
                  <th
                    key={competencia.id}
                    className="w-[140px] border-b border-[var(--color-gray-6)] px-3 py-3 text-center font-semibold uppercase"
                    title={competencia.descripcion}
                  >
                    {getCompetenciaLabel(competencia, index)}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {cursos.length > 0 && competencias.length > 0 ? (
                cursos.map((curso) => (
                  <tr
                    key={curso.id}
                    className="hover:bg-[var(--color-gray-7)]"
                  >
                    <td className="border-b border-[var(--color-gray-6)] px-5 py-3 align-top">
                      <p className="font-semibold text-[var(--color-gray-1)]">
                        {curso.nombre}
                      </p>

                      <p className="mt-1 text-xs text-[var(--color-gray-4)]">
                        {curso.codigo} - {curso.creditos} creditos
                      </p>
                    </td>

                    {competencias.map((competencia) => {
                      const value =
                        storedMapeo[curso.id]?.[competencia.id] ??
                        "no-aplica";

                      return (
                        <td
                          key={`${curso.id}-${competencia.id}`}
                          className="border-b border-[var(--color-gray-6)] px-3 py-3 text-center"
                        >
                          <span
                            className={[
                              "inline-flex min-w-[96px] justify-center rounded-full px-3 py-1 text-xs font-semibold",
                              getCompromisoClassName(value),
                            ].join(" ")}
                          >
                            {getCompromisoLabel(value)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={Math.max(competencias.length + 1, 1)}
                    className="px-5 py-8 text-center text-sm text-[var(--color-gray-3)]"
                  >
                    No hay cursos o competencias disponibles para este semestre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </article>
  );
}
