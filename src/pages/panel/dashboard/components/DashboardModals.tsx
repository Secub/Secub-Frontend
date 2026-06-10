import type { CompetenceCatalog, EnrichedCourse, EnrichedCycle, EnrichedRaResult } from "../dashboard.types";
import ConsolidatedReportModal from "./modals/ConsolidatedReportModal";
import ImprovementPlanModal from "./modals/ImprovementPlanModal";
import NotifyTeacherModal from "./modals/NotifyTeacherModal";
import RaDetailModal from "./modals/RaDetailModal";

interface DashboardModalsProps {
  selectedRa: EnrichedRaResult | null;
  notifyCourse: EnrichedCourse | null;
  reportCycle: EnrichedCycle | null;
  availableReportCompetences: CompetenceCatalog[];
  selectedReportCompetences: string[];
  improvementCycle: EnrichedCycle | null;
  improvementDraft: string;
  improvementError: string;
  onCloseSelectedRa: () => void;
  onCloseNotifyCourse: () => void;
  onConfirmNotifyTeacher: () => void;
  onCloseReportCycle: () => void;
  onToggleReportCompetence: (competenceId: string) => void;
  onDownloadConsolidatedReport: () => void;
  onCloseImprovementPlan: () => void;
  onSaveImprovementPlan: () => void;
  onImprovementDraftChange: (value: string) => void;
}

export default function DashboardModals({
  selectedRa,
  notifyCourse,
  reportCycle,
  availableReportCompetences,
  selectedReportCompetences,
  improvementCycle,
  improvementDraft,
  improvementError,
  onCloseSelectedRa,
  onCloseNotifyCourse,
  onConfirmNotifyTeacher,
  onCloseReportCycle,
  onToggleReportCompetence,
  onDownloadConsolidatedReport,
  onCloseImprovementPlan,
  onSaveImprovementPlan,
  onImprovementDraftChange,
}: DashboardModalsProps) {
  return (
    <>
      <RaDetailModal selectedRa={selectedRa} onClose={onCloseSelectedRa} />

      <NotifyTeacherModal
        notifyCourse={notifyCourse}
        onClose={onCloseNotifyCourse}
        onConfirm={onConfirmNotifyTeacher}
      />

      <ConsolidatedReportModal
        reportCycle={reportCycle}
        availableReportCompetences={availableReportCompetences}
        selectedReportCompetences={selectedReportCompetences}
        onClose={onCloseReportCycle}
        onToggleCompetence={onToggleReportCompetence}
        onDownload={onDownloadConsolidatedReport}
      />

      <ImprovementPlanModal
        improvementCycle={improvementCycle}
        improvementDraft={improvementDraft}
        improvementError={improvementError}
        onClose={onCloseImprovementPlan}
        onSave={onSaveImprovementPlan}
        onDraftChange={onImprovementDraftChange}
      />
    </>
  );
}
