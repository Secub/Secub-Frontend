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
  PropositoEnriched,
} from "../proposito-formacion.types";

interface PropositoFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  user: CurrentUser;
  catalogs: Catalogs;
  initialValues: FormState;
  record: PropositoEnriched | null;
  onClose: () => void;
  onSubmit: (values: FormState) => void;
}

interface FormErrors extends AcademicScopeErrors {
  descripcion?: string;
}

export function PropositoFormModal({
  open,
  mode,
  user,
  catalogs,
  initialValues,
  onClose,
  onSubmit,
}: PropositoFormModalProps) {
  const [form, setForm] = useState<FormState>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formAlert, setFormAlert] = useState("");

  useEffect(() => {
    setForm(initialValues);
    setErrors({});
    setFormAlert("");
  }, [initialValues, open]);

  const canEditStructure = mode === "create";
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
    if (mode === "edit" && !form.descripcion.trim()) {
      nextErrors.descripcion = "Escribe la descripción del propósito de formación.";
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

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(mode === "create" ? { ...form, estado: "activo" } : form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "create"
          ? "Crear propósito de formación"
          : "Editar propósito de formación"
      }
      description={
        mode === "create"
          ? "Registra un nuevo propósito seleccionando lugar de desarrollo, facultad, programa académico y plan de estudios."
          : "En edición solo se modifica el estado y el texto descriptivo, manteniendo la estructura académica bloqueada."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {mode === "create" ? "Crear propósito" : "Guardar cambios"}
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
        {mode === "edit" ? (
          <Select
            label="Seccional"
            value={form.seccionalId}
            onChange={(event) => updateScopeField("seccionalId", event.target.value)}
            options={catalogs.seccionales.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
            placeholder="Selecciona una seccional"
            disabled={!canEditStructure || !!user.scope.seccionalId}
            id="seccionalId"
            data-validation-field="seccionalId"
            error={errors.seccionalId}
        />
        ) : null}

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
          helperText="Solo se listan planes activos. Los inactivos solo permanecen visibles en registros históricos."
          id="planId"
          data-validation-field="planId"
          error={errors.planId}
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

      

      {mode === "edit" ? (
        <div className="mt-5">
          <Textarea
            label="Descripción"
            value={form.descripcion}
            onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
            rows={7}
            placeholder="Escribe el propósito de formación del programa..."
            id="descripcion"
            data-validation-field="descripcion"
            error={errors.descripcion}
          />
        </div>
      ) : null}
    </Modal>
  );
}

export default PropositoFormModal;
