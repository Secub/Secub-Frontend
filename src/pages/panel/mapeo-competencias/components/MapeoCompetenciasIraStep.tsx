import { GoArrowLeft, GoCheckCircle, GoClock, GoGoal } from "react-icons/go";
import { Badge, Button } from "../../../../components/ui";
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

interface SemesterFlowProps {
  semesters: number[];
  activeSemester: number;
  completedSemesterIds: string[];
  nucleosDraft: Record<number, NucleoFormacion | null>;
  onActiveSemesterChange: (semester: number) => void;
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

function SemesterFlow({
  semesters,
  activeSemester,
  completedSemesterIds,
  nucleosDraft,
  onActiveSemesterChange,
}: SemesterFlowProps) {
  const completedSet = new Set(completedSemesterIds);
  const lastCompletedIndex = semesters.reduce(
    (lastIndex, semester, index) => completedSet.has(`semestre-${semester}`) ? index : lastIndex,
    -1,
  );
  const progressPercentage = semesters.length <= 1
    ? lastCompletedIndex >= 0 ? 100 : 0
    : Math.max(0, Math.round((lastCompletedIndex / (semesters.length - 1)) * 100));

  return (
    <div className="-mx-2 overflow-x-auto px-2 pb-2">
      <div className="min-w-max px-1">
        <div className="relative flex items-start gap-4">
          <div className="absolute left-6 right-6 top-[22px] h-1 rounded-full bg-[var(--color-gray-6)]" />
          <div
            className="absolute left-6 top-[22px] h-1 rounded-full bg-[var(--color-success)] transition-all duration-300"
            style={{ width: `calc((100% - 3rem) * ${progressPercentage / 100})` }}
          />

          {semesters.map((semester) => {
            const itemId = `semestre-${semester}`;
            const isActive = semester === activeSemester;
            const isCompleted = completedSet.has(itemId);
            const nucleoLabel = getNucleoLabel(nucleosDraft[semester] ?? null);

            return (
              <button
                key={itemId}
                type="button"
                onClick={() => onActiveSemesterChange(semester)}
                className="group relative z-10 flex min-w-[118px] max-w-[132px] flex-col items-center text-center focus-visible:outline-none"
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  className={[
                    "inline-flex h-11 w-11 items-center justify-center rounded-full border-4 text-sm font-bold shadow-sm transition-all duration-200 group-focus-visible:ring-4 group-focus-visible:ring-[color:rgba(14,101,217,0.18)]",
                    isCompleted
                      ? "border-[var(--color-success)] bg-[var(--color-success)] text-white"
                      : isActive
                        ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-white"
                        : "border-[var(--color-secondary-4)] bg-white text-[var(--color-secondary-4)] group-hover:border-[var(--color-secondary-1)] group-hover:text-[var(--color-secondary-1)]",
                  ].join(" ")}
                >
                  {isCompleted ? (
                    <GoCheckCircle className="text-xl" />
                  ) : isActive ? (
                    <GoGoal className="text-xl" />
                  ) : (
                    semester
                  )}
                </span>

                <span
                  className={[
                    "mt-3 w-full break-words text-[11px] font-semibold uppercase leading-4 tracking-[0.08em] transition-colors",
                    isActive
                      ? "text-[var(--color-secondary-1)]"
                      : isCompleted
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-gray-3)]",
                  ].join(" ")}
                >
                  Semestre {semester}
                </span>

                <span className="mt-1 w-full max-w-[112px] whitespace-normal break-words text-center text-xs font-semibold leading-4 text-[var(--color-secondary-4)]">
                  {nucleoLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
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

        <SemesterFlow
          semesters={semesters}
          activeSemester={activeSemester}
          completedSemesterIds={completedSemesterIds}
          nucleosDraft={nucleosDraft}
          onActiveSemesterChange={onActiveSemesterChange}
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
