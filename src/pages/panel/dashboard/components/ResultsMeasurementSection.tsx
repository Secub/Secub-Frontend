import { GoChecklist, GoDownload, GoInfo } from "react-icons/go";
import { Badge, Button, Table, type TableColumn } from "../../../../components/ui";
import type { RaResultSummary } from "../dashboard-ra.types";
import RaSimpleBarChart from "./RaSimpleBarChart";

interface ResultsMeasurementSectionProps {
  title?: string;
  description?: string;
  results: RaResultSummary[];
  onDownload: (fileName: string) => void;
  onOpenRaDetail: (result: RaResultSummary) => void;
}

export default function ResultsMeasurementSection({
  title = "Resultados de Medición",
  description = "Consulta resultados por competencia y RA, con instrumentos, evidencias y planes de mejora disponibles según el target institucional.",
  results,
  onDownload,
  onOpenRaDetail,
}: ResultsMeasurementSectionProps) {
  const columns: TableColumn<RaResultSummary>[] = [
    {
      key: "course",
      title: "Nombre curso",
      render: (row) => (
        <div>
          <p className="font-semibold text-[var(--color-secondary-4)]">{row.courseName}</p>
          <p className="mt-1 text-xs text-[var(--color-gray-4)]">{row.courseCode} · {row.teacherName}</p>
        </div>
      ),
      className: "panel-table-cell-wrap",
    },
    {
      key: "ra",
      title: "RA",
      render: (row) => (
        <button
          type="button"
          onClick={() => onOpenRaDetail(row)}
          className="text-left font-semibold text-[var(--color-secondary-1)] hover:underline"
          title="Ver detalle informativo del RA"
        >
          {row.competenceCode} · {row.raCode}
          <span className="ml-2 inline-flex align-middle text-[var(--color-gray-4)]">
            <GoInfo />
          </span>
        </button>
      ),
    },
    {
      key: "students",
      title: "Estudiantes",
      render: (row) => (
        <div className="space-y-1 text-xs text-[var(--color-gray-3)]">
          <p>Total: <strong>{row.totalStudents}</strong></p>
          <p>Aprobaron: <strong>{row.approvedStudents}</strong></p>
          <p>No aprobaron: <strong>{row.notApprovedStudents}</strong></p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Estado",
      render: (row) => (
        <div className="space-y-2">
          <Badge variant={row.status === "aprobado" ? "success" : "danger"}>
            {row.status === "aprobado" ? "Aprobado" : "No aprobado"}
          </Badge>
          <p className="text-xs font-semibold text-[var(--color-gray-4)]">{row.fulfillment}% cumplimiento</p>
        </div>
      ),
    },
    {
      key: "downloads",
      title: "Descargas",
      render: (row) => (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<GoDownload className="text-lg" />}
            onClick={() => onDownload(row.instrumentFile)}
          >
            Instrumento
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<GoDownload className="text-lg" />}
            onClick={() => onDownload(row.evidenceFile)}
          >
            Evidencias
          </Button>
          <Button
            variant={row.status === "no-aprobado" ? "primary_soft" : "outline"}
            size="sm"
            leftIcon={<GoChecklist className="text-lg" />}
            disabled={row.status === "aprobado"}
            title={
              row.status === "aprobado"
                ? "El plan de mejora solo se habilita cuando el cumplimiento es menor al 70%."
                : "Descargar plan de mejora"
            }
            onClick={() => onDownload(row.improvementPlanFile ?? `Plan_mejora_${row.raCode}.pdf`)}
          >
            Plan de mejora
          </Button>
        </div>
      ),
      className: "min-w-[190px]",
    },
  ];

  return (
    <section className="space-y-5">
      <div className="surface-card p-6">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
              {title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--color-gray-3)]">
              {description}
            </p>
          </div>
        </div>

        <RaSimpleBarChart results={results} />
      </div>

      <Table
        columns={columns}
        data={results}
        rowKey={(row) => row.id}
        emptyMessage="No hay resultados finalizados para mostrar con los filtros actuales."
      />
    </section>
  );
}
