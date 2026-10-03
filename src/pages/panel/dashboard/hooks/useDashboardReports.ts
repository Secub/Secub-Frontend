import { useEffect, useMemo, useState } from "react";
import { showNotification } from "../../../../shared/feedback";
import type { CompetenceCatalog, DashboardCatalogs, EnrichedCourse, EnrichedCycle } from "../dashboard.types";
import { getAvailableCompetences, getRaResultsForCourses } from "../dashboard.utils";

interface DashboardReportRow {
  course: string;
  teacher: string;
  competence: string;
  learningOutcome: string;
  students: string;
  compliance: string;
  status: string;
}

function reportRows(courses: EnrichedCourse[], catalogs: DashboardCatalogs, competenceIds?: Set<string>) {
  return getRaResultsForCourses(courses, catalogs)
    .filter((result) => !competenceIds || competenceIds.has(result.competenceId))
    .map((result): DashboardReportRow => ({
      course: `${result.courseCode} · ${result.courseName}`,
      teacher: result.teacherName,
      competence: `${result.competenceCode} · ${result.competenceName}`,
      learningOutcome: `${result.raCode} · ${result.raName}`,
      students: result.hasMeasurement
        ? `${result.approvedStudents}/${result.totalStudents} aprobados`
        : "Pendiente de medición",
      compliance: result.hasMeasurement ? `${result.compliance}%` : "Pendiente",
      status: result.hasMeasurement
        ? (result.reachedTarget ? "Cumple" : "No cumple")
        : "Pendiente",
    }));
}

async function downloadCyclePdf(
  cycle: EnrichedCycle,
  courses: EnrichedCourse[],
  catalogs: DashboardCatalogs,
  competenceIds?: Set<string>,
) {
  const rows = reportRows(courses, catalogs, competenceIds);
  if (rows.length === 0) throw new Error("El ciclo no tiene resultados disponibles para las competencias seleccionadas.");
  const { downloadPdf } = await import("../../../../components/PdfTemplate");
  await downloadPdf<DashboardReportRow>({
    title: `Reporte de medición · ${cycle.name}`,
    subtitle: `${cycle.programaName} · ${cycle.planName} · Periodo ${cycle.period}`,
    footerText: "Generado por SECUB",
    columns: [
      { header: "Curso", widthPct: 20, accessor: (row) => row.course },
      { header: "Docente", widthPct: 14, accessor: (row) => row.teacher },
      { header: "Competencia", widthPct: 20, accessor: (row) => row.competence },
      { header: "Resultado de aprendizaje", widthPct: 22, accessor: (row) => row.learningOutcome },
      { header: "Estudiantes", widthPct: 10, accessor: (row) => row.students },
      { header: "Cumplimiento", widthPct: 7, accessor: (row) => row.compliance },
      { header: "Estado", widthPct: 7, accessor: (row) => row.status },
    ],
    records: rows,
  }, `reporte-medicion-${cycle.period}.pdf`);
}

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
      const courses = scopedCourses.filter((course) => course.cycleId === cycle.id);
      void downloadCyclePdf(cycle, courses, catalogs).catch((error: unknown) => {
        showNotification(error instanceof Error ? error.message : "No fue posible generar el reporte.");
      });
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
    if (!reportCycle) return;
    const cycle = reportCycle;
    const selected = new Set(selectedReportCompetences);
    void downloadCyclePdf(cycle, reportCycleCourses, catalogs, selected)
      .then(() => setReportCycle(null))
      .catch((error: unknown) => {
        showNotification(error instanceof Error ? error.message : "No fue posible generar el reporte consolidado.");
      });
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
