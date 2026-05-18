import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Select, Textarea } from "../../../../components/ui";
import { scrollToFirstValidationError } from "../../../../utils/validationScroll";
import { getActivePlansByProgram, getDefaultLugarBySeccional, isMedellinSeccional } from "../proposito-formacion.utils";
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

interface FormErrors {
  seccionalId?: string;
  facultadId?: string;
  lugarId?: string;
  programaId?: string;
  planId?: string;
  descripcion?: string;
}

export function PropositoFormModal({
  open,
  mode,
  user,
  catalogs,
  initialValues,
  record,
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

  const lugaresDisponibles = useMemo(() => {
    return catalogs.lugares.filter((item) => {
      if (!form.seccionalId) return true;
      return item.seccionalId === form.seccionalId;
    });
  }, [catalogs.lugares, form.seccionalId]);

  const facultadesDisponibles = useMemo(() => {
    return catalogs.facultades.filter((item) => {
      if (form.seccionalId) {
        return item.seccionalId === form.seccionalId;
      }

      return true;
    });
  }, [catalogs.facultades, form.seccionalId]);

  const programasDisponibles = useMemo(() => {
    return catalogs.programas.filter((item) => {
      if (form.seccionalId && item.seccionalId !== form.seccionalId) {
        return false;
      }

      if (form.facultadId && item.facultadId !== form.facultadId) {
        return false;
      }

      if (user.scope.programaId) {
        return item.id === user.scope.programaId;
      }

      return true;
    });
  }, [catalogs.programas, form.facultadId, form.seccionalId, user.scope.programaId]);

  const planesDisponibles = useMemo(() => {
    return getActivePlansByProgram(catalogs, form.programaId, form.planId);
  }, [catalogs, form.planId, form.programaId]);

  const canEditStructure = mode === "create";
  const isDirectorScoped = Boolean(user.scope.programaId);
  const isLugarLocked = !canEditStructure || !isMedellinSeccional(form.seccionalId);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.facultadId = user.scope.facultadId ?? "";
        next.lugarId = getDefaultLugarBySeccional(String(value));
        next.programaId = user.scope.programaId ?? "";
        next.planId = "";
      }

      if (key === "lugarId") {
        next.facultadId = user.scope.facultadId ?? "";
        next.programaId = user.scope.programaId ?? "";
        next.planId = "";
      }

      if (key === "facultadId") {
        next.programaId = user.scope.programaId ?? "";
        next.planId = "";
      }

      if (key === "programaId") {
        const activePlans = getActivePlansByProgram(catalogs, String(value));
        next.planId = activePlans[0]?.id ?? "";
      }

      return next;
    });
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.seccionalId) nextErrors.seccionalId = "Selecciona una seccional o sede.";
    if (!form.lugarId) nextErrors.lugarId = "Selecciona un lugar de desarrollo.";
    if (!form.facultadId) nextErrors.facultadId = "Selecciona una facultad.";
    if (!form.programaId) nextErrors.programaId = "Selecciona un programa.";
    if (!form.planId) nextErrors.planId = "Selecciona un plan de estudios.";

    const selectedPlan = catalogs.planes.find((item) => item.id === form.planId);
    if (form.planId && selectedPlan?.estado !== "activo") {
      nextErrors.planId = "Selecciona un plan de estudios activo.";
    }
    if (!form.descripcion.trim()) {
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
    onSubmit(form);
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
          ? "Registra un nuevo propósito asociado a una seccional o sede, lugar de desarrollo, facultad, programa y plan específico."
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
        <Select
          label="Seccional / Sede"
          value={form.seccionalId}
          onChange={(event) => updateField("seccionalId", event.target.value)}
          options={catalogs.seccionales.map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona una seccional o sede"
          disabled={!canEditStructure || !!user.scope.seccionalId}
          id="seccionalId"
          data-validation-field="seccionalId"
          error={errors.seccionalId}
        />

        <Select
          label="Lugar de desarrollo"
          value={form.lugarId}
          onChange={(event) => updateField("lugarId", event.target.value)}
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
          onChange={(event) => updateField("facultadId", event.target.value)}
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
          onChange={(event) => updateField("programaId", event.target.value)}
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
          onChange={(event) => updateField("planId", event.target.value)}
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

        <Select
          label="Estado"
          value={form.estado}
          onChange={(event) =>
            updateField("estado", event.target.value as FormState["estado"])
          }
          options={[
            { label: "Activo", value: "activo" },
            { label: "Inactivo", value: "inactivo" },
          ]}
          placeholder="Selecciona un estado"
        />
      </div>

      <div className="mt-5 rounded-[20px] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
        <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
          Regla aplicada en edición
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
          Cuando el registro ya existe, se bloquean seccional o sede, lugar de desarrollo, facultad, programa y plan de estudios.
        </p>
        {record ? (
          <p className="mt-3 text-xs leading-5 text-[var(--color-gray-4)]">
            Registro actual: {record.programaNombre} · {record.planNombre}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <Textarea
          label="Descripción"
          value={form.descripcion}
          onChange={(event) => updateField("descripcion", event.target.value)}
          rows={7}
          placeholder="Escribe el propósito de formación del programa..."
          helperText="Este texto será visible en la consulta y podrá actualizarse según las reglas del rol."
          id="descripcion"
          data-validation-field="descripcion"
          error={errors.descripcion}
        />
      </div>
    </Modal>
  );
}

export default PropositoFormModal;
