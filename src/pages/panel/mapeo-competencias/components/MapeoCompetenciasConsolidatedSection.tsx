import { GoPencil, GoPlus, GoTrash } from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
import MapeoCompetenciasAccessState from "./MapeoCompetenciasAccessState";
import MapeoCompetenciasSemestreResumenCard from "./MapeoCompetenciasSemestreResumenCard";
import type {
  CompetenciaRaDemoRecord,
  MapeoCompetenciasEnriched,
  NivelCompromiso,
} from "../MapeoCompetencias.types";
import { formatDate, getEstadoBadgeVariant } from "../MapeoCompetencias.utils";

interface MapeoCompetenciasConsolidatedSectionProps {
  records: MapeoCompetenciasEnriched[];
  competenciasRa?: CompetenciaRaDemoRecord[];
  hasRequiredFilters: boolean;
  canOpenCreate: boolean;
  canOpenEdit: boolean;
  selectedRecord: MapeoCompetenciasEnriched | null;
  canDelete: boolean;
  onCreate: () => void;
  onEdit: (record: MapeoCompetenciasEnriched) => void;
  onDelete: (record: MapeoCompetenciasEnriched) => void;
  onNivelChange?: (
    recordId: string,
    cursoId: string,
    competenciaId: string,
    nivel: "" | NivelCompromiso
  ) => void;
}

export default function MapeoCompetenciasConsolidatedSection({
  records,
  hasRequiredFilters,
  canOpenCreate,
  canOpenEdit,
  selectedRecord,
  canDelete,
  onCreate,
  onEdit,
  onDelete,
}: MapeoCompetenciasConsolidatedSectionProps) {
  if (!hasRequiredFilters) {
    return (
      <MapeoCompetenciasAccessState
        title="Selecciona un programa académico y un plan de estudios"
        description="El mapeo se consulta y se guarda por programaId y planId. Usa los filtros para visualizar la malla curricular."
      />
    );
  }

  if (records.length === 0) {
    return (
      <section className="surface-card p-8 text-center">
        <h2 className="font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
          Aún no hay datos disponibles para el mapeo de competencias
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
          Cuando el Director cree el mapeo, aquí se visualizará la malla curricular por semestres, cursos, núcleos y niveles I-R-A-NA.
        </p>
        {canOpenCreate ? (
          <div className="mt-5">
            <Button leftIcon={<GoPlus />} onClick={onCreate}>Crear mapeo</Button>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {records.map((record) => (
        <article key={record.id} className="surface-card overflow-hidden rounded-xl p-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-secondary-1)]">
                Visualización de Plan de Estudios
              </p>
              <h2 className="mt-1 font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                {record.programaNombre}
              </h2>
              <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                {record.planNombre} · Actualizado {formatDate(record.updatedAt)} · {record.semestresResumen.length} semestre(s)
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={getEstadoBadgeVariant(record.estado)}>{record.estado}</Badge>
              {canOpenEdit && record.id === selectedRecord?.id ? (
                <Button size="sm" variant="outline" leftIcon={<GoPencil />} onClick={() => onEdit(record)}>
                  Editar mapeo
                </Button>
              ) : null}
              {canDelete ? (
                <Button size="sm" variant="danger" leftIcon={<GoTrash />} onClick={() => onDelete(record)}>
                  Eliminar
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {record.semestresResumen.map((semestre) => (
              <MapeoCompetenciasSemestreResumenCard
                key={`${record.id}-${semestre.semestreNumero}`}
                record={record}
                semestre={semestre}
              />
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}
