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
  formatPlanLabel,
  getEstadoBadgeVariant,
} from "../proposito-formacion.utils";
import type {
  Catalogs,
  PropositoEnriched,
  PropositoFilters,
  PropositoPdfRow,
} from "../proposito-formacion.types";
import type { PdfColumn } from "../../../../components/PdfTemplate";
import type { ExcelColumn } from "../../../../components/ExcelTemplate";

import { getExcelBranding } from "../../../../config/excelBranding";

import { ActionIcon } from "../../../../components/ui/ActionIcon";
interface PropositoExportModalProps {
  open: boolean;
  title: string;
  format: "pdf" | "excel";
  permissions: AcademicModulePermissions;
  catalogs: Catalogs;
  baseRecords: PropositoEnriched[];
  initialFilters: PropositoFilters;
  onClose: () => void;
}

export function PropositoExportModal({
  open,
  title,
  format,
  permissions,
  catalogs,
  baseRecords,
  initialFilters,
  onClose,
}: PropositoExportModalProps) {
  const [filters, setFilters] = useState<PropositoFilters>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, open]);

  const filterOptions = useMemo(() => {
    return buildAvailableFilters(baseRecords, catalogs, filters);
  }, [baseRecords, catalogs, filters]);

  const exportRecords = useMemo(() => {
    return applyFilters(baseRecords, filters);
  }, [baseRecords, filters]);

  const pdfRecords = useMemo<PropositoPdfRow[]>(() => {
  return exportRecords.map((record) => ({
    facultad: record.facultadNombre,
    programa: record.programaNombre,
    plan: record.planNombre,
    descripcion: record.descripcion,
    estado:
      record.estado === "activo"
        ? "Activo"
        : "Inactivo",
  }));
  }, [exportRecords]);

  const columns: TableColumn<PropositoEnriched>[] = [
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
      key: "descripcion",
      title: "Descripción",
      render: (row) => (
        <p className="max-w-[420px] text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion.length > 150
            ? `${row.descripcion.slice(0, 150).trimEnd()}...`
            : row.descripcion}
        </p>
      ),
      sortValue: (row) => row.descripcion,
      className: "min-w-[340px]",
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

  const PDF_COLUMNS: PdfColumn<PropositoPdfRow>[] = [
  {
    header: "Facultad",
    widthPct: 18,
    accessor: r => r.facultad,
  },
  {
    header: "Programa académico",
    widthPct: 26,
    accessor: r => r.programa,
  },
  {
    header: "Plan de estudio",
    widthPct: 16,
    accessor: r => r.plan,
  },
  {
    header: "Descripción",
    widthPct: 30,
    accessor: r => r.descripcion,
  },
  {
    header: "Estado",
    widthPct: 10,
    accessor: r => r.estado,
  },
  ];

  // ------------- Excel export configuration -------------

  const excelColumns: ExcelColumn<PropositoPdfRow>[] = [
  {
    header: "Facultad",
    width: 25,
    accessor: r => r.facultad,
  },
  {
    header: "Programa académico",
    width: 30,
    accessor: r => r.programa,
  },
  {
    header: "Plan de estudio",
    width: 20,
    accessor: r => r.plan,
  },
  {
    header: "Descripción",
    width: 70,
    accessor: r => r.descripcion,
  },
  {
    header: "Estado",
    width: 15,
    accessor: r => r.estado,
  },
  ];

  const exportRows: PropositoPdfRow[] = [...exportRecords]
  .sort((a, b) => a.planNombre.localeCompare(b.planNombre))
  .map(record => ({
    facultad: record.facultadNombre,
    programa: record.programaNombre,
    plan: record.planNombre,
    descripcion: record.descripcion,
    estado:
      record.estado === "activo"
        ? "Activo"
        : "Inactivo",
  }));

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
        title: "Propósitos de Formación Exportados",
        subtitle: "Sistema de gestión académica",
        ...SECUB_PDF_BRANDING,
        footerText: "Documento generado automáticamente",
        columns: PDF_COLUMNS,
        records: pdfRecords,
        theme: {
          primary: "#474747",
        },
      },
      `propositos-formacion-${timestamp}.pdf`,
    );

    return;
  }

  const branding = await getExcelBranding();

  const { downloadExcel } = await import(
    "../../../../components/ExcelTemplate"
  );
  await downloadExcel(
    {
      title: "Propósitos de Formación",
      subtitle: "Sistema de Gestión Académica",

      logoUrl: branding.logoUrl,
      logoUrl2: branding.logoUrl2,

      columns: excelColumns,
      records: exportRows,

      theme: {
        primary: "#474747",
      },
    },
    `propositos-formacion-${timestamp}.xlsx`,
  );
};


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
                  estado: event.target.value as PropositoFilters["estado"],
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

export default PropositoExportModal;
