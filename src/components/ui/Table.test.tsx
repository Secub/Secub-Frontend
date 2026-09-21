import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Table } from "./Table";

describe("Table", () => {
  it("muestra todas las filas y oculta los controles cuando se desactiva la paginación", () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({ id: String(index + 1), name: `Curso ${index + 1}` }));

    render(
      <Table
        columns={[{ key: "name", title: "Curso", render: (row) => row.name }]}
        data={rows}
        rowKey={(row) => row.id}
        pagination={false}
      />,
    );

    rows.forEach((row) => expect(screen.getByText(row.name)).toBeInTheDocument());
    expect(screen.queryByText("Filas por página:")).not.toBeInTheDocument();
  });
});
