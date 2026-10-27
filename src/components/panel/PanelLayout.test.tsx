import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PanelLayout from "./PanelLayout";

const workflowState = vi.hoisted(() => ({ completed: false }));

vi.mock("./PanelSidebar", () => ({ default: () => null }));
vi.mock("./sidebar/PanelMobileNavigation", () => ({ default: () => null }));
vi.mock("./NotificationCenter", () => ({ default: () => null }));
vi.mock("./academicWorkflow", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./academicWorkflow")>();
  return {
    ...actual,
    getAcademicWorkflowState: () => workflowState.completed ? "completed" : "inProgress",
    useAcademicWorkflowProgress: () => ({ ciclo: true }),
  };
});

describe("PanelLayout tour replay", () => {
  it("requests the dashboard tour after the academic workflow completion alert", async () => {
    workflowState.completed = false;
    const { rerender } = render(
      <PanelLayout currentStep="asignar-ra" title="Asignar Resultados de Aprendizaje">
        <p>content</p>
      </PanelLayout>,
    );

    workflowState.completed = true;
    rerender(
      <PanelLayout currentStep="asignar-ra" title="Asignar Resultados de Aprendizaje">
        <p>content</p>
      </PanelLayout>,
    );

    await userEvent.click(await screen.findByRole("button", { name: "Entendido" }));

    const params = new URLSearchParams(window.location.search);
    expect(window.location.pathname).toBe("/panel/dashboard");
    expect(params.get("workflowCompleted")).toBe("true");
    expect(params.get("role")).toBeTruthy();
  });

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
