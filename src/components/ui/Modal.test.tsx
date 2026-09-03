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

describe("Modal", () => {
  it("mantiene el foco del campo cuando el contenido controlado cambia", async () => {
    render(<ControlledModal />);

    const textarea = screen.getByRole("textbox", { name: "Descripción del RA" });
    textarea.focus();
    fireEvent.change(textarea, { target: { value: "R" } });

    await waitFor(() => expect(textarea).toHaveFocus());
  });
});
