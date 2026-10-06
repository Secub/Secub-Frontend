import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CourseRecord } from "../medicion-ra.types";
import type { CourseMeasurementState } from "../types/medicionRA.persistence.types";
import { useMedicionRAHydration } from "./useMedicionRAHydration";

function buildCourse(id: string, competenceId: string): CourseRecord {
  return {
    id,
    name: `Curso ${id}`,
    code: id,
    group: "A",
    credits: 3,
    period: "2026-2",
    program: "Programa",
    studyPlan: "Plan",
    measurementCycle: "Ciclo 2026-2027",
    teacher: "Docente",
    cycleId: "cycle-1",
    competences: [
      {
        id: competenceId,
        code: competenceId,
        title: `Competencia ${competenceId}`,
        description: "Descripción",
        learningResults: [],
      },
    ],
    students: [],
  };
}

function buildMeasurement(
  id: string,
  courseId: string,
  competenceId: string,
): CourseMeasurementState {
  return {
    id,
    cicloId: "cycle-1",
    selectedCourseId: courseId,
    activeCompetenceId: competenceId,
    evaluationsByCourse: {},
    instrumentsByCourse: {},
    evidenceByCompetence: {},
    improvementByCompetence: {},
    completedCompetenceIds: [],
    isEvaluationLocked: false,
    completed: false,
  };
}

describe("useMedicionRAHydration", () => {
  it("no reinicia la competencia activa cuando se actualiza la medición del mismo curso", async () => {
    const firstCourse = buildCourse("course-1", "competence-1");
    const secondCourse = buildCourse("course-2", "competence-2");
    const setSelectedCourseId = vi.fn();
    const setActiveCompetenceId = vi.fn();
    const initialMeasurement = buildMeasurement("state-1", firstCourse.id, "competence-1");

    const { rerender } = renderHook(
      (props: {
        availableCourses: CourseRecord[];
        selectedCourseId: string;
        selectedCourse: CourseRecord;
        persistedState?: CourseMeasurementState;
        courseMeasurementStateId: string;
      }) =>
        useMedicionRAHydration({
          ...props,
          initialPersistedState: initialMeasurement,
          setSelectedCourseId,
          setActiveCompetenceId,
        }),
      {
        initialProps: {
          availableCourses: [firstCourse, secondCourse],
          selectedCourseId: firstCourse.id,
          selectedCourse: firstCourse,
          persistedState: initialMeasurement,
          courseMeasurementStateId: "cycle-1::course-1",
        },
      },
    );

    await waitFor(() => expect(setActiveCompetenceId).toHaveBeenCalledWith("competence-1"));
    setActiveCompetenceId.mockClear();

    rerender({
      availableCourses: [firstCourse, secondCourse],
      selectedCourseId: firstCourse.id,
      selectedCourse: firstCourse,
      persistedState: { ...initialMeasurement },
      courseMeasurementStateId: "cycle-1::course-1",
    });

    expect(setActiveCompetenceId).not.toHaveBeenCalled();

    rerender({
      availableCourses: [firstCourse, secondCourse],
      selectedCourseId: secondCourse.id,
      selectedCourse: secondCourse,
      persistedState: buildMeasurement("state-2", secondCourse.id, "competence-2"),
      courseMeasurementStateId: "cycle-1::course-2",
    });

    await waitFor(() => expect(setActiveCompetenceId).toHaveBeenCalledWith("competence-2"));
  });
});
