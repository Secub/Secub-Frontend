import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PanelMobileNavigation from "../sidebar/PanelMobileNavigation";

vi.mock("../PanelSidebar", () => ({
  default: ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav aria-label="Menú simulado">
      <button type="button" onClick={onNavigate}>Ir a módulo</button>
    </nav>
  ),
}));

describe("PanelMobileNavigation", () => {
  it("abre, cierra y devuelve el foco", async () => {
    const user = userEvent.setup();
    render(<PanelMobileNavigation currentStep="dashboard" />);

    const trigger = screen.getByRole("button", { name: "Menú" });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: "Navegación del panel" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
