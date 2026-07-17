import { GoArrowLeft } from "react-icons/go";
import { Button, Badge } from "../../../../components/ui";
import type { CursoSintesis } from "../../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  CourseAssignmentStatus,
  DraftSelections,
  MedicionRaRecord,
} from "../AsignarRA.types";
import { AsignarRACompetenceAccordion } from "./AsignarRACompetenceAccordion";
import { AsignarRADeleteZone } from "./AsignarRADeleteZone";
import { AsignarRAEmptyState } from "./AsignarRAEmptyState";

interface AsignarRACourseDetailProps {
  selectedCourse?: CursoSintesis;
  selectedCycle?: CicloDemoRecord;
  selectedCourseAssignments: AsignacionRaRecord[];
  courseCompetencias: CompetenciaRaDemoRecord[];
  draftSelections: DraftSelections;
  expandedCompetenciaIds: string[];
  measurements: MedicionRaRecord[];
  canManage: boolean;
  canDelete: boolean;
  hasUnsavedChanges: boolean;
  status?: CourseAssignmentStatus;
  onBackToCourses: () => void;
  onSave: () => void;
  onReset: () => void;
  onDelete: () => void;
  onToggleAccordion: (competenciaId: string) => void;
  onToggleRa: (competencia: CompetenciaRaDemoRecord, raId?: string) => void;
  getRaAssignment: (competenciaId: string, raId: string) => AsignacionRaRecord | undefined;
  isRaSelected: (competenciaId: string, raId: string) => boolean;
}

export function AsignarRACourseDetail({
  selectedCourse,
  selectedCycle,
  selectedCourseAssignments,
  courseCompetencias,
  draftSelections,
  expandedCompetenciaIds,
  measurements,
  canManage,
  canDelete,
  hasUnsavedChanges,
  status,
  onBackToCourses,
  onSave,
  onReset,
  onDelete,
  onToggleAccordion,
  onToggleRa,
  getRaAssignment,
  isRaSelected,
}: AsignarRACourseDetailProps) {
  if (!selectedCourse) {
    return (
      <AsignarRAEmptyState
        title="Selecciona un curso de Síntesis"
        description="El detalle del curso, las competencias y los RA seleccionables aparecerán aquí."
        badge="Detalle de asignación"
      />
    );
  }

  const topBarClass = hasUnsavedChanges
    ? "bg-[var(--color-warning)]"
    : status?.label === "Medido"
      ? "bg-[var(--color-success)]"
      : "bg-[var(--color-secondary-1)]";

  return (
    <section className="surface-card overflow-hidden">
      <div className={["h-2 w-full", topBarClass].join(" ")} />

      <div className="p-6 md:p-7">
        <div className="mb-5">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<GoArrowLeft className="text-lg" />}
            onClick={onBackToCourses}
          >
            Volver a cursos
          </Button>
        </div>

        <div className="flex flex-col gap-5 border-b border-[var(--color-gray-6)] pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">Curso seleccionado</Badge>
              {status ? <Badge variant={status.variant}>{status.label}</Badge> : null}
              {hasUnsavedChanges ? <Badge variant="warning">Cambios sin guardar</Badge> : null}
            </div>
            <h2 className="mt-3 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">{selectedCourse.nombre}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
              {selectedCourse.codigo} · Semestre {selectedCourse.semestre} · Periodo {selectedCycle?.periodo ?? selectedCycle?.nombre ?? "Ciclo"} · Docente: {selectedCourse.docente}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={onReset} disabled={!hasUnsavedChanges}>
              Cancelar cambios
            </Button>
            <Button onClick={onSave} disabled={!canManage}>
              {selectedCourseAssignments.length ? "Actualizar asignación" : "Guardar asignación"}
            </Button>
          </div>
        </div>

        {!canManage ? (
          <div className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
            Este rol puede consultar asignaciones, pero no puede editar RA. La asignación corresponde a Dirección de programa según el flujo RF07.
          </div>
        ) : null}

        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">Competencias del curso</h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                Selecciona entre 1 y 4 Resultados de Aprendizaje por competencia.
              </p>
            </div>
            <Badge variant={courseCompetencias.length ? "info" : "warning"}>{courseCompetencias.length} competencia(s)</Badge>
          </div>

          {courseCompetencias.length ? (
            <div className="space-y-4">
              {courseCompetencias.map((competencia, competenciaIndex) => (
                <AsignarRACompetenceAccordion
                  key={competencia.id}
                  competencia={competencia}
                  competenciaIndex={competenciaIndex}
                  isExpanded={expandedCompetenciaIds.includes(competencia.id)}
                  selectedRaIds={draftSelections[competencia.id] ?? []}
                  canManage={canManage}
                  measurements={measurements}
                  getRaAssignment={getRaAssignment}
                  isRaSelected={isRaSelected}
                  onToggleAccordion={onToggleAccordion}
                  onToggleRa={onToggleRa}
                />
              ))}
            </div>
          ) : (
            <AsignarRAEmptyState
              title="Este curso no tiene competencias asociadas"
              description="Este curso no tiene competencias asociadas. Revisa el Mapeo de Competencias. Puedes seleccionar otro curso de Síntesis para continuar con la asignación."
              badge="Sin mapeo"
              actionLabel="Volver a cursos"
              onAction={onBackToCourses}
            />
          )}
        </div>

        <AsignarRADeleteZone
          canDelete={canDelete}
          hasAssignments={selectedCourseAssignments.length > 0}
          onDelete={onDelete}
        />
      </div>
    </section>
  );
}
