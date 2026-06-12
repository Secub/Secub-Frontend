import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibilityProvider } from "../../../accessibility";
import PanelLayout from "../PanelLayout";
import type { AcademicWorkflowProgress, AcademicWorkflowState } from "../academicWorkflow";

let workflowState: AcademicWorkflowState = "inProgress";
let progress: AcademicWorkflowProgress = {
  "perfil-egreso": true,
  "proposito-formacion": true,
  "competencias-ra": true,
  "mapeo-competencias": true,
  ciclo: true,
  "asignar-ra": false,
};

vi.mock("../PanelSidebar", () => ({
  default: () => <aside aria-label="Barra lateral simulada" />,
}));

vi.mock("../../../services/auth/mockUser", () => ({
  getCurrentMockUser: () => ({
    nombre: "Juliana Mejía",
    cargo: "Jefatura de programa",
    role: "director",
  }),
}));

vi.mock("../academicWorkflow", () => ({
  getAcademicWorkflowState: () => workflowState,
  isAcademicWorkflowStep: () => true,
  useAcademicWorkflowProgress: () => progress,
}));


describe("PanelLayout alerta de flujo completado", () => {
  beforeEach(() => {
    workflowState = "inProgress";
    progress = {
      "perfil-egreso": true,
      "proposito-formacion": true,
      "competencias-ra": true,
      "mapeo-competencias": true,
      ciclo: true,
      "asignar-ra": false,
    };
  });
  it("aparece solo cuando el flujo pasa de incompleto a completado", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AccessibilityProvider>
        <PanelLayout currentStep="asignar-ra" title="Asignar RA">
          <p>Contenido del panel</p>
        </PanelLayout>
      </AccessibilityProvider>,
    );

    expect(screen.queryByRole("alertdialog", { name: /flujo completado/i })).not.toBeInTheDocument();

    workflowState = "completed";
    progress = {
      ...progress,
      "asignar-ra": true,
    };

    rerender(
      <AccessibilityProvider>
        <PanelLayout currentStep="asignar-ra" title="Asignar RA">
          <p>Contenido del panel</p>
        </PanelLayout>
      </AccessibilityProvider>,
    );

    expect(
      await screen.findByRole("alertdialog", { name: /flujo completado/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /entendido/i }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog", { name: /flujo completado/i })).not.toBeInTheDocument();
    });

    rerender(
      <AccessibilityProvider>
        <PanelLayout currentStep="asignar-ra" title="Asignar RA">
          <p>Contenido del panel</p>
        </PanelLayout>
      </AccessibilityProvider>,
    );

    expect(screen.queryByRole("alertdialog", { name: /flujo completado/i })).not.toBeInTheDocument();
  });

  it("no aparece al cargar si el flujo ya estaba completado", () => {
    workflowState = "completed";
    progress = {
      "perfil-egreso": true,
      "proposito-formacion": true,
      "competencias-ra": true,
      "mapeo-competencias": true,
      ciclo: true,
      "asignar-ra": true,
    };

    render(
      <AccessibilityProvider>
        <PanelLayout currentStep="dashboard" title="Dashboard">
          <p>Contenido del panel</p>
        </PanelLayout>
      </AccessibilityProvider>,
    );

    expect(screen.queryByRole("alertdialog", { name: /flujo completado/i })).not.toBeInTheDocument();
  });
});
