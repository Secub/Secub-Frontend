import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { Button, Input, LinkButton, Select, Textarea } from "..";

describe("componentes UI accesibles", () => {
  it("permite encontrar campos por label y conecta errores con aria-describedby", () => {
    render(
      <form>
        <Input label="Nombre del programa" error="El nombre es obligatorio" />
        <Select
          label="Estado"
          error="Selecciona un estado"
          options={[{ label: "Activo", value: "activo" }]}
        />
        <Textarea label="Descripción" helperText="Describe el contenido académico." />
      </form>,
    );

    const input = screen.getByLabelText("Nombre del programa");
    const select = screen.getByLabelText("Estado");
    const textarea = screen.getByLabelText("Descripción");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("El nombre es obligatorio");
    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(select).toHaveAccessibleDescription("Selecciona un estado");
    expect(textarea).toHaveAccessibleDescription("Describe el contenido académico.");
  });

  it("expone botones y enlaces por su nombre accesible", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Button leftIcon={<span>+</span>}>Agregar RA</Button>
        <LinkButton href="/acceder" variant="accent">Acceder</LinkButton>
      </div>,
    );

    expect(screen.getByRole("button", { name: "Agregar RA" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Acceder" })).toHaveAttribute("href", "/acceder");

    await user.tab();
    expect(screen.getByRole("button", { name: "Agregar RA" })).toHaveFocus();
  });
});
