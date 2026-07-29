import { useEffect, useState } from "react";
import { Button, Modal, Select, Textarea, Input } from "../../../../components/ui";
import {
  useAcademicScopeForm,
  validateAcademicScope,
  type AcademicScopeErrors,
} from "../../../../features/academic-scope";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import { formatDate } from "../perfil-egreso.utils";
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
  record: PerfilEgresoEnriched | null;
  onClose: () => void;
  onSubmit: (values: FormState) => void;
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
  record,
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
      nextErrors.descripcion = "Escribe la descripción del perfil de egreso.";
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
      title={mode === "create" ? "Crear perfil de egreso" : "Editar perfil de egreso"}
      description={
        mode === "create"
          ? "Registra un nuevo perfil de egreso seleccionando lugar de desarrollo, facultad, programa académico y plan de estudios."
          : "En edición solo se modifica el estado y el texto descriptivo, manteniendo el programa y el plan de estudios bloqueados."
      }
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {mode === "create" ? "Crear perfil" : "Guardar cambios"}
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

        {mode === "edit" ? (
          <Input
            label="Fecha de creación"
            value={formatDate(record?.createdAt ?? new Date().toISOString())}
            disabled
            helperText="Se almacenó automáticamente al crear el perfil de egreso."
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
            placeholder="Escribe el perfil de egreso del programa..."
            id="descripcion"
            data-validation-field="descripcion"
            error={errors.descripcion}
          />
        </div>
      ) : null}
    </Modal>
  );
}

export default PerfilEgresoFormModal;
