import { mockBackend } from "../../../../services/mockBackend";
import type { CursoSintesis } from "../../ciclo/ciclo.types";
import type {
  AsignacionRaRecord,
  CicloDemoRecord,
  CompetenciaRaDemoRecord,
  DraftSelections,
  MedicionRaRecord,
} from "../AsignarRA.types";
import {
  getAssignmentCourseId,
  getAssignmentId,
  getLearningResults,
  hasMeasurementForAssignment,
  resolveCourseDocente,
} from "../AsignarRA.utils";
import { asignarRACurrentUser as currentUser } from "./asignarRA.shared";

export function removeAssignmentAndMeasurements(assignmentId: string) {
  mockBackend
    .list<MedicionRaRecord>("medicionesRa", currentUser)
    .filter((measurement) => measurement.asignacionRaId === assignmentId || measurement.asignacionRaIds?.includes(assignmentId))
    .forEach((measurement) => mockBackend.remove<MedicionRaRecord>("medicionesRa", measurement.id, currentUser));

  mockBackend.remove<AsignacionRaRecord>("asignacionesRa", assignmentId, currentUser);
}

interface PersistCourseAssignmentsParams {
  selectedCycle: CicloDemoRecord;
  selectedCourse: CursoSintesis;
  courseCompetencias: CompetenciaRaDemoRecord[];
  draftSelections: DraftSelections;
  measurements: MedicionRaRecord[];
}

export function persistCourseAssignmentsForCourse({
  selectedCycle,
  selectedCourse,
  courseCompetencias,
  draftSelections,
  measurements,
}: PersistCourseAssignmentsParams) {
  const now = new Date().toISOString();
  const docente = resolveCourseDocente(selectedCourse);
  const existingAssignments = mockBackend
    .list<AsignacionRaRecord>("asignacionesRa", currentUser)
    .filter((record) => record.cicloId === selectedCycle.id && getAssignmentCourseId(record) === selectedCourse.id);
  const existingById = new Map(existingAssignments.map((record) => [record.id, record]));
  const desiredIds = new Set<string>();

  courseCompetencias.forEach((competencia) => {
    const validRaIds = new Set(getLearningResults(competencia).map((ra) => ra.id).filter(Boolean));
    const selectedRaIds = (draftSelections[competencia.id] ?? []).filter((raId) => validRaIds.has(raId));

    selectedRaIds.forEach((raId) => {
      const assignmentId = getAssignmentId(selectedCycle.id, selectedCourse.id, competencia.id, raId);
      const existingRecord = existingById.get(assignmentId);
      const isMeasured = existingRecord ? hasMeasurementForAssignment(measurements, existingRecord.id) : false;
      desiredIds.add(assignmentId);

      const nextRecord: AsignacionRaRecord = {
        id: assignmentId,
        cicloId: selectedCycle.id,
        periodoId: selectedCycle.periodo,
        cursoId: selectedCourse.id,
        cursoIds: [selectedCourse.id],
        competenciaRaId: competencia.id,
        competenciaRaIds: [competencia.id],
        resultadoAprendizajeId: raId,
        resultadoAprendizajeIds: [raId],
        estado: "activo",
        estadoMedicion: isMeasured ? "medido" : existingRecord?.estadoMedicion ?? "pendiente",
        seccionalId: selectedCycle.seccionalId,
        facultadId: selectedCycle.facultadId,
        programaId: selectedCycle.programaId,
        planId: selectedCycle.planId,
        docenteNombre: docente.nombre,
        docenteId: docente.id,
        docenteEmail: docente.email,
        createdAt: existingRecord?.createdAt ?? now,
        updatedAt: now,
      };

      mockBackend.upsert<AsignacionRaRecord>("asignacionesRa", nextRecord, currentUser);
    });
  });

  existingAssignments
    .filter((record) => !desiredIds.has(record.id))
    .forEach((record) => removeAssignmentAndMeasurements(record.id));
}
