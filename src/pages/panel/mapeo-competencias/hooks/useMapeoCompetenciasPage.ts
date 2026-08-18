import { SECUB_PDF_BRANDING } from "../../../../config/pdfBranding";
import { useEffect, useMemo, useState } from "react";
import { ROUTES, buildRouteWithSearch, navigateToRoute } from "../../../../app/appRoutes";

import { mockBackend } from "../../../../services/mockBackend";
import { canManageMapeo, getAcademicModulePermissions } from "../../../../config/access/permissions";
import type { SecubRole } from "../../../../config/access/roles";
import type {
  MapeoCompetenciasEnriched,
  MapeoCompetenciasFilters as FiltersState,
  MapeoCompetenciasRecord,
  SummaryMetric,
} from "../MapeoCompetencias.types";
import {
  INITIAL_FILTERS,
  applyFilters,
  applyRoleScope,
  // buildCsvLikeExcel,
  // downloadTextFile,
  enrichMapeoRecords,
  // printMapeoCompetenciasPdf,
} from "../MapeoCompetencias.utils";
import { useMapeoCompetenciasData } from "./useMapeoCompetenciasData";
import {
  downloadPdf,
  type PdfColumn,
} from "../../../../components/PdfTemplate";
import {
  downloadExcel,
  type ExcelColumn,
} from "../../../../components/ExcelTemplate";

import { getExcelBranding } from "../../../../config/excelBranding";


function buildCreatePath(role: SecubRole, programaId?: string, planId?: string) {
  const params = new URLSearchParams({ role });
  if (programaId) params.set("programaId", programaId);
  if (planId) params.set("planId", planId);
  return buildRouteWithSearch(ROUTES.panelMapeoCompetenciasCrear, params);
}

function buildEditPath(role: SecubRole, record: MapeoCompetenciasEnriched) {
  const params = new URLSearchParams({ role, id: record.id, programaId: record.programaId, planId: record.planId });
  return buildRouteWithSearch(ROUTES.panelMapeoCompetenciasEditar, params);
}

export function useMapeoCompetenciasPage() {
  const data = useMapeoCompetenciasData();
  const { currentUser, catalogs, cursos, competenciasRa, records } = data;
  const permissions = getAcademicModulePermissions("mapeoCompetencias", currentUser.role);
  const [filters, setFilters] = useState<FiltersState>(() => ({
    ...INITIAL_FILTERS,
    seccionalId: currentUser.scope.seccionalId ?? "",
    facultadId: currentUser.scope.facultadId ?? "",
    programaId: currentUser.scope.programaId ?? currentUser.scope.academicProgramId ?? "",
    planId: currentUser.scope.planId ?? "",
  }));
  const [recordToDelete, setRecordToDelete] = useState<MapeoCompetenciasEnriched | null>(null);

  useEffect(() => {
    if (filters.programaId && !filters.planId) {
      const firstActivePlan = catalogs.planes.find(
        (plan) => plan.programaId === filters.programaId && plan.estado === "activo",
      );
      if (firstActivePlan) setFilters((current) => ({ ...current, planId: firstActivePlan.id }));
    }
  }, [catalogs.planes, filters.planId, filters.programaId]);

  const enrichedRecords = useMemo(
    () => enrichMapeoRecords(records, catalogs, cursos, competenciasRa),
    [catalogs, competenciasRa, cursos, records],
  );
  const scopedRecords = useMemo(() => applyRoleScope(enrichedRecords, currentUser), [currentUser, enrichedRecords]);
  const hasRecords = scopedRecords.length > 0;
  const filteredRecords = useMemo(() => applyFilters(scopedRecords, filters), [filters, scopedRecords]);
  const selectedPrograma = useMemo(
    () => catalogs.programas.find((programa) => programa.id === filters.programaId),
    [catalogs.programas, filters.programaId],
  );
  const selectedPlan = useMemo(() => catalogs.planes.find((plan) => plan.id === filters.planId), [catalogs.planes, filters.planId]);
  const selectedRecord = useMemo(
    () => scopedRecords.find((record) => record.programaId === filters.programaId && record.planId === filters.planId) ?? null,
    [filters.planId, filters.programaId, scopedRecords],
  );

  const canOpenCreate =
    permissions.canCreate &&
    currentUser.role === "director" &&
    selectedPrograma?.estado === "activo" &&
    selectedPlan?.estado === "activo" &&
    Boolean(filters.programaId && filters.planId) &&
    !selectedRecord;
  const canOpenEdit =
    permissions.canUpdate &&
    currentUser.role === "director" &&
    selectedRecord?.programaEstado === "activo" &&
    selectedRecord?.planEstado === "activo";

  const summaryMetrics = useMemo<SummaryMetric[]>(() => {
    const activeRecord = selectedRecord ?? filteredRecords[0];
    const allSemesters = filteredRecords.flatMap((record) => record.semestresResumen);
    const semestresClasificados = allSemesters.filter((semestre) => Boolean(semestre.nucleo)).length;
    const competenciasMapeadas = new Set(
      filteredRecords.flatMap((record) => (record.nivelesCompromiso ?? []).map((nivel) => nivel.competenciaId)),
    ).size;
    const cursosConAsignacion = new Set(
      filteredRecords.flatMap((record) => (record.nivelesCompromiso ?? []).map((nivel) => nivel.cursoId)),
    ).size;
    const semestresPendientes = allSemesters.filter(
      (semestre) => semestre.estado === "pendiente" || semestre.estado === "en-progreso",
    ).length;

    return [
      { label: "Semestres clasificados", value: semestresClasificados, helper: activeRecord ? "Núcleos guardados por programa y plan." : "Selecciona un programa y plan para ver datos.", variant: "info" },
      { label: "Competencias mapeadas", value: competenciasMapeadas, helper: "Competencias con al menos un nivel I-R-A-NA.", variant: "success" },
      { label: "Cursos con asignación", value: cursosConAsignacion, helper: "Cursos con niveles definidos en la matriz.", variant: "accent" },
      { label: "Semestres pendientes", value: semestresPendientes, helper: "Semestres sin clasificación o con matriz incompleta. Los clasificados sin cursos no quedan en progreso.", variant: semestresPendientes ? "warning" : "success" },
    ];
  }, [filteredRecords, selectedRecord]);

  const handleCreate = () => {
    navigateToRoute(buildCreatePath(currentUser.role, filters.programaId, filters.planId));
  };

  const handleEdit = (record: MapeoCompetenciasEnriched) => {
    navigateToRoute(buildEditPath(currentUser.role, record));
  };

  const handleExportExcel = async () => {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 10);

    const branding = await getExcelBranding();

    await downloadExcel(
      {
        title: "Mapeo de Competencias",
        subtitle: "Sistema de gestión académica",

        logoUrl: branding.logoUrl,
        logoUrl2: branding.logoUrl2,

        columns: EXCEL_COLUMNS,
        records: buildExportRecords(),
      },
      `Mapeo-Competencias-${timestamp}.xlsx`,
    );
  };


  const handleDownloadpdf = async () => {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 10);
    await downloadPdf(
      {
        title: "Mapeo Competencias Exportadas",
        subtitle: "Sistema de gestión académica",
        ...SECUB_PDF_BRANDING,
        footerText:
          "Documento generado automáticamente",
        columns: PDF_COLUMNS,
        records: buildExportRecords(),
        theme: {
          primary: "#474747",
        },
      },
      `Mapeo-Competencias-${timestamp}.pdf`,
    );

    return;
  };


  // const filterOptions = useMemo(() => {
  //   return buildAvailableFilters(catalogs, filters, baseUser, );
  // }, [baseUser, catalogs, filters]);

  // const exportRecords = useMemo(() => {
  //   return applyFilters(enrichedRecords , filters);
  // }, [enrichedRecords , filters]);

  type ExportRecord = {
  programa: string;
  plan: string;
  semestre: number;
  nucleo: string;
  estado: string;
  cursos: number;
  niveles: string;
};

const buildExportRecords = (): ExportRecord[] => {
  return filteredRecords
    .flatMap((record) =>
      record.semestresResumen.map((semestre) => ({
        programa: record.programaNombre,
        plan: record.planNombre,

        semestre: semestre.semestreNumero,

        nucleo: semestre.nucleo ?? "-",

        estado:
          semestre.estado === "completo"
            ? "Completo"
            : semestre.estado === "en-progreso"
              ? "En progreso"
              : "Pendiente",

        cursos: semestre.cursos.length,

        niveles: `${semestre.totalAsignadas}/${semestre.totalCeldas}`,
      })),
    )
    .sort((a, b) => {
      if (a.programa !== b.programa) {
        return a.programa.localeCompare(b.programa);
      }

      if (a.plan !== b.plan) {
        return a.plan.localeCompare(b.plan);
      }

      return a.semestre - b.semestre;
    });
};

  // const [filters, setFilters] = useState<MapeoCompetenciasFilters>(initialFilters);

  const PDF_COLUMNS: PdfColumn<ExportRecord>[] = [
    {
      header: "Programa\nacadémico",
      widthPct: 22,
      accessor: (r) => r.programa,
    },
    {
      header: "Plan de\nestudios",
      widthPct: 18,
      accessor: (r) => r.plan,
    },
    {
      header: "Semestre",
      widthPct: 10,
      accessor: (r) => String(r.semestre),
    },
    {
      header: "Núcleo",
      widthPct: 18,
      accessor: (r) => r.nucleo,
    },
    {
      header: "Estado\nsemestre",
      widthPct: 14,
      accessor: (r) => r.estado,
    },
    {
      header: "Cursos",
      widthPct: 8,
      accessor: (r) => String(r.cursos),
    },
    {
      header: "Niveles\nasignados",
      widthPct: 10,
      accessor: (r) => r.niveles,
    },
  ];

  const EXCEL_COLUMNS: ExcelColumn<ExportRecord>[] = [
    {
      header: "Programa académico",
      width: 30,
      accessor: (r) => r.programa,
    },
    {
      header: "Plan de estudios",
      width: 22,
      accessor: (r) => r.plan,
    },
    {
      header: "Semestre",
      width: 12,
      accessor: (r) => String(r.semestre),
    },
    {
      header: "Núcleo",
      width: 25,
      accessor: (r) => r.nucleo,
    },
    {
      header: "Estado",
      width: 18,
      accessor: (r) => r.estado,
    },
    {
      header: "Cursos",
      width: 12,
      accessor: (r) => String(r.cursos),
    },
    {
      header: "Niveles asignados",
      width: 20,
      accessor: (r) => r.niveles,
    },
  ];


  // const handleExportPdf = () => {
  //   printMapeoCompetenciasPdf(filteredRecords);
  // };

  const confirmDelete = () => {
    if (!recordToDelete) return;

    if (!permissions.canDelete || !canManageMapeo(currentUser.role, selectedPrograma?.estado)) {
      setRecordToDelete(null);
      return;
    }

    mockBackend.remove<MapeoCompetenciasRecord>("mapeosCompetencias", recordToDelete.id, currentUser);
    setRecordToDelete(null);
  };

  return {
    currentUser,
    catalogs,
    permissions,
    hasRecords,
    filters,
    filteredRecords,
    selectedPrograma,
    selectedPlan,
    selectedRecord,
    canOpenCreate,
    canOpenEdit,
    summaryMetrics,
    recordToDelete,
    setFilters,
    setRecordToDelete,
    handleCreate,
    handleEdit,
    handleExportExcel,
    handleDownloadpdf,
    // handleExportPdf,
    confirmDelete,
  };
}