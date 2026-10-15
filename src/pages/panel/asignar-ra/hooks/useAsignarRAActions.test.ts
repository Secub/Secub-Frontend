import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveCourseRAAssignments } from "../../../../services/raAssignments";
import { useAsignarRAActions } from "./useAsignarRAActions";

vi.mock("../../../../services/raAssignments", () => ({
  saveCourseRAAssignments: vi.fn(),
  deleteCourseRAAssignments: vi.fn(),
}));
vi.mock("../../../../components/panel", () => ({
  completeAcademicWorkflowFromCurrentProgress: vi.fn(),
}));

function makeParams(): Parameters<typeof useAsignarRAActions>[0] {
  const course = {
    id: "course-1", nombre: "Taller Integrador VIII", codigo: "T08",
    creditos: 3, semestre: 8, nucleo: "Síntesis" as const,
    programaId: "program-1", planId: "plan-1", docente: "Docente",
    tipoVinculacion: "", competenciasAsignadas: 1,
    nivelCompromiso: "A" as const, asignadoANucleoSintesis: true,
  };
  return {
    canManage: true,
    selectedProgramId: "program-1",
    selectedPlanId: "plan-1",
    courses: [course, { ...course, id: "course-2" }],
    pendingCourseIds: ["course-1", "course-2"],
    selectedCycle: { id: "cycle-1" },
    selectedCourse: course,
    selectedCourseAssignments: [],
    courseCompetencias: [{
      id: "comp-1", nombre: "C1",
      resultadosAprendizaje: [
        { id: "ra-1", descripcion: "Resultado uno" },
        { id: "ra-2", descripcion: "Resultado dos" },
      ],
    }],
    measurements: [],
    coursesRef: { current: null },
    assignmentPanelRef: { current: null },
    setSelectedCourseId: vi.fn(),
    refreshBackendState: vi.fn().mockResolvedValue(undefined),
    resetFeedback: vi.fn(),
    setFeedback: vi.fn(),
    setErrorMessage: vi.fn(),
  };
}

beforeEach(() => {
  vi.mocked(saveCourseRAAssignments).mockResolvedValue([]);
});

describe("guardado de asignaciones RA", () => {
  it("guarda sin avanzar ni finalizar y permite volver después de recargar lo guardado", async () => {
    const params = makeParams();
    const { result, rerender } = renderHook((props) => useAsignarRAActions(props), { initialProps: params });
    act(() => result.current.toggleRaSelection(params.courseCompetencias[0], "ra-1"));
    expect(result.current.hasUnsavedChanges()).toBe(true);
    await act(async () => result.current.handleSaveCourseAssignments());
    await waitFor(() => expect(params.setFeedback).toHaveBeenCalledWith("Asignación del curso guardada correctamente."));
    expect(saveCourseRAAssignments).toHaveBeenCalledWith("cycle-1", "course-1", [
      { competenciaId: "comp-1", resultadoAprendizajeIds: ["ra-1"] },
    ]);
    expect(params.refreshBackendState).toHaveBeenCalledTimes(1);
    expect(params.setSelectedCourseId).not.toHaveBeenCalled();
    expect(result.current.showFinishAcademicFlowConfirm).toBe(false);

    rerender({ ...params, selectedCourseAssignments: [{
      id: "assignment-1", cicloId: "cycle-1", cursoIds: ["course-1"],
      competenciaRaId: "comp-1", resultadoAprendizajeIds: ["ra-1"],
      estado: "activo", createdAt: "", updatedAt: "",
    }] });
    expect(result.current.isRaSelected("comp-1", "ra-1")).toBe(true);
    expect(result.current.hasUnsavedChanges()).toBe(false);
    act(() => result.current.handleBackToCourses());
    expect(params.setSelectedCourseId).toHaveBeenCalledWith("");
    expect(result.current.showLeaveCourseConfirm).toBe(false);
  });

  it("conserva los cambios y muestra el error si falla el guardado", async () => {
    vi.mocked(saveCourseRAAssignments).mockRejectedValueOnce(new Error("No fue posible guardar"));
    const params = makeParams();
    const { result } = renderHook(() => useAsignarRAActions(params));
    act(() => result.current.toggleRaSelection(params.courseCompetencias[0], "ra-1"));
    await act(async () => result.current.handleSaveCourseAssignments());
    await waitFor(() => expect(params.setErrorMessage).toHaveBeenCalledWith("No fue posible guardar"));
    expect(result.current.hasUnsavedChanges()).toBe(true);
    expect(params.setFeedback).not.toHaveBeenCalled();
    expect(params.setSelectedCourseId).not.toHaveBeenCalled();
  });

  it("valida las selecciones antes de guardar", () => {
    const params = makeParams();
    const { result } = renderHook(() => useAsignarRAActions(params));
    act(() => result.current.handleSaveCourseAssignments());
    expect(saveCourseRAAssignments).not.toHaveBeenCalled();
    expect(params.setErrorMessage).toHaveBeenCalledWith("Selecciona al menos 1 RA para la competencia C1.");
  });

  it("guarda antes de abrir el siguiente curso pendiente", async () => {
    const params = makeParams();
    const { result } = renderHook(() => useAsignarRAActions(params));
    act(() => result.current.toggleRaSelection(params.courseCompetencias[0], "ra-1"));
    await act(async () => result.current.handleSaveAndOpenNextCourse());
    await waitFor(() => expect(params.setSelectedCourseId).toHaveBeenCalledWith("course-2"));
    expect(saveCourseRAAssignments).toHaveBeenCalledTimes(1);
    expect(params.refreshBackendState).toHaveBeenCalledTimes(1);
  });

  it("pide confirmación antes de quitar un RA medido al guardar", async () => {
    const params = makeParams();
    params.selectedCourseAssignments = [{
      id: "assignment-1", cursoIds: ["course-1"], competenciaRaId: "comp-1",
      resultadoAprendizajeIds: ["ra-1"], estado: "activo", createdAt: "", updatedAt: "",
    }];
    params.measurements = [{ id: "measurement-1", asignacionRaId: "assignment-1", completed: true }];
    const { result } = renderHook(() => useAsignarRAActions(params));
    act(() => result.current.toggleRaSelection(params.courseCompetencias[0], "ra-1"));
    act(() => result.current.toggleRaSelection(params.courseCompetencias[0], "ra-2"));
    await act(async () => result.current.handleSaveCourseAssignments());
    expect(result.current.showMeasuredConfirm).toBe(true);
    expect(saveCourseRAAssignments).not.toHaveBeenCalled();
    await act(async () => result.current.handleConfirmMeasuredPrimaryAction());
    await waitFor(() => expect(params.setFeedback).toHaveBeenCalledWith("Asignación del curso guardada correctamente."));
    expect(saveCourseRAAssignments).toHaveBeenCalledWith("cycle-1", "course-1", [
      { competenciaId: "comp-1", resultadoAprendizajeIds: ["ra-2"] },
    ]);
    expect(params.setSelectedCourseId).not.toHaveBeenCalled();
    expect(result.current.showFinishAcademicFlowConfirm).toBe(false);
  });
});
