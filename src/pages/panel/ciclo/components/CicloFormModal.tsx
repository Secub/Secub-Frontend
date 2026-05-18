import { useEffect, useMemo, useState } from "react";
import { GoAlert, GoCheck, GoInfo, GoProject } from "react-icons/go";
import { Badge, Button, Input, Modal, Select, type SelectOption } from "../../../../components/ui";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import type {
  CicloCatalogs,
  CicloEnriched,
  CicloFormState,
  CurrentUser,
} from "../ciclo.types";
import { cicloRolePermissions } from "../ciclo.permissions";
import {
  addEighteenMonths,
  buildPeriodFromStartDate,
  formatDate,
  getActivePlansByProgram,
  getCourseEligibility,
  getNivelCompromisoLabel,
  getSynthesisCourses,
} from "../ciclo.utils";

interface CicloFormModalProps {
  open: boolean;
  mode: "create" | "edit" | "view";
  catalogs: CicloCatalogs;
  user: CurrentUser;
  initialValues: CicloFormState;
  record?: CicloEnriched | null;
  onClose: () => void;
  onSubmit: (values: CicloFormState) => void;
}

function toOptions<T extends { id: string; nombre: string }>(items: T[]): SelectOption[] {
  return items.map((item) => ({ label: item.nombre, value: item.id }));
}

function normalizeContractType(tipoVinculacion: string) {
  return tipoVinculacion
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isCatedraTeacher(tipoVinculacion: string) {
  return normalizeContractType(tipoVinculacion).includes("catedra");
}

function isExceptionalTeacher(tipoVinculacion: string) {
  return normalizeContractType(tipoVinculacion).includes("medio tiempo");
}

function getTeacherContractAlert(tipoVinculacion: string) {
  if (normalizeContractType(tipoVinculacion).includes("tiempo completo")) return "";
  if (isExceptionalTeacher(tipoVinculacion)) {
    return "Caso excepcional: docente de medio tiempo. Prioriza tiempo completo cuando exista disponibilidad.";
  }

  return "Caso excepcional: valida la dedicación docente antes de confirmar el ciclo.";
}

export default function CicloFormModal({
  open,
  mode,
  catalogs,
  user,
  initialValues,
  record,
  onClose,
  onSubmit,
}: CicloFormModalProps) {
  const [values, setValues] = useState<CicloFormState>(initialValues);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setSubmitted(false);
    }
  }, [initialValues, open]);

  const permissions = cicloRolePermissions[user.role];
  const isReadOnly = mode === "view" || !permissions.canConfirmSelection;

  const selectedPrograma = catalogs.programas.find(
    (programa) => programa.id === values.programaId,
  );
  const selectedPlan = catalogs.planes.find((plan) => plan.id === values.planId);
  const selectedFacultad = catalogs.facultades.find(
    (facultad) => facultad.id === selectedPrograma?.facultadId,
  );

  const availableProgramas = useMemo(() => {
    return catalogs.programas.filter((programa) => {
      if (user.scope.programaId && programa.id !== user.scope.programaId) return false;
      if (user.scope.facultadId && programa.facultadId !== user.scope.facultadId) return false;
      if (user.scope.seccionalId && programa.seccionalId !== user.scope.seccionalId) return false;
      return true;
    });
  }, [catalogs.programas, user.scope.facultadId, user.scope.programaId, user.scope.seccionalId]);

  const activePlans = useMemo(
    () => getActivePlansByProgram(catalogs, values.programaId),
    [catalogs, values.programaId],
  );

  const synthesisCourses = useMemo(
    () => getSynthesisCourses(catalogs, values.programaId, values.planId),
    [catalogs, values.planId, values.programaId],
  );

  const availableCourses = useMemo(() => {
    // Respaldo de validación para cuando se conecte el backend:
    // si llegara un curso sin competencias, sin nivel I-R-A o sin núcleo Síntesis validado,
    // no se muestra en la lista.
    return synthesisCourses.filter((course) => {
      if (isCatedraTeacher(course.tipoVinculacion)) {
        // Respaldo técnico para backend: cursos de Síntesis con docente de cátedra no se listan como seleccionables.
        return false;
      }

      return getCourseEligibility(course, selectedPrograma, selectedPlan).selectable;
    });
  }, [selectedPlan, selectedPrograma, synthesisCourses]);

  const selectedCount = values.cursoIds.filter((cursoId) =>
    availableCourses.some((course) => course.id === cursoId),
  ).length;

  const nombreError =
    submitted && values.nombre.trim().length === 0
      ? "El nombre del ciclo es obligatorio."
      : undefined;

  const programaError =
    submitted && (!values.programaId || selectedPrograma?.estado !== "activo")
      ? "Solo se pueden crear ciclos para programas activos."
      : undefined;

  const planError =
    submitted && (!values.planId || selectedPlan?.estado !== "activo")
      ? "El plan de estudios debe estar activo."
      : undefined;

  const cursosError =
    submitted && selectedCount === 0
      ? "Selecciona al menos un curso para confirmar el ciclo."
      : undefined;

  const showValidationAlert = submitted && Boolean(nombreError || programaError || planError || cursosError);

  const canSubmit =
    !isReadOnly &&
    selectedPrograma?.estado === "activo" &&
    selectedPlan?.estado === "activo" &&
    values.nombre.trim().length > 0 &&
    selectedCount > 0;

  const handleProgramChange = (programaId: string) => {
    const firstPlan = getActivePlansByProgram(catalogs, programaId)[0];

    setValues((current) => ({
      ...current,
      programaId,
      planId: firstPlan?.id ?? "",
      cursoIds: [],
    }));
  };

  const toggleCourse = (courseId: string) => {
    setValues((current) => {
      const exists = current.cursoIds.includes(courseId);
      return {
        ...current,
        cursoIds: exists
          ? current.cursoIds.filter((id) => id !== courseId)
          : [...current.cursoIds, courseId],
      };
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);

    if (!canSubmit) {
      scrollToFirstValidationError({
        fieldOrder: ["nombre", "programaId", "planId", "cursoIds"],
      });
      return;
    }

    // Integración futura:
    // - POST /ciclos para crear ciclo.
    // - PUT /ciclos/:id para editar ciclo.
    // - POST /ciclos/:id/cursos para guardar la selección de cursos sumativos.
    onSubmit(values);
  };

  const title = {
    create: "Crear ciclo",
    edit: "Editar ciclo",
    view: "Detalle del ciclo",
  }[mode];

  const primaryLabel = mode === "edit" ? "Guardar cambios" : "Crear ciclo";

  const programaOptions = toOptions(availableProgramas);
  const planOptions = toOptions(activePlans);

  return (
    <Modal
      open={open}
      title={title}
      description="Selecciona el plan activo y los cursos de Síntesis que harán parte del periodo de selección de 1.5 años."
      size="xl"
      onClose={onClose}
      footer={
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 border-b border-[var(--color-gray-6)] pb-4 text-sm text-[var(--color-gray-3)] md:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
                <GoProject className="text-xl" />
              </span>
              <span>
                <strong className="text-[var(--color-secondary-4)]">Creado:</strong>{" "}
                {record
                  ? formatDate(record.createdAt.slice(0, 10))
                  : formatDate(new Date().toISOString().slice(0, 10))}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
                <GoProject className="text-xl" />
              </span>
              <span>
                <strong className="text-[var(--color-secondary-4)]">Modificado:</strong>{" "}
                {record
                  ? formatDate(record.updatedAt.slice(0, 10))
                  : formatDate(new Date().toISOString().slice(0, 10))}
              </span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            {!isReadOnly ? (
              <Button
                variant="primary"
                leftIcon={<GoCheck className="text-lg" />}
                onClick={handleSubmit}
                disabled={isReadOnly}
                title={
                  canSubmit
                    ? "Confirmar selección de cursos"
                    : "Completa la información obligatoria para confirmar la selección."
                }
              >
                {primaryLabel}
              </Button>
            ) : null}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {showValidationAlert ? (
          <div
            role="alert"
            className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[color:rgba(235,87,87,0.08)] px-4 py-3 text-sm font-medium text-[var(--color-secondary-4)]"
          >
            Completa la información obligatoria antes de crear o guardar el ciclo. Revisa el primer campo marcado.
          </div>
        ) : null}

        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white text-[var(--color-secondary-1)]">
              <GoInfo className="text-xl" />
            </span>
            <div>
              <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                Cursos disponibles
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                El listado muestra únicamente cursos del núcleo de Síntesis. El periodo corresponde a la selección de estos cursos durante 1.5 años.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Input
              label="Nombre ciclo"
              value={values.nombre}
              onChange={(event) =>
                setValues((current) => ({ ...current, nombre: event.target.value }))
              }
              disabled={isReadOnly}
              id="nombre"
              data-validation-field="nombre"
              error={nombreError}
            />
          </div>

          <Input label="Duración del ciclo" value="1.5 años" disabled />

          <Input label="Facultad" value={selectedFacultad?.nombre ?? "Sin facultad"} disabled />

          <Select
            label="Programa"
            value={values.programaId}
            options={programaOptions}
            placeholder="Selecciona un programa"
            disabled={isReadOnly || Boolean(user.scope.programaId)}
            onChange={(event) => handleProgramChange(event.target.value)}
            id="programaId"
            data-validation-field="programaId"
            error={programaError}
            helperText={
              selectedPrograma?.estado === "inactivo"
                ? "Este programa está inactivo y no permite crear ciclos."
                : undefined
            }
          />

          <Select
            label="Plan de estudios"
            value={values.planId}
            options={planOptions}
            placeholder="Selecciona un plan activo"
            disabled={isReadOnly || activePlans.length === 0}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                planId: event.target.value,
                cursoIds: [],
              }))
            }
            id="planId"
            data-validation-field="planId"
            error={planError}
          />

          <Input
            label="Fecha de inicio"
            type="date"
            value={values.fechaInicio}
            disabled={isReadOnly}
            onChange={(event) =>
              setValues((current) => ({ ...current, fechaInicio: event.target.value }))
            }
          />

          <Input
            label="Fecha de finalización"
            value={values.fechaInicio ? addEighteenMonths(values.fechaInicio) : ""}
            disabled
            helperText="Fecha calculada automáticamente con duración de 1.5 años."
          />

          <Input
            label="Periodo resultante"
            value={values.fechaInicio ? buildPeriodFromStartDate(values.fechaInicio) : ""}
            disabled
            helperText="Periodo asociado a la selección de cursos de Síntesis."
          />
        </div>

        <section
          data-validation-field="cursoIds"
          data-validation-error={cursosError ? "true" : undefined}
          className={[
            cursosError
              ? "rounded-[var(--radius-lg)] border border-[var(--color-error)] p-3 ring-4 ring-[color:rgba(235,87,87,0.10)]"
              : "",
          ].join(" ")}
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                Cursos de Síntesis
              </h3>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Selecciona los cursos que harán parte del ciclo.
              </p>
            </div>

            <Badge variant={selectedCount > 0 ? "success" : "neutral"}>
              {selectedCount} cursos seleccionados
            </Badge>
          </div>

          {availableCourses.length > 0 ? (
            <div className="space-y-4">
              {availableCourses.map((course) => {
                const checked = values.cursoIds.includes(course.id);
                const teacherAlert = getTeacherContractAlert(course.tipoVinculacion);

                return (
                  <label
                    key={course.id}
                    className={[
                      "flex cursor-pointer gap-4 rounded-[var(--radius-lg)] border bg-white p-4 shadow-sm transition-all",
                      checked
                        ? "border-[var(--color-secondary-1)] ring-4 ring-[color:rgba(14,101,217,0.10)]"
                        : "border-[var(--color-gray-6)]",
                      isReadOnly ? "cursor-not-allowed opacity-80" : "hover:border-[var(--color-secondary-1)]",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--color-gray-6)] accent-[var(--color-secondary-1)]"
                      checked={checked}
                      disabled={isReadOnly}
                      onChange={() => toggleCourse(course.id)}
                      aria-label={`Seleccionar ${course.nombre}`}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)]">
                          {course.nombre}
                        </h4>
                        <span className="text-sm font-semibold text-[var(--color-secondary-4)]">
                          {course.codigo}
                        </span>
                        <Badge variant="info">{course.nucleo}</Badge>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                        Semestre {course.semestre} · Docente: {course.docente} ({course.tipoVinculacion}) ·{" "}
                        {course.creditos} créditos
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="info">{course.competenciasAsignadas} competencias</Badge>
                        <Badge variant="info">
                          {getNivelCompromisoLabel(course.nivelCompromiso)}
                        </Badge>
                      </div>

                      {teacherAlert ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[color:rgba(251,199,86,0.16)] px-3 py-2 text-sm text-[var(--color-gray-2)]">
                          <GoAlert className="shrink-0 text-base text-[var(--color-secondary-4)]" />
                          <Badge variant="warning">Caso excepcional</Badge>
                          <span>{teacherAlert}</span>
                        </div>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-6 text-sm leading-6 text-[var(--color-gray-3)]">
              No hay cursos de Síntesis asociados al programa y plan seleccionados. Cuando el backend esté conectado,
              este bloque debe consumir el endpoint de cursos por plan de estudios.
            </div>
          )}

          {cursosError ? (
            <p className="mt-3 text-sm text-[var(--color-error)]">
              {cursosError}
            </p>
          ) : null}
        </section>
      </div>
    </Modal>
  );
}
