import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Button from "../Button";
import Modal from "../Modal";

function ModalHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      <Modal
        open={open}
        title="Modal accesible"
        onClose={() => setOpen(false)}
        footer={<Button data-autofocus onClick={() => setOpen(false)}>Aceptar</Button>}
      >
        <button type="button">Acción secundaria</button>
      </Modal>
    </>
  );
}

describe("Modal", () => {
  it("mueve y devuelve el foco al abrir y cerrar", async () => {
    const user = userEvent.setup();
    render(<ModalHarness />);

    const trigger = screen.getByRole("button", { name: "Abrir" });
    await user.click(trigger);

    const accept = await screen.findByRole("button", { name: "Aceptar" });
    expect(accept).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });
});
