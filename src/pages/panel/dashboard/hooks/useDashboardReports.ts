import { useEffect, useMemo, useState } from "react";
import type { CompetenceCatalog, DashboardCatalogs, EnrichedCourse, EnrichedCycle } from "../dashboard.types";
import { getAvailableCompetences, simulateReportDownload } from "../dashboard.utils";

export function useDashboardReports({
  catalogs,
  isTeacher,
  scopedCourses,
}: {
  catalogs: DashboardCatalogs;
  isTeacher: boolean;
  scopedCourses: EnrichedCourse[];
}) {
  const [reportCycle, setReportCycle] = useState<EnrichedCycle | null>(null);
  const [selectedReportCompetences, setSelectedReportCompetences] = useState<string[]>([]);

  const reportCycleCourses = useMemo(() => {
    if (!reportCycle) return [];
    return scopedCourses.filter((course) => course.cycleId === reportCycle.id);
  }, [reportCycle, scopedCourses]);

  const availableReportCompetences: CompetenceCatalog[] = useMemo(
    () => getAvailableCompetences(reportCycleCourses, catalogs),
    [reportCycleCourses, catalogs],
  );

  useEffect(() => {
    setSelectedReportCompetences((current) => {
      const availableIds = new Set(availableReportCompetences.map((competence) => competence.id));
      const filtered = current.filter((competenceId) => availableIds.has(competenceId));

      if (filtered.length > 0) return filtered;
      return availableReportCompetences[0] ? [availableReportCompetences[0].id] : [];
    });
  }, [availableReportCompetences]);

  const handleDownloadCycleReport = (cycle: EnrichedCycle) => {
    const isCycleClosed = cycle.progress >= 100 && Boolean(cycle.hasImprovementPlan);
    if (!isCycleClosed) return;

    if (isTeacher) {
      simulateReportDownload(`Reporte individual docente - ${cycle.name}`);
      return;
    }

    setReportCycle(cycle);
  };

  const handleToggleReportCompetence = (competenceId: string) => {
    setSelectedReportCompetences((current) =>
      current.includes(competenceId)
        ? current.filter((item) => item !== competenceId)
        : [...current, competenceId],
    );
  };

  const handleDownloadConsolidatedReport = () => {
    simulateReportDownload(
      `Reporte consolidado ${reportCycle?.name ?? "sin ciclo"} - ${selectedReportCompetences.length} competencia(s)`,
    );
    setReportCycle(null);
  };

  return {
    reportCycle,
    selectedReportCompetences,
    availableReportCompetences,
    setReportCycle,
    handleDownloadCycleReport,
    handleToggleReportCompetence,
    handleDownloadConsolidatedReport,
  };
}
