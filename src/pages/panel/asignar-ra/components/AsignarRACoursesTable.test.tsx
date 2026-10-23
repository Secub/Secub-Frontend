import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AsignarRACourseRow } from "../AsignarRA.types";
import { AsignarRACoursesTable } from "./AsignarRACoursesTable";

const COURSE_ACTION_SELECTOR = '[data-tour="asignar-ra-course-action"]';

function buildRow(id: string, codigo: string, nombre: string): AsignarRACourseRow {
  return {
    course: {
      id, nombre, codigo, creditos: 3, semestre: 8, nucleo: "Síntesis", programaId: "p-1", planId: "plan-1",
      docente: "Docente", tipoVinculacion: "Planta", competenciasAsignadas: 1, nivelCompromiso: "A",
      asignadoANucleoSintesis: true,
    },
    assignments: [],
    status: { label: "Pendiente", variant: "warning" },
    assignedCount: 0,
    competenceCount: 1,
    isSelected: false,
    actionLabel: "Editar",
  };
}

afterEach(cleanup);

describe("Asignar RA: ancla del tour en la acción de cada curso", () => {
  it("marca la acción de cada fila para que el tour señale la primera visible", () => {
    render(
      <AsignarRACoursesTable
        rows={[buildRow("c-2", "TI-902", "Taller B"), buildRow("c-1", "TI-801", "Taller A")]}
        totalCourses={2}
        isFiltered={false}
        canManage
        onSelectCourse={vi.fn()}
      />,
    );

    const anchors = document.querySelectorAll<HTMLElement>(COURSE_ACTION_SELECTOR);
    expect(anchors).toHaveLength(2);

    const firstVisibleRow = screen.getAllByRole("row")[1];
    expect(within(firstVisibleRow).getByRole("button", { name: /^Editar/ }).closest(COURSE_ACTION_SELECTOR)).toBe(anchors[0]);
  });
});
