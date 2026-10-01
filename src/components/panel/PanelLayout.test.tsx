import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PanelLayout from "./PanelLayout";

vi.mock("./PanelSidebar", () => ({ default: () => null }));
vi.mock("./sidebar/PanelMobileNavigation", () => ({ default: () => null }));

describe("PanelLayout tour replay", () => {
  it("does not render the tour button when no tour is provided", () => {
    render(
      <PanelLayout currentStep="ajustes" title="Ajustes de usuario">
        <p>content</p>
      </PanelLayout>,
    );

    expect(screen.queryByRole("button", { name: /Ver guía/ })).not.toBeInTheDocument();
  });

  it("renders the tour button next to the page title and replays the tour", async () => {
    const onReplayTour = vi.fn();
    render(
      <PanelLayout
        currentStep="ajustes"
        title="Ajustes de usuario"
        onReplayTour={onReplayTour}
        tourLabel="Ver guía de ajustes"
      >
        <p>content</p>
      </PanelLayout>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Ajustes de usuario" });
    const button = screen.getByRole("button", { name: "Ver guía de ajustes" });
    expect(heading.parentElement).toContainElement(button);

    await userEvent.click(button);
    expect(onReplayTour).toHaveBeenCalledTimes(1);
  });
});
