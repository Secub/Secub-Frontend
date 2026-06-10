import { useMemo } from "react";
import type {
  Competence,
  CourseRecord,
  EvaluationMatrix,
  EvidenceState,
  InstrumentByRa,
} from "../medicion-ra.types";

export function useMedicionRASubProgress({
  activeCompetence,
  course,
  evaluations,
  evidence,
  instruments,
}: {
  activeCompetence: Competence;
  course: CourseRecord;
  evaluations: EvaluationMatrix;
  evidence: EvidenceState;
  instruments: InstrumentByRa;
}) {
  return useMemo(() => {
    const totalCells = course.students.length * activeCompetence.learningResults.length;

    const completedCells = course.students.reduce((total, student) => {
      const completedByStudent = activeCompetence.learningResults.filter((ra) =>
        Boolean(evaluations[student.id]?.[ra.id]),
      ).length;

      return total + completedByStudent;
    }, 0);

    const evaluationsCompleted = totalCells > 0 && completedCells === totalCells;

    const instrumentsCompleted = activeCompetence.learningResults.every((ra) =>
      Boolean(instruments[ra.id]?.description?.trim()),
    );

    const evidenceCompleted = Boolean(evidence.fileName);

    const steps = [
      {
        id: "evaluations",
        label: "Calificaciones",
        completed: evaluationsCompleted,
        active: !evaluationsCompleted,
      },
      {
        id: "instruments",
        label: "Instrumento",
        completed: instrumentsCompleted,
        active: evaluationsCompleted && !instrumentsCompleted,
      },
      {
        id: "evidence",
        label: "Evidencia",
        completed: evidenceCompleted,
        active: evaluationsCompleted && instrumentsCompleted && !evidenceCompleted,
      },
    ];

    if (evaluationsCompleted && instrumentsCompleted && evidenceCompleted) {
      return steps.map((step) => ({ ...step, active: false }));
    }

    return steps;
  }, [
    activeCompetence.learningResults,
    course.students,
    evaluations,
    evidence.fileName,
    instruments,
  ]);
}
