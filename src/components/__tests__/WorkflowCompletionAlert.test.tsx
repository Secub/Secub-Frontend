import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkflowCompletionAlert from "../WorkflowCompletionAlert";

describe("WorkflowCompletionAlert", () => {
  it("muestra una alerta accesible y permite cerrarla", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<WorkflowCompletionAlert open onClose={handleClose} />);

    expect(
      screen.getByRole("alertdialog", { name: /flujo completado/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/los módulos quedarán disponibles en modo visualización/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /entendido/i }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("cierra con Escape", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<WorkflowCompletionAlert open onClose={handleClose} />);

    await user.keyboard("{Escape}");

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
