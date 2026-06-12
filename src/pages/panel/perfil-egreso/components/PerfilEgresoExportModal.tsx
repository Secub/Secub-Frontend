import { useEffect, useMemo, useState } from "react";
import { GoDownload } from "react-icons/go";
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
  buildCsvLikeExcel,
  buildSimplePdf,
  formatPlanLabel,
  getEstadoBadgeVariant,
  triggerBrowserDownload,
} from "../perfil-egreso.utils";
import type {
  Catalogs,
  PerfilEgresoEnriched,
  PerfilEgresoFilters,
  RolePermissions,
} from "../perfil-egreso.types";

interface PerfilEgresoExportModalProps {
  open: boolean;
  title: string;
  format: "pdf" | "excel";
  permissions: RolePermissions;
  catalogs: Catalogs;
  baseRecords: PerfilEgresoEnriched[];
  initialFilters: PerfilEgresoFilters;
  onClose: () => void;
}

export function PerfilEgresoExportModal({
  open,
  title,
  format,
  permissions,
  catalogs,
  baseRecords,
  initialFilters,
  onClose,
}: PerfilEgresoExportModalProps) {
  const [filters, setFilters] = useState<PerfilEgresoFilters>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, open]);

  const filterOptions = useMemo(() => {
    return buildAvailableFilters(baseRecords, catalogs, filters);
  }, [baseRecords, catalogs, filters]);

  const exportRecords = useMemo(() => {
    return applyFilters(baseRecords, filters);
  }, [baseRecords, filters]);

  const columns: TableColumn<PerfilEgresoEnriched>[] = [
    {
      key: "facultad",
      title: "Facultad",
      render: (row) => row.facultadNombre,
      className: "min-w-[180px]",
    },
    {
      key: "programa",
      title: "Programa académico",
      render: (row) => row.programaNombre,
      className: "min-w-[220px]",
    },
    {
      key: "lugar",
      title: "Lugar de desarrollo",
      render: (row) => row.lugarNombre,
      className: "min-w-[170px]",
    },
    {
      key: "plan",
      title: "Plan de estudio",
      render: (row) => row.planNombre,
      className: "min-w-[140px]",
    },
    {
      key: "descripcion",
      title: "Descripción",
      render: (row) => (
        <p className="max-w-[420px] text-sm leading-6 text-[var(--color-gray-3)]">
          {row.descripcion}
        </p>
      ),
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
      className: "min-w-[120px]",
    },
  ];

  const handleDownload = () => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === "pdf") {
      const pdfContent = buildSimplePdf(
        exportRecords,
        "Perfiles de egreso exportados",
      );
      triggerBrowserDownload(
        pdfContent,
        `perfiles-egreso-${timestamp}.pdf`,
        "application/pdf",
      );
      return;
    }

    const csvContent = buildCsvLikeExcel(exportRecords);
    triggerBrowserDownload(
      csvContent,
      `perfiles-egreso-${timestamp}.csv`,
      "text/csv;charset=utf-8;",
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Se simula la descarga con los registros filtrados dentro del alcance permitido por el rol actual."
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
              leftIcon={<GoDownload className="text-lg" />}
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
            <div className="panel-filter-item">
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
            </div>
          ) : null}

          <div className="panel-filter-item">
            <Select
              label="Lugar de desarrollo"
              value={filters.lugarId}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  lugarId: event.target.value,
                  facultadId: "",
                  programaId: "",
                }))
              }
              options={filterOptions.lugares.map((item) => ({
                label: item.nombre,
                value: item.id,
              }))}
              placeholder="Todos los lugares"
            />
          </div>

          {permissions.canFilterByFacultad ? (
            <div className="panel-filter-item">
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
            </div>
          ) : null}

          {permissions.canFilterByPrograma ? (
            <div className="panel-filter-item">
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
            </div>
          ) : null}

          {permissions.canFilterByPlan ? (
            <div className="panel-filter-item">
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
            </div>
          ) : null}

          {permissions.canFilterByEstado ? (
            <div className="panel-filter-item">
              <Select
                label="Estado"
                value={filters.estado}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    estado: event.target.value as PerfilEgresoFilters["estado"],
                  }))
                }
                options={[
                  { label: "Activo", value: "activo" },
                  { label: "Inactivo", value: "inactivo" },
                ]}
                placeholder="Todos los estados"
              />
            </div>
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

export default PerfilEgresoExportModal;