import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Modal } from "./Modal";

function ControlledModal() {
  const [value, setValue] = useState("");

  return (
    <Modal open title="Agregar RA" onClose={() => undefined}>
      <textarea
        aria-label="Descripción del RA"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </Modal>
  );
}

function StackedModals() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <Modal open={open} title="Detalle" onClose={() => setOpen(false)}>
        <p>Contenido del detalle</p>
      </Modal>
      <Modal open={open} title="Confirmar" onClose={() => setOpen(false)} role="alertdialog">
        <button type="button" onClick={() => setOpen(false)}>Cerrar ambos</button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("mantiene el foco del campo cuando el contenido controlado cambia", async () => {
    render(<ControlledModal />);

    const textarea = screen.getByRole("textbox", { name: "Descripción del RA" });
    textarea.focus();
    fireEvent.change(textarea, { target: { value: "R" } });

    await waitFor(() => expect(textarea).toHaveFocus());
  });

  it("libera la página cuando se cierran dos modales apilados al mismo tiempo", async () => {
    const appRoot = document.getElementById("root") ?? document.createElement("div");
    appRoot.id = "root";
    if (!appRoot.isConnected) document.body.appendChild(appRoot);
    render(<StackedModals />, { container: appRoot });

    await waitFor(() => {
      expect(appRoot.inert).toBe(true);
      expect(document.body.style.overflow).toBe("hidden");
    });
    fireEvent.click(screen.getByRole("button", { name: "Cerrar ambos" }));

    await waitFor(() => {
      expect(appRoot.inert).toBe(false);
      expect(document.body.style.overflow).toBe("");
    });
  });
});
