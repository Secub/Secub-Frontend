import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  startCalls: [] as string[],
  autoStarts: [] as boolean[],
}));

vi.mock("../../../components/panel", () => ({
  BackButton: () => null,
  PanelLayout: ({
    children,
    onReplayTour,
  }: {
    children: React.ReactNode;
    onReplayTour?: () => void;
  }) => (
    <main>
      {onReplayTour ? (
        <button type="button" onClick={onReplayTour}>
          Ver guía
        </button>
      ) : null}
      {children}
    </main>
  ),
  WorkflowStateCard: () => null,
}));

vi.mock("../../../components/OnboardingTour", () => ({
  useOnboardingTour: (options: { storageKey: string; autoStart?: boolean }) => {
    state.autoStarts.push(options.autoStart ?? true);
    return { startTour: () => state.startCalls.push(options.storageKey) };
  },
}));

vi.mock("./hooks/useDashboardPage", () => ({
  useDashboardPage: () => ({
    isLoading: false,
    loadError: "",
    isTeacher: true,
    isDirector: false,
    view: "control",
    scopedCourses: [{}],
    scopedCycles: [],
    filteredCycles: [],
    consolidatedResults: [],
    metrics: {},
    layoutTitle: "Estado del ciclo",
    layoutDescription: "",
    user: {},
    dashboardData: { catalogs: {} },
    filters: {},
    filteredCourses: [],
    handleFilterChange: vi.fn(),
    handleResetFilters: vi.fn(),
    handleMeasureCourse: vi.fn(),
    handleViewCourseDetail: vi.fn(),
    setNotifyCourse: vi.fn(),
    setSelectedRa: vi.fn(),
    setReportCycle: vi.fn(),
    availableReportCompetences: [],
    selectedReportCompetences: [],
    improvementCycle: null,
    improvementDraft: "",
    improvementTitle: "",
    improvementError: "",
    handleConfirmNotifyTeacher: vi.fn(),
    handleToggleReportCompetence: vi.fn(),
    handleDownloadConsolidatedReport: vi.fn(),
    handleCloseImprovementPlan: vi.fn(),
    handleSaveImprovementPlan: vi.fn(),
  }),
}));

vi.mock("./hooks/useDashboardViewTours", () => ({
  useDashboardViewTours: () => ({ canShowViewTour: false, startViewTour: vi.fn() }),
}));

vi.mock("./components/MeasurementSummaryCards", () => ({
  default: () => null,
  buildSupervisorSummaryItems: () => [],
  buildTeacherSummaryItems: () => [],
}));
vi.mock("./components/DashboardFilters", () => ({ default: () => null }));
vi.mock("./components/CoursesMeasurementTable", () => ({ default: () => null }));
vi.mock("./components/DashboardModals", () => ({ default: () => null }));

import DashboardPage from "./DashboardPage";

describe("DashboardPage workflow completion tour", () => {
  beforeEach(() => {
    state.startCalls.length = 0;
    state.autoStarts.length = 0;
    window.history.replaceState(null, "", "/panel/dashboard?role=docente&workflowCompleted=true");
  });

  it("starts the role-specific tour after workflow completion and keeps replay available", async () => {
    render(<DashboardPage />);

    await waitFor(() => expect(state.startCalls).toEqual(["tour_dashboard_docente_v1"]));
    expect(state.autoStarts).toContain(false);
    expect(new URLSearchParams(window.location.search).has("workflowCompleted")).toBe(false);

    await userEvent.click(screen.getByRole("button", { name: "Ver guía" }));
    expect(state.startCalls).toEqual(["tour_dashboard_docente_v1", "tour_dashboard_docente_v1"]);
  });
});
