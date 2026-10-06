import { describe, expect, it } from "vitest";
import type { CicloCatalogs, CursoSintesis } from "./ciclo.types";
import { getSynthesisCourses } from "./ciclo.utils";

function course(id: string, nucleo: CursoSintesis["nucleo"], nivelCompromiso: CursoSintesis["nivelCompromiso"]): CursoSintesis {
  return {
    id,
    nombre: id,
    codigo: id,
    creditos: 3,
    semestre: nucleo === "Síntesis" ? 9 : 8,
    nucleo,
    programaId: "PROGRAM-1",
    planId: "PLAN-1",
    docente: "Docente",
    tipoVinculacion: "Tiempo completo",
    competenciasAsignadas: 1,
    nivelCompromiso,
    asignadoANucleoSintesis: nucleo === "Síntesis",
  };
}

describe("cursos elegibles para el ciclo", () => {
  it("incluye únicamente cursos de Síntesis con nivel Afianza", () => {
    const catalogs: CicloCatalogs = {
      seccionales: [],
      facultades: [],
      programas: [],
      planes: [],
      cursos: [
        course("SYN-A", "Síntesis", "A"),
        course("SYN-R", "Síntesis", "R"),
        course("PRO-A", "Profesionalización", "A"),
      ],
    };

    expect(getSynthesisCourses(catalogs, "PROGRAM-1", "PLAN-1").map((item) => item.id))
      .toEqual(["SYN-A"]);
  });
});
