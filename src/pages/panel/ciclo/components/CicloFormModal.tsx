import { useEffect, useMemo, useState } from "react";
import { GoAlert, GoCheck, GoInfo, GoProject } from "react-icons/go";
import { Badge, Button, Input, Modal, Select, type SelectOption } from "../../../../components/ui";
import type {
  CicloCatalogs,
  CicloEnriched,
  CicloFormState,
  CurrentUser,
} from "../ciclo.types";
import { cicloRolePermissions } from "../ciclo.permissions";
import {
  addEighteenMonths,
  formatDate,
  getActivePlansByProgram,
  getCourseEligibility,
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

  const selectableSelectedCount = values.cursoIds.filter((cursoId) =>
    synthesisCourses.some((course) => {
      const eligibility = getCourseEligibility(course, selectedPrograma, selectedPlan);
      return course.id === cursoId && eligibility.selectable;
    }),
  ).length;

  const canSubmit =
    !isReadOnly &&
    selectedPrograma?.estado === "activo" &&
    selectedPlan?.estado === "activo" &&
    values.nombre.trim().length > 0 &&
    selectableSelectedCount > 0;

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
    if (!canSubmit) return;

    // Integración futura:
    // - POST /selecciones-cursos para crear la selección.
    // - PUT /selecciones-cursos/:id para editar la selección.
    // - POST /selecciones-cursos/:id/cursos para guardar los cursos seleccionados.
    onSubmit(values);
  };

  const title = {
    create: "Crear selección de cursos",
    edit: "Editar selección de cursos",
    view: "Detalle de la selección de cursos",
  }[mode];

  const primaryLabel = mode === "edit" ? "Guardar cambios" : "Crear selección";

  const programaOptions = toOptions(availableProgramas);
  const planOptions = toOptions(activePlans);

  return (
    <Modal
      open={open}
      title={title}
      description="Selecciona el plan activo y los cursos de Síntesis que harán parte de la selección de cursos durante 1.5 años."
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
                {record ? formatDate(record.createdAt.slice(0, 10)) : formatDate(new Date().toISOString().slice(0, 10))}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
                <GoProject className="text-xl" />
              </span>
              <span>
                <strong className="text-[var(--color-secondary-4)]">Modificado:</strong>{" "}
                {record ? formatDate(record.updatedAt.slice(0, 10)) : formatDate(new Date().toISOString().slice(0, 10))}
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
                disabled={!canSubmit}
                title={
                  canSubmit
                    ? "Confirmar selección de cursos"
                    : "Selecciona al menos un curso elegible y valida que el programa esté activo."
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
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white text-[var(--color-secondary-1)]">
              <GoInfo className="text-xl" />
            </span>
            <div>
              <h3 className="font-heading text-base font-semibold text-[var(--color-secondary-4)]">
                Validaciones del RF06
              </h3>
              <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                El listado carga únicamente cursos del núcleo de Síntesis. Los cursos sin competencias,
                sin nivel I-R-A o no confirmados en Síntesis quedan visibles, pero bloqueados.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <Input
              label="Nombre de la selección"
              value={values.nombre}
              onChange={(event) => setValues((current) => ({ ...current, nombre: event.target.value }))}
              disabled={isReadOnly}
              error={submitted && values.nombre.trim().length === 0 ? "El nombre de la selección es obligatorio." : undefined}
            />
          </div>

          <Input label="Duración de la selección" value="1.5 años" disabled />

          <Input label="Facultad" value={selectedFacultad?.nombre ?? "Sin facultad"} disabled />

          <Select
            label="Programa"
            value={values.programaId}
            options={programaOptions}
            placeholder="Selecciona un programa"
            disabled={isReadOnly || Boolean(user.scope.programaId)}
            onChange={(event) => handleProgramChange(event.target.value)}
            error={
              submitted && selectedPrograma?.estado !== "activo"
                ? "Solo se pueden crear selecciones para programas activos."
                : undefined
            }
            helperText={
              selectedPrograma?.estado === "inactivo"
                ? "Este programa está inactivo y no permite crear selecciones."
                : undefined
            }
          />

          <Select
            label="Plan de estudios"
            value={values.planId}
            options={planOptions}
            placeholder="Selecciona un plan activo"
            disabled={isReadOnly || activePlans.length === 0}
            onChange={(event) => setValues((current) => ({ ...current, planId: event.target.value, cursoIds: [] }))}
            error={
              submitted && selectedPlan?.estado !== "activo"
                ? "El plan de estudios debe estar activo."
                : undefined
            }
          />

          <Input
            label="Fecha de inicio"
            type="date"
            value={values.fechaInicio}
            disabled={isReadOnly}
            onChange={(event) => setValues((current) => ({ ...current, fechaInicio: event.target.value }))}
          />

          <Input
            label="Fecha de finalización"
            value={values.fechaInicio ? addEighteenMonths(values.fechaInicio) : ""}
            disabled
            helperText="Fecha calculada automáticamente con duración de 1.5 años."
          />
        </div>

        <section>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                Cursos de Síntesis
              </h3>
              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Selección múltiple mediante checkbox. Solo se guardan cursos elegibles.
              </p>
            </div>

            <Badge variant={selectableSelectedCount > 0 ? "success" : "neutral"}>
              {selectableSelectedCount} cursos seleccionados
            </Badge>
          </div>

          {synthesisCourses.length > 0 ? (
            <div className="space-y-4">
              {synthesisCourses.map((course) => {
                const eligibility = getCourseEligibility(course, selectedPrograma, selectedPlan);
                const checked = values.cursoIds.includes(course.id);

                return (
                  <label
                    key={course.id}
                    className={[
                      "flex cursor-pointer gap-4 rounded-[var(--radius-lg)] border bg-white p-4 shadow-sm transition-all",
                      checked
                        ? "border-[var(--color-secondary-1)] ring-4 ring-[color:rgba(14,101,217,0.10)]"
                        : "border-[var(--color-gray-6)]",
                      !eligibility.selectable || isReadOnly
                        ? "cursor-not-allowed opacity-80"
                        : "hover:border-[var(--color-secondary-1)]",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-[var(--color-gray-6)] accent-[var(--color-secondary-1)]"
                      checked={checked}
                      disabled={!eligibility.selectable || isReadOnly}
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
                        <Badge variant={eligibility.selectable ? "success" : "warning"}>
                          {eligibility.selectable ? "Elegible" : "Bloqueado"}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-[var(--color-gray-3)]">
                        Semestre {course.semestre} · Área: {course.nucleo} · Docente: {course.docente} ({course.tipoVinculacion}) · {course.creditos} créditos
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant={course.competenciasAsignadas > 0 ? "info" : "danger"}>
                          {course.competenciasAsignadas} competencias
                        </Badge>
                        <Badge variant={course.nivelCompromiso ? "info" : "danger"}>
                          Nivel I-R-A: {course.nivelCompromiso || "Sin definir"}
                        </Badge>
                        <Badge variant={course.asignadoANucleoSintesis ? "info" : "danger"}>
                          Núcleo Síntesis {course.asignadoANucleoSintesis ? "validado" : "pendiente"}
                        </Badge>
                      </div>

                      {!eligibility.selectable ? (
                        <div className="mt-3 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-warning)] bg-[color:rgba(251,199,86,0.16)] px-3 py-2 text-sm text-[var(--color-gray-2)]">
                          <GoAlert className="mt-0.5 shrink-0 text-base text-[var(--color-secondary-4)]" />
                          {eligibility.reason}
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

          {submitted && selectableSelectedCount === 0 ? (
            <p className="mt-3 text-sm text-[var(--color-error)]">
              Selecciona al menos un curso elegible para confirmar la selección.
            </p>
          ) : null}
        </section>
      </div>
    </Modal>
  );
}
