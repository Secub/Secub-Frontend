import { useEffect, useMemo, useState } from "react";
import { GoCheck, GoInfo } from "react-icons/go";
import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepLocked,
} from "../../../components/panel";
import { Badge, Button, Select } from "../../../components/ui";
import { getCurrentMockUser } from "../../../services/auth/mockUser";
import { mockBackend } from "../../../services/mockBackend";
import { isCompetenciaRaValidByLearningResults } from "../../../utils/learningResultsRules";
import { getCatalogs } from "../competencias-ra/CompetenciasRa.mock";
import { getCicloCatalogs } from "../ciclo/ciclo.mock";
import type { CursoSintesis, NucleoCurso } from "../ciclo/ciclo.types";

interface ResultadoAprendizajeDemoRecord {
  id: string;
  numero?: number;
  descripcion?: string;
}

interface CompetenciaRaDemoRecord {
  id: string;
  propositoFormacionId?: string;
  seccionalId?: string;
  facultadId?: string;
  lugarId?: string;
  programaId?: string;
  planId?: string;
  nombre?: string;
  descripcion?: string;
  resultadosAprendizaje?: ResultadoAprendizajeDemoRecord[];
}

interface PropositoDemoRecord {
  id: string;
  perfilEgresoId?: string;
  seccionalId?: string;
  facultadId?: string;
  lugarId?: string;
  programaId?: string;
  planId?: string;
}

type NivelMapeo = "I" | "R" | "A" | "NA";

interface CursoMapeo {
  cursoId: string;
  cursoNombre: string;
  cursoCodigo: string;
  semestre: number;
  nucleo: NucleoCurso;
  competenciaRaId: string;
  competenciaRaIds: string[];
  competenciaNombre?: string;
  nivel: NivelMapeo;
}

interface SemestreClasificado {
  semestre: number;
  nucleo: NucleoCurso;
}

interface MapeoCompetenciasRecord {
  id: string;
  competenciaRaIds: string[];
  propositoFormacionId?: string;
  perfilEgresoId?: string;
  seccionalId?: string;
  facultadId?: string;
  lugarId?: string;
  programaId?: string;
  planId?: string;
  estado: "activo" | "inactivo";
  descripcion: string;
  semestresClasificados?: SemestreClasificado[];
  cursosMapeados: CursoMapeo[];
  createdAt: string;
  updatedAt: string;
}

type CurriculumCourse = Pick<CursoSintesis, "id" | "nombre" | "codigo" | "creditos" | "semestre" | "nucleo" | "programaId" | "planId">;

type MappingDraft = Record<string, NivelMapeo>;
type SemesterClassificationDraft = Record<number, NucleoCurso>;

const currentUser = getCurrentMockUser();
const academicCatalogs = getCatalogs();
const cicloCatalogs = getCicloCatalogs();
const levels: Array<{ value: NivelMapeo; label: string; description: string }> = [
  {
    value: "I",
    label: "Introduce (I)",
    description: "El curso presenta las bases de la competencia y permite un primer acercamiento del estudiante.",
  },
  {
    value: "R",
    label: "Refuerza (R)",
    description: "El curso profundiza y consolida habilidades previamente introducidas.",
  },
  {
    value: "A",
    label: "Afianza (A)",
    description: "El curso permite evidenciar dominio, integración y aplicación avanzada de la competencia.",
  },
  {
    value: "NA",
    label: "No Aplica (NA)",
    description: "El curso no contribuye directamente a esa competencia en el plan seleccionado.",
  },
];

const semesterClassificationOptions: Array<{ label: NucleoCurso; value: NucleoCurso }> = [
  { label: "Fundamentación", value: "Fundamentación" },
  { label: "Profesionalización", value: "Profesionalización" },
  { label: "Síntesis", value: "Síntesis" },
];

function getDefaultSemesterClassification(): SemesterClassificationDraft {
  return Array.from({ length: 10 }, (_, index) => index + 1).reduce<SemesterClassificationDraft>(
    (draft, semester) => {
      draft[semester] = getNucleoBySemester(semester);
      return draft;
    },
    {},
  );
}

function serializeSemesterClassification(classification: SemesterClassificationDraft): SemestreClasificado[] {
  return Array.from({ length: 10 }, (_, index) => index + 1).map((semester) => ({
    semestre: semester,
    nucleo: classification[semester] ?? getNucleoBySemester(semester),
  }));
}

function getNucleoBySemester(semester: number): NucleoCurso {
  if (semester <= 4) return "Fundamentación";
  if (semester <= 6) return "Profesionalización";
  return "Síntesis";
}

function buildFallbackCourse(planId: string, programaId: string, semester: number): CurriculumCourse {
  const nucleo = getNucleoBySemester(semester);
  const codePrefix = nucleo === "Fundamentación" ? "FUN" : nucleo === "Profesionalización" ? "PRO" : "SIN";

  return {
    id: `curso-${planId}-${semester}-base`,
    nombre: `${nucleo} ${semester}`,
    codigo: `${codePrefix}-${String(semester).padStart(2, "0")}`,
    creditos: semester >= 7 ? 3 : 2,
    semestre: semester,
    nucleo,
    programaId,
    planId,
  };
}

function buildCurriculumCourses(planId: string, programaId: string): CurriculumCourse[] {
  if (!planId || !programaId) return [];

  const realCourses = cicloCatalogs.cursos
    .filter((course) => course.planId === planId && course.programaId === programaId)
    .map<CursoSintesis>((course) => ({
      ...course,
      nucleo: getNucleoBySemester(course.semestre),
    }));

  const realBySemester = new Map<number, CurriculumCourse[]>();
  realCourses.forEach((course) => {
    const current = realBySemester.get(course.semestre) ?? [];
    current.push(course);
    realBySemester.set(course.semestre, current);
  });

  return Array.from({ length: 10 }, (_, index) => index + 1).flatMap((semester) => {
    const courses = realBySemester.get(semester);
    return courses?.length ? courses : [buildFallbackCourse(planId, programaId, semester)];
  });
}

function getMappingKey(courseId: string, competenciaId: string) {
  return `${courseId}__${competenciaId}`;
}

function getRelatedProposito(competencia?: CompetenciaRaDemoRecord) {
  if (!competencia) return undefined;

  return mockBackend
    .list<PropositoDemoRecord>("propositosFormacion", currentUser)
    .find(
      (proposito) =>
        proposito.id === competencia.propositoFormacionId ||
        proposito.planId === competencia.planId ||
        proposito.programaId === competencia.programaId,
    );
}

function applyRoleScopeToPlan(plan: { programaId: string }) {
  const userProgramId = currentUser.scope.programaId ?? currentUser.scope.academicProgramId;
  if (!userProgramId) return true;
  return plan.programaId === userProgramId;
}

export default function MapeoCompetenciasPage() {
  const [records, setRecords] = useState<MapeoCompetenciasRecord[]>(() =>
    mockBackend.list<MapeoCompetenciasRecord>("mapeosCompetencias", currentUser),
  );
  const [selectedPlanId, setSelectedPlanId] = useState(() => currentUser.scope.planId ?? "");
  const [mappingDraft, setMappingDraft] = useState<MappingDraft>({});
  const [semesterClassification, setSemesterClassification] = useState<SemesterClassificationDraft>(() =>
    getDefaultSemesterClassification(),
  );
  const [savedMessage, setSavedMessage] = useState("");

  const isStepLocked = isAcademicWorkflowStepLocked("mapeo-competencias");
  const canEdit = currentUser.role === "director";
  const canRead = currentUser.role !== "docente";

  const planOptions = useMemo(() => {
    return academicCatalogs.planes
      .filter(applyRoleScopeToPlan)
      .map((plan) => ({
        label: plan.estado === "inactivo" ? `${plan.nombre} (Inactivo)` : plan.nombre,
        value: plan.id,
      }));
  }, []);

  const selectedPlan = useMemo(
    () => academicCatalogs.planes.find((plan) => plan.id === selectedPlanId),
    [selectedPlanId],
  );

  const selectedProgram = useMemo(
    () => academicCatalogs.programas.find((program) => program.id === selectedPlan?.programaId),
    [selectedPlan?.programaId],
  );

  const competencias = useMemo(() => {
    return mockBackend
      .list<CompetenciaRaDemoRecord>("competenciasRa", currentUser)
      .filter((competencia) => {
        const samePlan = competencia.planId === selectedPlanId;
        const sameProgram = Boolean(selectedProgram?.id && competencia.programaId === selectedProgram.id);
        return (samePlan || sameProgram) && isCompetenciaRaValidByLearningResults(competencia);
      });
  }, [selectedPlanId, selectedProgram?.id, records.length]);

  const invalidCompetenciasCount = useMemo(() => {
    return mockBackend
      .list<CompetenciaRaDemoRecord>("competenciasRa", currentUser)
      .filter((competencia) => {
        const samePlan = competencia.planId === selectedPlanId;
        const sameProgram = Boolean(selectedProgram?.id && competencia.programaId === selectedProgram.id);
        return (samePlan || sameProgram) && !isCompetenciaRaValidByLearningResults(competencia);
      }).length;
  }, [selectedPlanId, selectedProgram?.id, records.length]);

  const currentRecord = useMemo(() => {
    return records.find((record) => record.planId === selectedPlanId && record.programaId === selectedProgram?.id);
  }, [records, selectedPlanId, selectedProgram?.id]);

  const curriculumCourses = useMemo(() => {
    return buildCurriculumCourses(selectedPlanId, selectedProgram?.id ?? "").map((course) => ({
      ...course,
      nucleo: semesterClassification[course.semestre] ?? getNucleoBySemester(course.semestre),
    }));
  }, [selectedPlanId, selectedProgram?.id, semesterClassification]);

  const groupedCourses = useMemo(() => {
    return Array.from({ length: 10 }, (_, index) => index + 1).map((semester) => ({
      semester,
      nucleo: semesterClassification[semester] ?? getNucleoBySemester(semester),
      courses: curriculumCourses.filter((course) => course.semestre === semester),
    }));
  }, [curriculumCourses, semesterClassification]);

  useEffect(() => {
    const nextDraft: MappingDraft = {};
    currentRecord?.cursosMapeados.forEach((item) => {
      nextDraft[getMappingKey(item.cursoId, item.competenciaRaId)] = item.nivel;
    });

    const nextClassification = getDefaultSemesterClassification();
    currentRecord?.semestresClasificados?.forEach((item) => {
      nextClassification[item.semestre] = item.nucleo;
    });

    setMappingDraft(nextDraft);
    setSemesterClassification(nextClassification);
    setSavedMessage("");
  }, [currentRecord, selectedPlanId]);

  const mappedItems = useMemo(() => {
    return Object.entries(mappingDraft)
      .map(([key, nivel]) => {
        const [cursoId, competenciaRaId] = key.split("__");
        const course = curriculumCourses.find((item) => item.id === cursoId);
        const competencia = competencias.find((item) => item.id === competenciaRaId);

        if (!course || !competencia) return null;

        return {
          cursoId: course.id,
          cursoNombre: course.nombre,
          cursoCodigo: course.codigo,
          semestre: course.semestre,
          nucleo: course.nucleo,
          competenciaRaId: competencia.id,
          competenciaRaIds: [competencia.id],
          competenciaNombre: competencia.nombre ?? competencia.descripcion ?? "Competencia",
          nivel,
        } satisfies CursoMapeo;
      })
      .filter((item): item is CursoMapeo => Boolean(item));
  }, [competencias, curriculumCourses, mappingDraft]);

  const handleLevelChange = (courseId: string, competenciaId: string, value: string) => {
    if (!canEdit) return;

    const key = getMappingKey(courseId, competenciaId);
    setMappingDraft((current) => {
      if (!value) {
        const { [key]: _removed, ...rest } = current;
        return rest;
      }

      return {
        ...current,
        [key]: value as NivelMapeo,
      };
    });
  };

  const handleSemesterClassificationChange = (semester: number, value: string) => {
    if (!canEdit || !value) return;

    setSemesterClassification((current) => ({
      ...current,
      [semester]: value as NucleoCurso,
    }));
  };

  const handleSave = () => {
    if (!canEdit || !selectedPlan || !selectedProgram) return;

    if (competencias.length === 0) {
      window.alert("No hay competencias válidas para mapear. Cada competencia debe tener mínimo 1 y máximo 4 RA con descripción.");
      return;
    }

    if (mappedItems.length === 0) {
      window.alert("Selecciona al menos un nivel I, R, A o NA para guardar el mapeo.");
      return;
    }

    const firstCompetencia = competencias[0];
    const relatedProposito = getRelatedProposito(firstCompetencia);
    const now = new Date().toISOString();
    const nextRecord: MapeoCompetenciasRecord = {
      id: currentRecord?.id ?? `mapeo-${selectedPlan.id}-${Date.now()}`,
      competenciaRaIds: competencias.map((competencia) => competencia.id),
      propositoFormacionId: firstCompetencia.propositoFormacionId ?? relatedProposito?.id,
      perfilEgresoId: relatedProposito?.perfilEgresoId,
      seccionalId: firstCompetencia.seccionalId ?? selectedProgram.seccionalId,
      facultadId: firstCompetencia.facultadId ?? selectedProgram.facultadId,
      lugarId: firstCompetencia.lugarId,
      programaId: selectedProgram.id,
      planId: selectedPlan.id,
      estado: "activo",
      descripcion: `Mapeo curricular RF05 para ${selectedProgram.nombre} · ${selectedPlan.nombre}.`,
      semestresClasificados: serializeSemesterClassification(semesterClassification),
      cursosMapeados: mappedItems,
      createdAt: currentRecord?.createdAt ?? now,
      updatedAt: now,
    };

    setRecords(mockBackend.upsert<MapeoCompetenciasRecord>("mapeosCompetencias", nextRecord, currentUser));
    setSavedMessage("Mapeo de competencias guardado correctamente en mockBackend.");
  };

  const mappedByLevel = levels.map((level) => ({
    ...level,
    count: mappedItems.filter((item) => item.nivel === level.value).length,
  }));

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Mapeo de Competencias"
      description="RF05: selección del plan, visualización de la malla curricular y asignación I-R-A-NA por curso y competencia."
      actions={!isStepLocked && canEdit ? (
        <Button variant="primary" leftIcon={<GoCheck className="text-lg" />} onClick={handleSave}>
          Guardar mapeo
        </Button>
      ) : undefined}
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("mapeo-competencias")}
          helperText="Una competencia con 0 RA, RA sin descripción o más de 4 RA mantiene este paso bloqueado."
        />
      ) : !canRead ? (
        <WorkflowStateCard
          variant="locked"
          title="Módulo no disponible para Docente"
          description="El Docente no visualiza Mapeo de Competencias. Su flujo operativo está en Dashboard y Medición RA."
        />
      ) : (
        <div className="space-y-6">
          <section className="surface-card p-6">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.45fr)] lg:items-end">
              <div>
                <Select
                  label="Plan de estudios"
                  value={selectedPlanId}
                  options={planOptions}
                  placeholder="Selecciona un plan de estudios"
                  disabled={!canEdit}
                  onChange={(event) => setSelectedPlanId(event.target.value)}
                  helperText={canEdit ? "Solo el Director puede definir o modificar el mapeo." : "Consulta habilitada según alcance del rol."}
                />
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-sm leading-6 text-[var(--color-gray-3)]">
                <p><strong>Programa:</strong> {selectedProgram?.nombre ?? "Sin programa"}</p>
                <p><strong>Estado plan:</strong> {selectedPlan?.estado ?? "Sin plan"}</p>
              </div>
            </div>

            {savedMessage ? (
              <div className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[color:rgba(118,202,102,0.14)] px-4 py-3 text-sm font-medium text-[var(--color-secondary-4)]">
                {savedMessage}
              </div>
            ) : null}
          </section>

          <section className="surface-card p-6">
            <div className="mb-5 flex items-start gap-3">
              <GoInfo className="mt-1 shrink-0 text-xl text-[var(--color-secondary-1)]" />
              <div>
                <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  Niveles de aporte por curso
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                  Por cada curso y competencia se guarda un único nivel: Introduce, Refuerza, Afianza o No Aplica.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              {levels.map((level) => (
                <div key={level.value} className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
                  <Badge variant={level.value === "NA" ? "neutral" : "info"}>{level.label}</Badge>
                  <p className="mt-3 text-xs leading-5 text-[var(--color-gray-3)]">{level.description}</p>
                </div>
              ))}
            </div>
          </section>

          {invalidCompetenciasCount > 0 ? (
            <div className="rounded-[var(--radius-lg)] border border-[var(--color-warning)] bg-[var(--color-surface-soft)] px-5 py-4 text-sm leading-6 text-[var(--color-gray-3)]">
              Hay {invalidCompetenciasCount} competencia(s) del plan con RA incompletos o fuera del máximo de 4. No se muestran para asignación hasta corregirlas en Competencias y RA.
            </div>
          ) : null}

          {!selectedPlanId ? (
            <WorkflowStateCard
              title="Selecciona un plan de estudios"
              description="El mapeo se define por plan, programa, cursos, competencias y nivel I-R-A-NA."
            />
          ) : competencias.length === 0 ? (
            <WorkflowStateCard
              title="No hay competencias válidas para este plan"
              description="Crea competencias con mínimo 1 y máximo 4 RA descritos antes de continuar con el mapeo."
            />
          ) : (
            <section className="space-y-5">
              {groupedCourses.map((group) => (
                <div key={group.semester} className="surface-card p-5">
                  <div className="mb-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end">
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                        Semestre {group.semester}
                      </h3>
                      <p className="text-sm text-[var(--color-gray-3)]">
                        Clasificación persistida por semestre. Solo se permite un núcleo por semestre.
                      </p>
                    </div>
                    <Select
                      label="Clasificación del semestre"
                      value={group.nucleo}
                      options={semesterClassificationOptions}
                      disabled={!canEdit}
                      onChange={(event) => handleSemesterClassificationChange(group.semester, event.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    {group.courses.map((course) => (
                      <article key={course.id} className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                              {course.nombre}
                            </h4>
                            <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                              {course.codigo} · {course.creditos} créditos
                            </p>
                          </div>
                          <Badge variant="info">{group.nucleo}</Badge>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {competencias.map((competencia, index) => {
                            const key = getMappingKey(course.id, competencia.id);
                            return (
                              <div key={competencia.id} className="rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">
                                  Competencia {index + 1}
                                </p>
                                <p className="mt-1 line-clamp-2 text-sm font-medium text-[var(--color-secondary-4)]">
                                  {competencia.nombre ?? competencia.descripcion ?? "Competencia"}
                                </p>
                                <div className="mt-3">
                                  <Select
                                    value={mappingDraft[key] ?? ""}
                                    options={levels.map((level) => ({ label: level.label, value: level.value }))}
                                    placeholder="Nivel"
                                    disabled={!canEdit}
                                    onChange={(event) => handleLevelChange(course.id, competencia.id, event.target.value)}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          )}

          <section className="surface-card p-6">
            <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
              Resumen detallado del mapeo
            </h2>
            <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
              La información queda persistida con programaId, planId, competenciaRaIds, cursoId, semestre y nivel.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {mappedByLevel.map((level) => (
                <div key={level.value} className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4 text-center">
                  <p className="text-2xl font-semibold text-[var(--color-secondary-4)]">{level.count}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-gray-4)]">{level.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-gray-6)]">
              <table className="w-full text-left text-sm">
                <thead className="bg-[var(--color-surface-soft)] text-[var(--color-gray-4)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Curso</th>
                    <th className="px-4 py-3 font-semibold">Competencia</th>
                    <th className="px-4 py-3 font-semibold">Semestre</th>
                    <th className="px-4 py-3 font-semibold">Núcleo</th>
                    <th className="px-4 py-3 font-semibold">Nivel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-gray-6)] bg-white">
                  {mappedItems.length > 0 ? mappedItems.slice(0, 12).map((item) => (
                    <tr key={`${item.cursoId}-${item.competenciaRaId}`}>
                      <td className="px-4 py-3 text-[var(--color-secondary-4)]">{item.cursoCodigo} · {item.cursoNombre}</td>
                      <td className="px-4 py-3 text-[var(--color-gray-3)]">{item.competenciaNombre}</td>
                      <td className="px-4 py-3 text-[var(--color-gray-3)]">{item.semestre}</td>
                      <td className="px-4 py-3 text-[var(--color-gray-3)]">{item.nucleo}</td>
                      <td className="px-4 py-3"><Badge variant={item.nivel === "NA" ? "neutral" : "success"}>{item.nivel}</Badge></td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-[var(--color-gray-3)]">
                        Aún no hay niveles seleccionados para el plan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </PanelLayout>
  );
}
