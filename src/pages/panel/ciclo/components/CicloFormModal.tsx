import { Modal, type SelectOption } from "../../../../components/ui";
import type { CicloCatalogs, CicloEnriched, CicloFormState, CurrentUser } from "../ciclo.types";
import { useCicloFormModal } from "../hooks/useCicloFormModal";
import CicloCoursesSelector from "./form/CicloCoursesSelector";
import CicloFormFields from "./form/CicloFormFields";
import CicloFormFooter from "./form/CicloFormFooter";
import CicloFormIntroCard from "./form/CicloFormIntroCard";

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

export default function CicloFormModal(props: CicloFormModalProps) {
  const { open, mode, catalogs, user, initialValues, record, onClose, onSubmit } = props;
  const form = useCicloFormModal({ open, mode, catalogs, user, initialValues, record, onSubmit });
  const programaOptions = toOptions(form.availableProgramas);
  const planOptions = toOptions(form.activePlans);
  const selectedPrograma = catalogs.programas.find((programa) => programa.id === form.values.programaId);

  return (
    <Modal
      open={open}
      title={form.title}
      description="Selecciona el plan activo y los cursos de Síntesis que harán parte del periodo de selección de 1.5 años."
      size="xl"
      onClose={onClose}
      footer={
        <CicloFormFooter
          record={record}
          isReadOnly={form.isReadOnly}
          canSubmit={form.canSubmit}
          primaryLabel={form.primaryLabel}
          onClose={onClose}
          onSubmit={form.handleSubmit}
        />
      }
    >
      <div className="space-y-6">
        {form.showValidationAlert ? (
          <div
            role="alert"
            className="rounded-[var(--radius-lg)] border border-[var(--color-error)] bg-[color:rgba(235,87,87,0.08)] px-4 py-3 text-sm font-medium text-[var(--color-secondary-4)]"
          >
            Completa la información obligatoria antes de crear o guardar el ciclo. Revisa el primer campo marcado.
          </div>
        ) : null}

        <CicloFormIntroCard />

        <CicloFormFields
          values={form.values}
          isReadOnly={form.isReadOnly}
          user={user}
          selectedFacultad={form.selectedFacultad}
          programaOptions={programaOptions}
          planOptions={planOptions}
          nombreError={form.nombreError}
          programaError={form.programaError}
          planError={form.planError}
          selectedProgramaEstado={selectedPrograma?.estado}
          activePlansLength={form.activePlans.length}
          onValuesChange={form.setValues}
          onProgramChange={form.handleProgramChange}
        />

        <CicloCoursesSelector
          courses={form.availableCourses}
          selectedCourseIds={form.values.cursoIds}
          selectedCount={form.selectedCount}
          isReadOnly={form.isReadOnly}
          error={form.cursosError}
          onToggleCourse={form.toggleCourse}
        />
      </div>
    </Modal>
  );
}
