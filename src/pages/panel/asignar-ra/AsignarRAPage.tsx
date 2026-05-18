import { useEffect, useMemo, useState } from "react";
import { GoCheck, GoLink, GoLock, GoSearch } from "react-icons/go";
import {
  PanelLayout,
  WorkflowStateCard,
  getAcademicWorkflowLockedDescription,
  isAcademicWorkflowStepLocked,
} from "../../../components/panel";
import { Badge, Button, Select } from "../../../components/ui";
import {
  buildDemoDocenteIdFromName,
  getCurrentMockUser,
  resolveDemoDocenteByName,
} from "../../../services/auth/mockUser";
import { mockBackend } from "../../../services/mockBackend";
import {
  getDescribedLearningResults,
  isCompetenciaRaValidByLearningResults,
} from "../../../utils/learningResultsRules";
import { getCatalogs } from "../competencias-ra/CompetenciasRa.mock";
import { getCicloCatalogs } from "../ciclo/ciclo.mock";
import type { CursoSintesis } from "../ciclo/ciclo.types";

interface CicloDemoRecord {
  id: string;
  nombre?: string;
  periodo?: string;
  mapeoCompetenciasId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  cursoIds?: string[];
  estado?: string;
}

interface ResultadoAprendizajeDemoRecord {
  id?: string;
  numero?: number;
  descripcion?: string;
}

interface CompetenciaRaDemoRecord {
  id: string;
  programaId?: string;
  planId?: string;
  nombre?: string;
  descripcion?: string;
  resultadosAprendizaje?: ResultadoAprendizajeDemoRecord[];
}

interface MapeoDemoRecord {
  id: string;
  programaId?: string;
  planId?: string;
  cursosMapeados?: Array<{
    cursoId: string;
    competenciaRaId?: string;
    nivel?: "I" | "R" | "A" | "NA";
  }>;
}

interface AsignacionRaRecord {
  id: string;
  cicloId?: string;
  cursoId?: string;
  cursoIds: string[];
  competenciaRaId?: string;
  competenciaRaIds?: string[];
  resultadoAprendizajeId?: string;
  resultadoAprendizajeIds: string[];
  estado: "activa" | "incompleta";
  userId?: string;
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
  docenteNombre?: string;
  docenteId?: string;
  docenteEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface MedicionRaRecord {
  id: string;
  cicloId?: string;
  asignacionRaId?: string;
  asignacionRaIds?: string[];
  selectedCourseId?: string;
  completed?: boolean;
  isEvaluationLocked?: boolean;
}

type MeasurementFilter = "" | "medido" | "pendiente";

const currentUser = getCurrentMockUser();
const academicCatalogs = getCatalogs();
const cicloCatalogs = getCicloCatalogs();

function getAssignmentId(cicloId: string, cursoId: string, competenciaId: string, raId: string) {
  return `asignacion-${cicloId}-${cursoId}-${competenciaId}-${raId}`;
}

function resolveCourseDocente(course: CursoSintesis) {
  const docente = resolveDemoDocenteByName(course.docente);

  return {
    id: docente?.id ?? buildDemoDocenteIdFromName(course.docente),
    nombre: docente?.nombre ?? course.docente,
    email: docente?.email ?? "",
  };
}

function isRaSelected(
  records: AsignacionRaRecord[],
  cicloId: string,
  cursoId: string,
  competenciaId: string,
  raId: string,
) {
  return records.some(
    (record) =>
      record.cicloId === cicloId &&
      record.cursoId === cursoId &&
      record.competenciaRaId === competenciaId &&
      record.resultadoAprendizajeId === raId,
  );
}

function getAssignmentStatus(record: AsignacionRaRecord | undefined, mediciones: MedicionRaRecord[]) {
  if (!record) return "pendiente" as const;

  const measured = mediciones.some(
    (medicion) =>
      (medicion.completed || medicion.isEvaluationLocked) &&
      (medicion.asignacionRaId === record.id || medicion.asignacionRaIds?.includes(record.id)),
  );

  return measured ? "medido" as const : "pendiente" as const;
}

function getCourseAssignment(
  records: AsignacionRaRecord[],
  cicloId: string,
  cursoId: string,
  competenciaId: string,
  raId: string,
) {
  return records.find(
    (record) =>
      record.cicloId === cicloId &&
      record.cursoId === cursoId &&
      record.competenciaRaId === competenciaId &&
      record.resultadoAprendizajeId === raId,
  );
}

function getCycleCourses(cycle?: CicloDemoRecord) {
  if (!cycle) return [];
  const courseIds = new Set(cycle.cursoIds ?? []);

  return cicloCatalogs.cursos.filter((course) => {
    if (!courseIds.has(course.id)) return false;
    if (course.nucleo !== "Síntesis") return false;
    return true;
  });
}

function getMappedCompetenceIdsForCourse(courseId: string, cycle?: CicloDemoRecord) {
  const relatedMapeo = mockBackend
    .list<MapeoDemoRecord>("mapeosCompetencias", currentUser)
    .find((mapeo) => {
      if (cycle?.mapeoCompetenciasId && mapeo.id === cycle.mapeoCompetenciasId) return true;
      return mapeo.planId === cycle?.planId || mapeo.programaId === cycle?.programaId;
    });

  return new Set(
    (relatedMapeo?.cursosMapeados ?? [])
      .filter((item) => item.cursoId === courseId && item.nivel !== "NA" && item.competenciaRaId)
      .map((item) => item.competenciaRaId as string),
  );
}

export default function AsignarRAPage() {
  const [records, setRecords] = useState<AsignacionRaRecord[]>(() =>
    mockBackend.list<AsignacionRaRecord>("asignacionesRa", currentUser),
  );
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedProgramId, setSelectedProgramId] = useState(() => currentUser.scope.programaId ?? currentUser.scope.academicProgramId ?? "");
  const [selectedPlanId, setSelectedPlanId] = useState(() => currentUser.scope.planId ?? "");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [measurementFilter, setMeasurementFilter] = useState<MeasurementFilter>("");

  const isStepLocked = isAcademicWorkflowStepLocked("asignar-ra");
  const canAssign = currentUser.role === "director";
  const canRead = currentUser.role !== "docente";

  const cycles = useMemo(() => {
    return mockBackend.list<CicloDemoRecord>("ciclosMedicion", currentUser).filter((cycle) => {
      if (selectedProgramId && cycle.programaId !== selectedProgramId) return false;
      if (selectedPlanId && cycle.planId !== selectedPlanId) return false;
      if (selectedPeriod && cycle.periodo !== selectedPeriod) return false;
      return true;
    });
  }, [records.length, selectedProgramId, selectedPlanId, selectedPeriod]);

  useEffect(() => {
    if (!selectedCycleId && cycles[0]) {
      setSelectedCycleId(cycles[0].id);
      setSelectedProgramId(cycles[0].programaId ?? selectedProgramId);
      setSelectedPlanId(cycles[0].planId ?? selectedPlanId);
      setSelectedPeriod(cycles[0].periodo ?? "");
    }

    if (selectedCycleId && !cycles.some((cycle) => cycle.id === selectedCycleId)) {
      setSelectedCycleId(cycles[0]?.id ?? "");
      setSelectedCourseId("");
    }
  }, [cycles, selectedCycleId, selectedPlanId, selectedProgramId]);

  const selectedCycle = useMemo(
    () => cycles.find((cycle) => cycle.id === selectedCycleId),
    [cycles, selectedCycleId],
  );

  const courses = useMemo(() => getCycleCourses(selectedCycle), [selectedCycle]);

  useEffect(() => {
    if (!selectedCourseId && courses[0]) {
      setSelectedCourseId(courses[0].id);
    }

    if (selectedCourseId && !courses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(courses[0]?.id ?? "");
    }
  }, [courses, selectedCourseId]);

  const selectedCourse = useMemo(
    () => courses.find((course) => course.id === selectedCourseId),
    [courses, selectedCourseId],
  );

  const competencias = useMemo(() => {
    if (!selectedCycle || !selectedCourse) return [];

    const mappedCompetenceIds = getMappedCompetenceIdsForCourse(selectedCourse.id, selectedCycle);

    return mockBackend
      .list<CompetenciaRaDemoRecord>("competenciasRa", currentUser)
      .filter((competencia) => {
        const samePlan = competencia.planId && competencia.planId === selectedCycle.planId;
        const sameProgram = competencia.programaId && competencia.programaId === selectedCycle.programaId;
        const validRa = isCompetenciaRaValidByLearningResults(competencia);
        const mappedOrFallback = mappedCompetenceIds.size === 0 || mappedCompetenceIds.has(competencia.id);
        return (samePlan || sameProgram) && validRa && mappedOrFallback;
      });
  }, [selectedCycle, selectedCourse, records.length]);

  const mediciones = useMemo(
    () => mockBackend.list<MedicionRaRecord>("medicionesRa", currentUser),
    [records.length],
  );

  const periodOptions = useMemo(() => {
    const periods = new Set(mockBackend.list<CicloDemoRecord>("ciclosMedicion", currentUser).map((cycle) => cycle.periodo).filter(Boolean));
    return Array.from(periods).map((period) => ({ label: period as string, value: period as string }));
  }, [records.length]);

  const programOptions = useMemo(() => {
    return academicCatalogs.programas
      .filter((program) => {
        const scopedProgram = currentUser.scope.programaId ?? currentUser.scope.academicProgramId;
        return scopedProgram ? program.id === scopedProgram : true;
      })
      .map((program) => ({ label: program.nombre, value: program.id }));
  }, []);

  const planOptions = useMemo(() => {
    return academicCatalogs.planes
      .filter((plan) => !selectedProgramId || plan.programaId === selectedProgramId)
      .map((plan) => ({
        label: plan.estado === "inactivo" ? `${plan.nombre} (Inactivo)` : plan.nombre,
        value: plan.id,
      }));
  }, [selectedProgramId]);

  const visibleCompetencias = useMemo(() => {
    if (!measurementFilter || !selectedCycle || !selectedCourse) return competencias;

    return competencias.filter((competencia) => {
      return getDescribedLearningResults(competencia).some((ra) => {
        const assignment = getCourseAssignment(records, selectedCycle.id, selectedCourse.id, competencia.id, ra.id);
        return getAssignmentStatus(assignment, mediciones) === measurementFilter;
      });
    });
  }, [competencias, mediciones, measurementFilter, records, selectedCourse, selectedCycle]);

  const handleSelectRa = (
    course: CursoSintesis,
    competencia: CompetenciaRaDemoRecord,
    ra: ResultadoAprendizajeDemoRecord,
  ) => {
    if (!canAssign || !selectedCycle || !ra.id) return;

    const now = new Date().toISOString();
    const docente = resolveCourseDocente(course);
    const nextRecord: AsignacionRaRecord = {
      id: getAssignmentId(selectedCycle.id, course.id, competencia.id, ra.id),
      cicloId: selectedCycle.id,
      cursoId: course.id,
      cursoIds: [course.id],
      competenciaRaId: competencia.id,
      competenciaRaIds: [competencia.id],
      resultadoAprendizajeId: ra.id,
      resultadoAprendizajeIds: [ra.id],
      estado: "activa",
      seccionalId: selectedCycle.seccionalId,
      facultadId: selectedCycle.facultadId,
      programaId: selectedCycle.programaId,
      planId: selectedCycle.planId,
      docenteNombre: docente.nombre,
      docenteId: docente.id,
      docenteEmail: docente.email,
      // TODO: reemplazar resolveCourseDocente por directorio institucional/backend cuando exista la relación curso-docente real.
      createdAt: now,
      updatedAt: now,
    };

    setRecords(mockBackend.upsert<AsignacionRaRecord>("asignacionesRa", nextRecord, currentUser));
  };

  return (
    <PanelLayout
      currentStep="asignar-ra"
      title="Asignar Resultados de Aprendizaje"
      description="RF07: selección de ciclo, curso, periodo, programa, plan y asignación de RA por competencia."
    >
      {isStepLocked ? (
        <WorkflowStateCard
          variant="locked"
          title="Este paso aún no está disponible"
          description={getAcademicWorkflowLockedDescription("asignar-ra")}
          helperText="La restricción secuencial se valida desde mapeos persistidos y competencias válidas."
        />
      ) : !canRead ? (
        <WorkflowStateCard
          variant="locked"
          title="Asignar RA no está disponible para Docente"
          description="El Docente no asigna RA. Solo ve Dashboard y Medición RA para registrar resultados."
        />
      ) : (
        <div className="space-y-6">
          <section className="surface-card p-6">
            <div className="mb-5 flex items-start gap-3">
              <GoSearch className="mt-1 shrink-0 text-xl text-[var(--color-secondary-1)]" />
              <div>
                <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                  Filtros de asignación
                </h2>
                <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                  Ya no se toma siempre el primer ciclo. Selecciona explícitamente ciclo, curso, periodo, programa, plan y estado de medición.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Select
                label="Programa académico"
                value={selectedProgramId}
                options={programOptions}
                onChange={(event) => {
                  setSelectedProgramId(event.target.value);
                  setSelectedPlanId("");
                  setSelectedCycleId("");
                  setSelectedCourseId("");
                }}
                disabled={Boolean(currentUser.scope.programaId ?? currentUser.scope.academicProgramId)}
              />

              <Select
                label="Plan de estudios"
                value={selectedPlanId}
                options={planOptions}
                onChange={(event) => {
                  setSelectedPlanId(event.target.value);
                  setSelectedCycleId("");
                  setSelectedCourseId("");
                }}
              />

              <Select
                label="Periodo académico"
                value={selectedPeriod}
                options={periodOptions}
                placeholder="Todos los periodos"
                onChange={(event) => {
                  setSelectedPeriod(event.target.value);
                  setSelectedCycleId("");
                  setSelectedCourseId("");
                }}
              />

              <Select
                label="Ciclo de medición"
                value={selectedCycleId}
                options={cycles.map((cycle) => ({ label: cycle.nombre ?? cycle.id, value: cycle.id }))}
                placeholder="Selecciona un ciclo"
                onChange={(event) => {
                  const cycle = cycles.find((item) => item.id === event.target.value);
                  setSelectedCycleId(event.target.value);
                  setSelectedProgramId(cycle?.programaId ?? selectedProgramId);
                  setSelectedPlanId(cycle?.planId ?? selectedPlanId);
                  setSelectedPeriod(cycle?.periodo ?? selectedPeriod);
                  setSelectedCourseId("");
                }}
              />

              <Select
                label="Curso de Síntesis"
                value={selectedCourseId}
                options={courses.map((course) => ({ label: `${course.codigo} · ${course.nombre}`, value: course.id }))}
                placeholder="Selecciona un curso"
                onChange={(event) => setSelectedCourseId(event.target.value)}
              />

              <Select
                label="Estado de medición"
                value={measurementFilter}
                options={[
                  { label: "Medido", value: "medido" },
                  { label: "Pendiente", value: "pendiente" },
                ]}
                placeholder="Todos los estados"
                onChange={(event) => setMeasurementFilter(event.target.value as MeasurementFilter)}
              />
            </div>
          </section>

          {!selectedCycle ? (
            <WorkflowStateCard
              title="No hay ciclo de medición disponible"
              description="Crea o selecciona un ciclo con cursos de Síntesis para poder asignar RA."
            />
          ) : !selectedCourse ? (
            <WorkflowStateCard
              title="No hay cursos de Síntesis disponibles"
              description="El ciclo seleccionado no tiene cursos de Síntesis asociados. Revisa Creación del ciclo."
            />
          ) : visibleCompetencias.length === 0 ? (
            <WorkflowStateCard
              title="No hay RA disponibles para asignar"
              description="El curso no tiene competencias válidas del mapeo o del plan. Corrige Mapeo/Competencias y RA antes de continuar."
            />
          ) : (
            <section className="surface-card p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                      {selectedCourse.nombre}
                    </h2>
                    <Badge variant="info">Síntesis</Badge>
                    <span className="text-sm font-semibold text-[var(--color-gray-3)]">{selectedCourse.codigo}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                    Semestre {selectedCourse.semestre} · {selectedCourse.creditos} créditos · Docente: {selectedCourse.docente}
                  </p>
                </div>

                <Badge variant={canAssign ? "success" : "neutral"}>
                  {canAssign ? "Director asigna RA" : "Solo lectura"}
                </Badge>
              </div>

              <div className="mt-6 space-y-4">
                {visibleCompetencias.map((competencia) => (
                  <div key={competencia.id} className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
                    <div className="flex items-start gap-3">
                      <GoLink className="mt-1 shrink-0 text-lg text-[var(--color-secondary-1)]" />
                      <div>
                        <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                          {competencia.nombre ?? "Competencia"}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                          {competencia.descripcion ?? "Sin descripción registrada."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {getDescribedLearningResults(competencia).map((ra) => {
                        const selected = isRaSelected(records, selectedCycle.id, selectedCourse.id, competencia.id, ra.id);
                        const assignment = getCourseAssignment(records, selectedCycle.id, selectedCourse.id, competencia.id, ra.id);
                        const status = getAssignmentStatus(assignment, mediciones);

                        if (measurementFilter && status !== measurementFilter) return null;

                        return (
                          <div key={ra.id} className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 gap-3">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-secondary-1)] text-xs font-semibold text-white">
                                {String(ra.numero).padStart(2, "0")}
                              </span>
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  <Badge variant="info">RA {String(ra.numero).padStart(2, "0")}</Badge>
                                  <Badge variant={status === "medido" ? "success" : "warning"}>
                                    {status === "medido" ? "Medido" : "Pendiente"}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
                                  {ra.descripcion}
                                </p>
                              </div>
                            </div>

                            <Button
                              type="button"
                              variant={selected ? "primary_soft" : "primary"}
                              size="sm"
                              leftIcon={selected ? <GoCheck className="text-base" /> : undefined}
                              onClick={() => handleSelectRa(selectedCourse, competencia, ra)}
                              disabled={selected || !canAssign}
                              title={!canAssign ? "Solo Director puede asignar RA." : undefined}
                            >
                              {selected ? "Asignado" : "Asignar"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="surface-card border border-dashed border-[var(--color-gray-6)] p-5 text-sm leading-6 text-[var(--color-gray-3)]">
            <div className="flex gap-3">
              <GoLock className="mt-1 shrink-0 text-base text-[var(--color-secondary-1)]" />
              <p>
                La asignación se guarda por cicloId, cursoId, competenciaId, resultadoAprendizajeId, programaId, planId, docenteId, docenteNombre y docenteEmail. El docenteId sale de un catálogo demo centralizado y debe reemplazarse por directorio institucional/backend cuando exista. Los RA con competencias inválidas no se muestran para asignación.
              </p>
            </div>
          </div>
        </div>
      )}
    </PanelLayout>
  );
}
