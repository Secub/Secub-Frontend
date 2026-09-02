import { useEffect, useState } from "react";
import { Button, Modal, Select, Textarea } from "../../../../components/ui";
import {
  useAcademicScopeForm,
  validateAcademicScope,
  type AcademicScopeErrors,
} from "../../../../features/academic-scope";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import type {
  Catalogs,
  CurrentUser,
  FormState,
  PerfilEgresoEnriched,
} from "../perfil-egreso.types";

interface PerfilEgresoFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  user: CurrentUser;
  catalogs: Catalogs;
  initialValues: FormState;
  records: PerfilEgresoEnriched[]; //Validar si ya existe perfil con mismo plan de estudios
  record: PerfilEgresoEnriched | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (values: FormState) => void | Promise<void>;
}

interface FormErrors extends AcademicScopeErrors {
  descripcion?: string;
}

export function PerfilEgresoFormModal({
  open,
  mode,
  user,
  catalogs,
  initialValues,
  records,
  record,
  submitting = false,
  onClose,
  onSubmit,
}: PerfilEgresoFormModalProps) {
  const [form, setForm] = useState<FormState>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formAlert, setFormAlert] = useState("");

  useEffect(() => {
    setForm(initialValues);
    setErrors({});
    setFormAlert("");
  }, [initialValues, open]);

  const canEditStructure = true;
  const {
    lugaresDisponibles,
    facultadesDisponibles,
    programasDisponibles,
    planesDisponibles,
    updateScopeField,
    isDirectorScoped,
    isLugarLocked,
  } = useAcademicScopeForm({
    form,
    setForm,
    catalogs,
    userScope: user.scope,
    canEditStructure,
  });

  const validate = () => {
    const nextErrors: FormErrors = { ...validateAcademicScope(form, catalogs) };
    if (!form.descripcion.trim()) {
      nextErrors.descripcion = "Escribe la descripción del perfil de egreso.";
    }

    const existePlan = records.some(
  (item) =>
    item.planId === form.planId &&
    item.id !== record?.id
    );

    if (existePlan) {
      nextErrors.planId =
        "Ya existe un perfil de egreso asociado a este plan de estudios.";
    }

    const errorKeys = Object.keys(nextErrors);
    const hasErrors = errorKeys.length > 0;

    setErrors(nextErrors);
    setFormAlert(
      hasErrors
        ? "Completa la información obligatoria antes de guardar. Revisa el primer campo marcado."
        : "",
    );

    if (hasErrors) {
      scrollToFirstValidationError({
        fieldOrder: [
          "seccionalId",
          "lugarId",
          "facultadId",
          "programaId",
          "planId",
          "descripcion",
          "numeroRA",
        ],
      });
    }

    return !hasErrors;
  };


  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(mode === "create" ? { ...form, estado: "activo" } : form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear perfil de egreso" : "Editar perfil de egreso"}
      description={
        mode === "create"
          ? "Registra un nuevo perfil de egreso seleccionando lugar de desarrollo, facultad, programa académico y plan de estudios."
          : "Actualiza el lugar de desarrollo, facultad, programa académico, plan de estudios, estado y descripción del perfil de egreso."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting
              ? "Guardando…"
              : mode === "create"
                ? "Crear perfil"
                : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      {formAlert ? (
        <div
          role="alert"
          className="mb-5 rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[color:rgba(235,87,87,0.08)] px-4 py-3 text-sm font-medium text-[var(--color-secondary-4)]"
        >
          {formAlert}
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">

        <Select
          label="Lugar de desarrollo"
          value={form.lugarId}
          onChange={(event) => updateScopeField("lugarId", event.target.value)}
          options={lugaresDisponibles.map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona un lugar"
          disabled={isLugarLocked}
          id="lugarId"
          data-validation-field="lugarId"
          error={errors.lugarId}
        />

        <Select
          label="Facultad"
          value={form.facultadId}
          onChange={(event) => updateScopeField("facultadId", event.target.value)}
          options={facultadesDisponibles.map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona una facultad"
          disabled={!canEditStructure || !!user.scope.facultadId}
          id="facultadId"
          data-validation-field="facultadId"
          error={errors.facultadId}
        />

        <div className="space-y-5">
          <Select
            label="Programa académico"
            value={form.programaId}
            onChange={(event) => updateScopeField("programaId", event.target.value)}
            options={programasDisponibles.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
            placeholder="Selecciona un programa"
            disabled={!canEditStructure || isDirectorScoped}
            id="programaId"
            data-validation-field="programaId"
            error={errors.programaId}
          />

          {mode === "edit" ? (
            <Select
              label="Estado"
              value={form.estado}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  estado: event.target.value as FormState["estado"],
                }))
              }
              options={[
                { label: "Activo", value: "activo" },
                { label: "Inactivo", value: "inactivo" },
              ]}
              placeholder="Selecciona un estado"
            />
          ) : null}
        </div>

        <Select
          label="Plan de estudios"
          value={form.planId}
          onChange={(event) => updateScopeField("planId", event.target.value)}
          options={planesDisponibles.map((item) => ({
            label: item.estado === "inactivo" ? `${item.nombre} (Inactivo)` : item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona un plan"
          disabled={!canEditStructure || !form.programaId}
          id="planId"
          data-validation-field="planId"
          error={errors.planId}
        />

      </div>


      <div className="mt-5">
        <Textarea
          label="Descripción"
          value={form.descripcion}
          onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
          rows={7}
          placeholder="Escribe el perfil de egreso del programa..."
          id="descripcion"
          data-validation-field="descripcion"
          error={errors.descripcion}
        />
      </div>
    </Modal>
  );
}

export default PerfilEgresoFormModal;
