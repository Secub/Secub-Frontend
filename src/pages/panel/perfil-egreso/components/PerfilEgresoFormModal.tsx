import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Select, Textarea, Input } from "../../../../components/ui";
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

interface FormErrors {
  seccionalId?: string;
  facultadId?: string;
  programaId?: string;
  planId?: string;
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

  useEffect(() => {
    setForm(initialValues);
    setErrors({});
  }, [initialValues, open]);

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

  const canEditStructure = mode === "create";
  const isDirectorScoped = Boolean(user.scope.programaId);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.facultadId = user.scope.facultadId ?? "";
        next.programaId = user.scope.programaId ?? "";
      }

      if (key === "facultadId") {
        next.programaId = user.scope.programaId ?? "";
      }

      return next;
    });
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.seccionalId) nextErrors.seccionalId = "Selecciona una seccional.";
    if (!form.facultadId) nextErrors.facultadId = "Selecciona una facultad.";
    if (!form.programaId) nextErrors.programaId = "Selecciona un programa.";
    if (!form.planId) nextErrors.planId = "Selecciona un plan de estudios.";
    if (!form.descripcion.trim()) {
      nextErrors.descripcion = "Escribe la descripción del perfil de egreso.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === "create" ? "Crear perfil de egreso" : "Editar perfil de egreso"}
      description={
        mode === "create"
          ? "Registra un nuevo perfil de egreso asociado a una seccional, facultad, programa y plan específico."
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
      <div className="grid gap-5 md:grid-cols-2">
        <Select
          label="Seccional"
          value={form.seccionalId}
          onChange={(event) => updateField("seccionalId", event.target.value)}
          options={catalogs.seccionales.map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona una seccional"
          disabled={!canEditStructure || !!user.scope.seccionalId}
          error={errors.seccionalId}
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
          error={errors.programaId}
        />

        <Select
          label="Plan de estudios"
          value={form.planId}
          onChange={(event) => updateField("planId", event.target.value)}
          options={catalogs.planes.map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona un plan"
          disabled={!canEditStructure}
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

        <Input
          label="Fecha de creación"
          value={mode === "create" ? formatDate(new Date().toISOString()) : formatDate(record?.createdAt ?? new Date().toISOString())}
          disabled
          helperText="Se almacena automáticamente al crear el perfil de egreso."
        />
      </div>

      <div className="mt-5 rounded-[20px] border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
        <p className="text-sm font-semibold text-[var(--color-secondary-4)]">
          Regla aplicada en edición
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">
          Cuando el registro ya existe, no se puede modificar el programa académico ni el plan de estudios. Solo se permite actualizar la descripción y el estado.
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
          placeholder="Escribe el perfil de egreso del programa..."
          helperText="Este texto será visible en la consulta y podrá actualizarse según las reglas del rol."
          error={errors.descripcion}
        />
      </div>
    </Modal>
  );
}

export default PerfilEgresoFormModal;
