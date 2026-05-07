import { useState } from "react";
import { GoChevronRight, GoChevronLeft } from "react-icons/go";
import { Button, Textarea, Select } from "../../../../components/ui";
import type { FormState, Catalogs, RolePermissions } from "../MapeoCompetencias.types";

interface MapeoSemesterClassificationStepProps {
  step: number;
  totalSteps: number;
  title: string;
  description: string;
  formValues: FormState;
  catalogs: Catalogs;
  permissions: RolePermissions;
  onFormChange: (field: keyof FormState, value: unknown) => void;
  onNext: () => void;
  onPrev: () => void;
  canProceed: boolean;
}

export function MapeoSemesterClassificationStep({
  step,
  totalSteps,
  title,
  description,
  formValues,
  catalogs,
  permissions,
  onFormChange,
  onNext,
  onPrev,
  canProceed,
}: MapeoSemesterClassificationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formValues.programaId) {
      newErrors.programaId = "El programa académico es requerido";
    }
    if (!formValues.planId) {
      newErrors.planId = "El plan de estudios es requerido";
    }
    if (!formValues.lugarId) {
      newErrors.lugarId = "El lugar de desarrollo es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      onNext();
    }
  };

  const getAvailableLugares = () => {
    if (!formValues.seccionalId) return [];
    return catalogs.lugares.filter(
      (l) => l.seccionalId === formValues.seccionalId
    );
  };

  const getAvailableFacultades = () => {
    if (!formValues.seccionalId) return [];
    return catalogs.facultades.filter(
      (f) => f.seccionalId === formValues.seccionalId
    );
  };

  const getAvailableProgramas = () => {
    if (!formValues.facultadId) return [];
    return catalogs.programas.filter(
      (p) => p.facultadId === formValues.facultadId
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-[var(--color-secondary-4)]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-gray-3)]">{description}</p>
      </div>

      <div className="space-y-4">
        <Select
          label="Lugar de Desarrollo"
          value={formValues.lugarId}
          onChange={(e) => onFormChange("lugarId", e.target.value)}
          options={getAvailableLugares().map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona un lugar"
          error={errors.lugarId}
          required
          disabled={!permissions.canCreate && !permissions.canUpdate}
        />

        <Select
          label="Facultad"
          value={formValues.facultadId}
          onChange={(e) => onFormChange("facultadId", e.target.value)}
          options={getAvailableFacultades().map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona una facultad"
          error={errors.facultadId}
          required
          disabled={!permissions.canCreate && !permissions.canUpdate}
        />

        <Select
          label="Programa Académico"
          value={formValues.programaId}
          onChange={(e) => onFormChange("programaId", e.target.value)}
          options={getAvailableProgramas().map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona un programa"
          error={errors.programaId}
          required
          disabled={!permissions.canCreate && !permissions.canUpdate}
        />

        <Select
          label="Plan de Estudios"
          value={formValues.planId}
          onChange={(e) => onFormChange("planId", e.target.value)}
          options={catalogs.planes.map((item) => ({
            label: item.nombre,
            value: item.id,
          }))}
          placeholder="Selecciona un plan"
          error={errors.planId}
          required
          disabled={!permissions.canCreate && !permissions.canUpdate}
        />

        <Textarea
          label="Descripción"
          value={formValues.descripcion}
          onChange={(e) => onFormChange("descripcion", e.target.value)}
          placeholder="Descripción del mapeo"
          rows={4}
          disabled={!permissions.canCreate && !permissions.canUpdate}
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-4">
        <div className="text-sm text-[var(--color-gray-3)]">
          Paso {step} de {totalSteps}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<GoChevronLeft />}
            onClick={onPrev}
            disabled={step === 1}
          >
            Anterior
          </Button>

          {step === totalSteps ? (
            <Button
              variant="primary"
              onClick={onNext}
              disabled={!canProceed || !validateStep()}
            >
              Finalizar Clasificación
            </Button>
          ) : (
            <Button
              variant="primary"
              rightIcon={<GoChevronRight />}
              onClick={handleNext}
              disabled={!canProceed}
            >
              Siguiente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MapeoSemesterClassificationStep;
