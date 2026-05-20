import { GoArrowLeft, GoCheckCircle, GoClock, GoGoal } from "react-icons/go";
import { Badge, Button, StepCircleProgress } from "../../../../components/ui";
import MapeoCompetenciasCardInfoCompromiso from "./MapeoCompetenciasCardInfoCompromiso";
import MapeoCompetenciasSemesterStep from "./MapeoCompetenciasSemesterStep";
import type { CompetenciaRaDemoRecord, CursoAsis, NivelCompromiso, NivelesDraft, NucleoFormacion } from "../MapeoCompetencias.types";
import { buildSemesterNumbers, getMappingKey, getNucleoLabel } from "../MapeoCompetencias.utils";

interface MapeoCompetenciasIraStepProps {
  activeSemester: number;
  totalSemestres: number;
  activeSemesterAssignedCount: number;
  activeSemesterTotalCount: number;
  nucleosDraft: Record<number, NucleoFormacion | null>;
  nivelesDraft: NivelesDraft;
  coursesBySemester: Record<number, CursoAsis[]>;
  competencias: CompetenciaRaDemoRecord[];
  canManage: boolean;
  onActiveSemesterChange: (semester: number) => void;
  onNivelChange: (cursoId: string, competenciaId: string, nivel: NivelCompromiso | "") => void;
  onSave: () => void;
  onFinish: () => void;
}

function isSemesterComplete(
  semester: number,
  coursesBySemester: Record<number, CursoAsis[]>,
  competencias: CompetenciaRaDemoRecord[],
  nivelesDraft: NivelesDraft,
) {
  const cursos = coursesBySemester[semester] ?? [];
  if (!cursos.length || !competencias.length) return false;

  return cursos.every((curso) =>
    competencias.every((competencia) => Boolean(nivelesDraft[getMappingKey(curso.id, competencia.id)])),
  );
}

export default function MapeoCompetenciasIraStep({
  activeSemester,
  totalSemestres,
  activeSemesterAssignedCount,
  activeSemesterTotalCount,
  nucleosDraft,
  nivelesDraft,
  coursesBySemester,
  competencias,
  canManage,
  onActiveSemesterChange,
  onNivelChange,
  onSave,
  onFinish,
}: MapeoCompetenciasIraStepProps) {
  const semesters = buildSemesterNumbers(totalSemestres);
  const completedSemesterIds = semesters
    .filter((semester) => isSemesterComplete(semester, coursesBySemester, competencias, nivelesDraft))
    .map((semester) => `semestre-${semester}`);

  return (
    <div className="space-y-6 pb-24">
      <section className="surface-card rounded-lg p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Flujo por semestres
            </h2>
            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
              Selecciona cada semestre para definir el nivel de compromiso de sus cursos frente a las competencias.
            </p>
          </div>

          <Badge variant={activeSemesterAssignedCount === activeSemesterTotalCount && activeSemesterTotalCount > 0 ? "success" : "warning"}>
            {activeSemesterAssignedCount}/{activeSemesterTotalCount} asignadas
          </Badge>
        </div>

        <StepCircleProgress
          activeId={`semestre-${activeSemester}`}
          completedIds={completedSemesterIds}
          items={semesters.map((semester) => ({
            id: `semestre-${semester}`,
            label: `Semestre ${semester}`,
            sublabel: getNucleoLabel(nucleosDraft[semester] ?? null),
            icon: <GoGoal className="text-xl" />,
          }))}
          onChange={(id) => {
            const semester = Number(id.replace("semestre-", ""));
            if (Number.isFinite(semester)) onActiveSemesterChange(semester);
          }}
        />
      </section>

      <MapeoCompetenciasCardInfoCompromiso />

      <MapeoCompetenciasSemesterStep
        semestreNumero={activeSemester}
        totalSemestres={totalSemestres}
        nucleo={nucleosDraft[activeSemester] ?? null}
        cursos={coursesBySemester[activeSemester] ?? []}
        competencias={competencias}
        nivelesDraft={nivelesDraft}
        disabled={!canManage}
        onNivelChange={onNivelChange}
      />

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-gray-6)] bg-[var(--color-white)] px-6 py-4 shadow-[var(--shadow-lg)] xl:left-[320px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
            Guarda avances parciales o finaliza cuando la matriz I-R-A-NA esté completa para todos los semestres con cursos y competencias.
          </p>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              variant="outline"
              leftIcon={<GoArrowLeft className="text-lg" />}
              onClick={() => onActiveSemesterChange(Math.max(1, activeSemester - 1))}
              disabled={activeSemester <= 1}
            >
              Anterior
            </Button>

            <Button
              variant="outline"
              leftIcon={<GoClock className="text-lg" />}
              onClick={onSave}
              disabled={!canManage}
            >
              Guardar progreso
            </Button>

            {activeSemester < totalSemestres ? (
              <Button
                variant="primary"
                leftIcon={<GoCheckCircle className="text-lg" />}
                onClick={() => onActiveSemesterChange(Math.min(totalSemestres, activeSemester + 1))}
              >
                Siguiente semestre
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon={<GoCheckCircle className="text-lg" />}
                onClick={onFinish}
                disabled={!canManage}
              >
                Finalizar mapeo
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
