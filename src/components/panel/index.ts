export { default as PanelLayout } from "./PanelLayout";
export { default as PanelSidebar } from "./PanelSidebar";
export { default as SidebarRoleSwitcher } from "./SidebarRoleSwitcher";
export type { PanelStepKey } from "./panelNavigation";
export { panelNavigation } from "./panelNavigation";

export { default as WorkflowStateCard } from "./WorkflowStateCard";
export {
  WORKFLOW_LOCKED_MESSAGE,
  academicWorkflowSteps,
  inheritedAcademicBaseSteps,
  newAcademicPlanStartStep,
  getAcademicWorkflowLockedDescription,
  getAcademicWorkflowStepLabel,
  getPreviousAcademicWorkflowStep,
  getNewAcademicPlanRenewalAvailability,
  isAcademicWorkflowBaseStepInherited,
  isAcademicWorkflowStepCompleted,
  isAcademicWorkflowStepLocked,
  readAcademicWorkflowProgress,
  setAcademicWorkflowStepCompleted,
} from "./academicWorkflow";
