import { Input, Select, type SelectOption } from "../../../../../components/ui";
import type { CicloFormState, CurrentUser, Facultad } from "../../ciclo.types";
import { addEighteenMonths, buildPeriodFromStartDate } from "../../ciclo.utils";

interface CicloFormFieldsProps {
  values: CicloFormState;
  isReadOnly: boolean;
  user: CurrentUser;
  selectedFacultad?: Facultad;
  programaOptions: SelectOption[];
  planOptions: SelectOption[];
  nombreError?: string;
  programaError?: string;
  planError?: string;
  selectedProgramaEstado?: string;
  activePlansLength: number;
  onValuesChange: (next: CicloFormState | ((current: CicloFormState) => CicloFormState)) => void;
  onProgramChange: (programaId: string) => void;
}

export default function CicloFormFields({
  values,
  isReadOnly,
  user,
  selectedFacultad,
  programaOptions,
  planOptions,
  nombreError,
  programaError,
  planError,
  selectedProgramaEstado,
  activePlansLength,
  onValuesChange,
  onProgramChange,
}: CicloFormFieldsProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Input
          label="Nombre ciclo"
          value={values.nombre}
          onChange={(event) => onValuesChange((current) => ({ ...current, nombre: event.target.value }))}
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
        onChange={(event) => onProgramChange(event.target.value)}
        id="programaId"
        data-validation-field="programaId"
        error={programaError}
        helperText={selectedProgramaEstado === "inactivo" ? "Este programa está inactivo y no permite crear ciclos." : undefined}
      />

      <Select
        label="Plan de estudios"
        value={values.planId}
        options={planOptions}
        placeholder="Selecciona un plan activo"
        disabled={isReadOnly || activePlansLength === 0}
        onChange={(event) =>
          onValuesChange((current) => ({ ...current, planId: event.target.value, cursoIds: [] }))
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
        onChange={(event) => onValuesChange((current) => ({ ...current, fechaInicio: event.target.value }))}
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
  );
}
