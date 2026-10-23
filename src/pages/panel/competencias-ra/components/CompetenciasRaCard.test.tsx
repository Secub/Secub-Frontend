import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CompetenciasRaCard from "./CompetenciasRaCard";
import type { CompetenciasRaEnriched } from "../CompetenciasRa.types";

const record: CompetenciasRaEnriched = {
  id: "comp-1",
  seccionalId: "cali",
  facultadId: "ing",
  lugarId: "lugar-1",
  programaId: "sis",
  planId: "plan-1",
  estado: "activo",
  descripcion: "Diseña soluciones de software.",
  nombre: "Competencia 1",
  numero: 1,
  mapeada: false,
  resultadosAprendizaje: [],
  createdAt: "2026-10-01",
  updatedAt: "2026-10-01",
  seccionalNombre: "Cali",
  facultadNombre: "Ingeniería",
  lugarNombre: "Sede",
  programaNombre: "Ingeniería de Sistemas",
  planNombre: "Plan 2026",
  planEstado: "activo",
};

function renderCard(onAddRa = vi.fn()) {
  render(
    <CompetenciasRaCard
      record={record}
      onView={vi.fn()}
      onAddRa={onAddRa}
      onEditRa={vi.fn()}
      onDeleteRa={vi.fn()}
      canEdit
    />,
  );
  return onAddRa;
}

describe("CompetenciasRaCard add RA action", () => {
  it("shows a labeled Agregar RA button without expanding the RA list", async () => {
    const onAddRa = renderCard();

    const addButton = screen.getByRole("button", { name: "Agregar RA" });
    expect(addButton).toHaveTextContent("Agregar RA");

    await userEvent.click(addButton);
    expect(onAddRa).toHaveBeenCalledWith(record);
  });
});
