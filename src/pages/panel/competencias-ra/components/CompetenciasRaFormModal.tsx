import { useEffect, useMemo, useState } from "react";
import { Button, Modal, Select, Textarea } from "../../../../components/ui";
import { getDefaultLugarBySeccional } from "../CompetenciasRa.utils";
import type {
  Catalogs,
  CurrentUser,
  FormState,
  CompetenciasRaEnriched,
} from "../CompetenciasRa.types";

interface CompetenciasRaFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  user: CurrentUser;
  catalogs: Catalogs;
  initialValues: FormState;
  record: CompetenciasRaEnriched | null;
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
  numeroRA?: string;
}

export function CompetenciasRaFormModal({
  open,
  mode,
  user,
  catalogs,
  initialValues,
  record,
  onClose,
  onSubmit,
}: CompetenciasRaFormModalProps) {
  const [form, setForm] = useState<FormState>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setForm(initialValues);
    setErrors({});
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

  const canEditStructure = mode === "create";
  const isDirectorScoped = Boolean(user.scope.programaId);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "seccionalId") {
        next.facultadId = user.scope.facultadId ?? "";
        next.lugarId = getDefaultLugarBySeccional(String(value));
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

    if (!form.seccionalId) nextErrors.seccionalId = "Selecciona una seccional o sede.";
    if (!form.lugarId) nextErrors.lugarId = "Selecciona un lugar de desarrollo.";
    if (!form.facultadId) nextErrors.facultadId = "Selecciona una facultad.";
    if (!form.programaId) nextErrors.programaId = "Selecciona un programa.";
    if (!form.planId) nextErrors.planId = "Selecciona un plan de estudios.";
    if (!form.descripcion.trim()) {
      nextErrors.descripcion = "Escribe la descripción del propósito de formación.";
    }
    if (form.numeroRA < 1) {
      nextErrors.numeroRA = "Debes seleccionar al menos 1 RAs.";
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
      title={
        mode === "create"
          ? "Crear Competencias y Ra"
          : "Editar Competencias y Ra"
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
            {mode === "create" ? "Crear Competencias y RA" : "Guardar cambios"}
          </Button>
        </div>
      }
    >
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
          disabled={!canEditStructure}
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
          error={errors.descripcion}
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Select
          label="Numeros de RAs para asignar"
          value={String(form.numeroRA)}
          onChange={(event) => {
            const num = parseInt(event.target.value) as number;
            updateField("numeroRA", num);
            // Ajustar el array de descripciones de RAs
            const currentDescriptions = form.raDescripciones || [];
            if (num > currentDescriptions.length) {
              // Agregar elementos vacíos
              const newDescriptions = [...currentDescriptions, ...Array(num - currentDescriptions.length).fill("")];
              setForm((current) => ({ ...current, raDescripciones: newDescriptions }));
            } else if (num < currentDescriptions.length) {
              // Remover elementos
              setForm((current) => ({ ...current, raDescripciones: currentDescriptions.slice(0, num) }));
            }
          }}
          options={[
            { label: "1", value: "1" },
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
          ]}
          placeholder="Añada el número de RAs"
          error={errors.numeroRA}
        />
      </div>

      {form.numeroRA > 0 && (
        <>
          <div className="mt-8 border-t border-[var(--color-gray-6)] pt-6">
            <h3 className="text-base font-semibold text-[var(--color-secondary-4)]">
              Resultados de Aprendizaje
            </h3>

            <div className="mt-4 space-y-4">
              {Array.from({ length: form.numeroRA }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4"
                >
                  <label className="text-sm font-medium text-[var(--color-secondary-4)]">
                    RA {String(index + 1).padStart(2, "0")}
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-md border border-[var(--color-gray-5)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--color-primary-5)] focus:ring-1 focus:ring-[var(--color-primary-5)]"
                    rows={3}
                    placeholder={`Ingresa la descripción del resultado de aprendizaje ${index + 1}...`}
                    value={form.raDescripciones?.[index] || ""}
                    onChange={(event) => {
                      const newDescriptions = [...(form.raDescripciones || [])];
                      newDescriptions[index] = event.target.value;
                      setForm((current) => ({ ...current, raDescripciones: newDescriptions }));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

export default CompetenciasRaFormModal;