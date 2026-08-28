import type { AcademicModulePermissions } from "../../../../config/access/permissions";
import { SECUB_PDF_BRANDING } from "../../../../config/pdfBranding";
import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Select,
  Table,
  type TableColumn,
} from "../../../../components/ui";
import { Badge } from "../../../../components/ui";
import {
  applyFilters,
  buildAvailableFilters,
  // buildCsvLikeExcel,
  // buildSimplePdf,
  formatPlanLabel,
  getEstadoBadgeVariant,
  // triggerBrowserDownload,
} from "../CompetenciasRa.utils";
import type {
  Catalogs,
  CompetenciasRaEnriched,
  CompetenciasRaFilters,
  CompetenciasRaPdfRow,
} from "../CompetenciasRa.types";
import type { PdfColumn } from "../../../../components/PdfTemplate";
import type { ExcelColumn } from "../../../../components/ExcelTemplate";
import { getExcelBranding } from "../../../../config/excelBranding";
import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface CompetenciasRaExportModalProps {
  open: boolean;
  title: string;
  format: "pdf" | "excel";
  permissions: AcademicModulePermissions;
  catalogs: Catalogs;
  baseRecords: CompetenciasRaEnriched[];
  initialFilters: CompetenciasRaFilters;
  onClose: () => void;
}

function formatCompetenciaSummary(row: CompetenciasRaEnriched) {
  const competenciaLabel = row.nombre?.trim() || `Competencia ${row.numero}`;
  const descripcion = row.descripcion.trim();

  return descripcion ? `${competenciaLabel}: ${descripcion}` : competenciaLabel;
}

// function formatLearningResultsSummary(row: CompetenciasRaEnriched) {
//   const learningResults = row.resultadosAprendizaje ?? [];

//   if (learningResults.length === 0) {
//     return "Sin RA's asignados";
//   }

//   return learningResults
//     .map((ra) => {
//       const raLabel = Number.isFinite(ra.numero) ? `RA ${ra.numero}` : "RA";
//       const descripcion = ra.descripcion.trim();

//       return descripcion ? `${raLabel}: ${descripcion}` : raLabel;
//     })
//     .join("\n");
// }

export function CompetenciasRaExportModal({
  open,
  title,
  format,
  permissions,
  catalogs,
  baseRecords,
  initialFilters,
  onClose,
}: CompetenciasRaExportModalProps) {
  const [filters, setFilters] = useState<CompetenciasRaFilters>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, open]);

  const filterOptions = useMemo(() => {
    return buildAvailableFilters(baseRecords, catalogs, filters);
  }, [baseRecords, catalogs, filters]);

  const exportRecords = useMemo(() => {
    return applyFilters(baseRecords, filters);
  }, [baseRecords, filters]);

  const pdfRecords = useMemo<CompetenciasRaPdfRow[]>(() => {
  return exportRecords.flatMap((record) => {
    const ras = record.resultadosAprendizaje ?? [];

    if (ras.length === 0) {
      return [{
        numeroCompetencia: record.numero,
        facultad: record.facultadNombre,
        programa: record.programaNombre,
        plan: record.planNombre,
        competencia: formatCompetenciaSummary(record),
        ra: "Sin RA's asignados",
        estado: record.estado === "activo"
          ? "Activo"
          : "Inactivo",
      }];
    }

    return ras.map((ra, index) => ({
      numeroCompetencia: index === 0 ? record.numero : 0,
      facultad: index === 0 ? record.facultadNombre : "",
      programa: index === 0 ? record.programaNombre : "",
      plan: index === 0 ? record.planNombre : "",
      competencia: index === 0
        ? formatCompetenciaSummary(record)
        : "",
      ra: `RA ${ra.numero}: ${ra.descripcion}`,
      estado: index === 0
        ? (record.estado === "activo"
            ? "Activo"
            : "Inactivo")
        : "",
    }));
  });
}, [exportRecords]);

  const columns: TableColumn<CompetenciasRaEnriched>[] = [
    {
      key: "facultad",
      title: "Facultad",
      render: (row) => row.facultadNombre,
      sortValue: (row) => row.facultadNombre,
      className: "min-w-[180px]",
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => row.programaNombre,
      sortValue: (row) => row.programaNombre,
      className: "min-w-[220px]",
    },
    {
      key: "plan",
      title: "Plan de estudio",
      render: (row) => row.planNombre,
      sortValue: (row) => row.planNombre,
      className: "min-w-[140px]",
    },
    {
      key: "competencia",
      title: "Competencia y descripción",
      render: (row) => (
        <p className="max-w-[560px] text-sm leading-6 text-[var(--color-gray-3)]">
          {formatCompetenciaSummary(row)}
        </p>
      ),
      sortValue: (row) => formatCompetenciaSummary(row),
      className: "min-w-[520px]",
    },
    {
      key: "resultadosAprendizaje",
      title: "RA's asignados",
      render: (row) => {
        const ras = row.resultadosAprendizaje ?? [];

        if (ras.length === 0) {
          return (
            <span className="text-sm text-[var(--color-gray-3)]">
              Sin RA's asignados
            </span>
          );
        }

        return (
          <div className="flex flex-col divide-y divide-gray-200">
            {ras.map((ra) => (
              <div
                key={ra.id}
                className="py-2 text-sm leading-6 text-[var(--color-gray-3)]"
              >
                <strong>RA {ra.numero}</strong>
                <div>{ra.descripcion}</div>
              </div>
            ))}
          </div>
        );
      },
      sortValue: (row) => (row.resultadosAprendizaje ?? []).length,
      className: "min-w-[600px]",
    },
    {
      key: "estado",
      title: "Estado",
      render: (row) => (
        <Badge variant={getEstadoBadgeVariant(row.estado)}>
          {row.estado === "activo" ? "Activo" : "Inactivo"}
        </Badge>
      ),
      sortValue: (row) => row.estado === "activo" ? "Activo" : "Inactivo",
      className: "min-w-[120px]",
    },
  ];

  const PDF_COLUMNS: PdfColumn<CompetenciasRaPdfRow>[] = [
    {
      header: "Facultad",
      widthPct: 10,
      accessor: (r) => r.facultad,
    },
    {
      header: "Programa",
      widthPct: 12,
      accessor: (r) => r.programa,
    },
    {
      header: "Plan",
      widthPct: 8,
      accessor: (r) => r.plan,
    },
    {
      header: "Competencia",
      widthPct: 34,
      accessor: (r) => r.competencia,
    },
    {
      header: "RA's asociados",
      widthPct: 28,
      accessor: (r) => r.ra,
    },
    {
      header: "Estado",
      widthPct: 8,
      accessor: (r) =>
        r.estado === "activo"
          ? "Activo"
          : "Inactivo",
    },
  ];

  const handleDownload = async () => {
    const timestamp = new Date()
      .toISOString()
      .slice(0, 10);

    if (format === "pdf") {
      const { downloadPdf } = await import(
        "../../../../components/PdfTemplate"
      );
      await downloadPdf(
        {
          title: "Competencias RAs Exportadas",
          subtitle: "Sistema de gestión académica",
          ...SECUB_PDF_BRANDING,
          footerText:
            "Documento generado automáticamente",
          columns: PDF_COLUMNS,
          records: pdfRecords,
          theme: {
            primary: "#474747",
          },
        },
        `competencias-ra-${timestamp}.pdf`,
      );

      return;
    }else{
      const branding = await getExcelBranding();

      const { downloadExcel } = await import(
        "../../../../components/ExcelTemplate"
      );
      await downloadExcel({
          title: "...",
          subtitle: "...",

          logoUrl: branding.logoUrl,
          logoUrl2: branding.logoUrl2,

          columns: excelColumns,
          records: exportRows,
      });

    }

    // const csvContent =
    //   buildCsvLikeExcel(exportRecords);

    // triggerBrowserDownload(
    //   csvContent,
    //   `competencias-ra-${timestamp}.csv`,
    //   "text/csv;charset=utf-8;",
    // );
  };

  //---------- Excel Download ----------

  const excelColumns: ExcelColumn<CompetenciasRaPdfRow>[] = [
  {
    header: "#",
    width: 8,
    accessor: r =>
        r.numeroCompetencia === 0
            ? ""
            : r.numeroCompetencia.toString(),
  },
  {
    header: "Facultad",
    width: 25,
    accessor: (r: CompetenciasRaPdfRow) => r.facultad,
  },
  {
    header: "Programa",
    width: 30,
    accessor: (r: CompetenciasRaPdfRow) => r.programa,
  },
  {
    header: "Plan",
    width: 18,
    accessor: (r: CompetenciasRaPdfRow) => r.plan,
  },
  {
    header: "Competencia",
    width: 45,
    accessor: (r: CompetenciasRaPdfRow) => r.competencia,
  },
  {
    header: "Resultado de aprendizaje",
    width: 55,
    accessor: (r: CompetenciasRaPdfRow) => r.ra,
  },
  {
    header: "Estado",
    width: 15,
    accessor: (r: CompetenciasRaPdfRow) => r.estado,
  },
  ];

//   const exportRows: CompetenciasRaPdfRow[] = baseRecords.flatMap(record =>
//   record.resultadosAprendizaje.map(ra => ({
//     facultad: record.facultadNombre,
//     programa: record.programaNombre,
//     plan: record.planNombre,
//     competencia: `${record.numero}. ${record.nombre}`,
//     ra: `${ra.numero}. ${ra.descripcion}`,
//     estado: record.estado,
//   }))
// );

const exportRows: CompetenciasRaPdfRow[] = [...exportRecords]

  .sort((a, b) => a.numero - b.numero)

  .flatMap((record) => {
    const ras = [...record.resultadosAprendizaje]
      .sort((a, b) => a.numero - b.numero);

    return ras.map((ra, index) => ({
      numeroCompetencia: index === 0 ? record.numero : 0,

      facultad: index === 0 ? record.facultadNombre : "",

      programa: index === 0 ? record.programaNombre : "",

      plan: index === 0 ? record.planNombre : "",

      competencia:
        index === 0
          ? `${record.numero}. ${record.nombre}`
          : "",

      ra: `RA ${ra.numero}. ${ra.descripcion}`,

      estado:
        index === 0
          ? record.estado
          : "",
    }));
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Configura los filtros y genera el archivo con los registros seleccionados."
      size="xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm leading-6 text-[var(--color-gray-3)]">
            {exportRecords.length} registro{exportRecords.length === 1 ? "" : "s"} listo
            {exportRecords.length === 1 ? "" : "s"} para exportar.
          </p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={exportRecords.length === 0}
              leftIcon={<ActionIcon name={format === "pdf" ? "pdf" : "excel"} />}
            >
              Descargar {format === "pdf" ? "PDF" : "Excel"}
            </Button>
          </div>
        </div>
      }
    >
      <div className="rounded-[24px] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-5">
        <div className="panel-filters-grid">
          {permissions.canFilterBySeccional ? (
            <Select
              label="Seccional"
              value={filters.seccionalId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  seccionalId: event.target.value,
                  lugarId: "",
                  facultadId: "",
                  programaId: "",
                  planId: "",
                }))
              }
              options={filterOptions.seccionales.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todas las seccionales"
            />
          ) : null}

          {permissions.canFilterByFacultad ? (
            <Select
              label="Facultad"
              value={filters.facultadId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  facultadId: event.target.value,
                  programaId: "",
                }))
              }
              options={filterOptions.facultades.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todas las facultades"
            />
          ) : null}

          {permissions.canFilterByPrograma ? (
            <Select
              label="Programa académico"
              value={filters.programaId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  programaId: event.target.value,
                }))
              }
              options={filterOptions.programas.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todos los programas"
            />
          ) : null}

          {permissions.canFilterByPlan ? (
            <Select
              label="Plan de estudios"
              value={filters.planId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  planId: event.target.value,
                }))
              }
              options={filterOptions.planes.map((item) => ({
                label: formatPlanLabel(item),
                value: item.id,
              }))}
              placeholder="Todos los planes"
            />
          ) : null}

          {permissions.canFilterByEstado ? (
            <Select
              label="Estado"
              value={filters.estado}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  estado: event.target.value as CompetenciasRaFilters["estado"],
                }))
              }
              options={[
                { label: "Activo", value: "activo" },
                { label: "Inactivo", value: "inactivo" },
              ]}
              placeholder="Todos los estados"
            />
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <Table
          columns={columns}
          data={exportRecords}
          rowKey={(row) => row.id}
          emptyMessage="No hay registros para exportar con la combinación de filtros actual."
        />
      </div>
    </Modal>
  );
}

export default CompetenciasRaExportModal;
