import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PanelSidebar from "../PanelSidebar";
import type { PanelStepKey } from "../panelNavigation";

let workflowState: "inProgress" | "completed" | "newAcademicPlan" =
  "inProgress";

let renewalAvailable = false;

const progress: Partial<Record<PanelStepKey, boolean>> = {
  "perfil-egreso": true,
  "proposito-formacion": false,
};

vi.mock("../../../services/auth/mockUser", () => ({
  getCurrentMockUser: () => ({
    nombre: "Juliana Mejía",
    cargo: "Directora de programa",
    role: "director",
  }),
}));

vi.mock("../../../config/demo.config", () => ({
  SHOW_DEMO_TOOLS: false,
}));

vi.mock("../academicWorkflow", () => ({
  WORKFLOW_LOCKED_MESSAGE: "Primero completa el paso anterior para continuar.",
  newAcademicPlanStartStep: "competencias-ra",

  getAcademicWorkflowLockedDescription: () =>
    "Este paso está bloqueado hasta completar el paso anterior.",

  getAcademicWorkflowState: () => workflowState,

  getCompletedAcademicWorkflowStepsCount: () => 1,

  getNewAcademicPlanRenewalAvailability: () => ({
    isAvailable: renewalAvailable,
    isCompleted: workflowState === "completed",
    monthsRequired: 18,
    renewalDate: "2027-01-01T00:00:00.000Z",
    lockedMessage: renewalAvailable
      ? undefined
      : "Solo puedes crear un nuevo plan académico cuando el ciclo actual haya cumplido 1.5 años.",
  }),

  isAcademicWorkflowBaseStepInherited: (key: PanelStepKey) =>
    key === "perfil-egreso" || key === "proposito-formacion",

  isAcademicWorkflowStepCompleted: (key: PanelStepKey) =>
    Boolean(progress[key]),

  isAcademicWorkflowStepLocked: (key: PanelStepKey) =>
    key !== "perfil-egreso" && !progress[key],

  startNewAcademicPlanFromCurrentProgress: vi.fn(),

  useAcademicPlanInfo: () => ({
    activePlan: {
      id: "plan-1",
      title: "Plan académico actual",
      status: workflowState,
      createdAt: "2025-01-01T00:00:00.000Z",
      cycleStartDate: "2025-01-01T00:00:00.000Z",
      inheritedStepKeys: ["perfil-egreso", "proposito-formacion"],
    },
    archivedPlans: [],
  }),

  useAcademicWorkflowProgress: () => progress,
}));

describe("PanelSidebar accesible", () => {
  beforeEach(() => {
    workflowState = "inProgress";
    renewalAvailable = false;

    Object.defineProperty(window, "alert", {
      writable: true,
      value: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marca el paso actual con aria-current step y comunica pasos bloqueados", () => {
    render(<PanelSidebar currentStep="perfil-egreso" />);

    const currentStep = screen.getByRole("button", {
      name: /paso 1: perfil de egreso/i,
      current: "step",
    });

    expect(currentStep).toBeInTheDocument();

    const blockedStep = screen.getByRole("button", {
      name: /paso 2: propósito de formación.*bloqueado/i,
    });

    expect(blockedStep).toBeDisabled();
    expect(blockedStep).toHaveAttribute("aria-label");
    expect(blockedStep.getAttribute("aria-label")).toMatch(/bloqueado/i);
  });

  it("mantiene Plan académico nuevo bloqueado sin mostrar el mensaje informativo del ciclo", async () => {
    workflowState = "completed";

    render(<PanelSidebar currentStep="perfil-egreso" />);

    const tablist = screen.getByRole("tablist", {
      name: /secciones completadas de gestión académica/i,
    });

    expect(
      within(tablist).getByRole("tab", {
        name: /perfil de egreso/i,
      }),
    ).toBeInTheDocument();

    const newPlan = screen.getByRole("button", {
      name: /plan académico nuevo/i,
    });

    expect(newPlan).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByText(/solo puedes crear un nuevo plan académico/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/disponible desde/i)).not.toBeInTheDocument();

    await userEvent.click(newPlan);

    expect(window.alert).toHaveBeenCalledWith(
      expect.stringMatching(/1.5 años/i),
    );

    expect(newPlan).toHaveAttribute("aria-disabled", "true");
  });
});