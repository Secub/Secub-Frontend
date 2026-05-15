// import { useState } from "react";
// import { GoChevronLeft, GoChevronRight } from "react-icons/go";
// import { Button, Select, Textarea } from "../../../../components/ui";
// import type {
//   Catalogs,
//   FormState,
//   RolePermissions,
// } from "../MapeoCompetencias.types";

// interface MapeoSemesterClassificationStepProps {
//   step: number;
//   totalSteps: number;
//   title: string;
//   description: string;
//   formValues: FormState;
//   catalogs: Catalogs;
//   permissions: RolePermissions;
//   onFormChange: (field: keyof FormState, value: unknown) => void;
//   onNext: () => void;
//   onPrev: () => void;
//   canProceed: boolean;
// }

// export function MapeoSemesterClassificationStep({
//   step,
//   totalSteps,
//   title,
//   description,
//   formValues,
//   catalogs,
//   permissions,
//   onFormChange,
//   onNext,
//   onPrev,
//   canProceed,
// }: MapeoSemesterClassificationStepProps) {
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const canEditStructure = permissions.canCreate || permissions.canUpdate;

//   const validateCurrentStep = () => {
//     const nextErrors: Record<string, string> = {};

//     if (step === 1) {
//       if (!formValues.seccionalId) nextErrors.seccionalId = "La seccional es requerida";
//       if (!formValues.lugarId) nextErrors.lugarId = "El lugar de desarrollo es requerido";
//     }

//     if (step === 2 && !formValues.facultadId) {
//       nextErrors.facultadId = "La facultad es requerida";
//     }

//     if (step === 3 && !formValues.programaId) {
//       nextErrors.programaId = "El programa academico es requerido";
//     }

//     if (step === 4) {
//       if (!formValues.planId) nextErrors.planId = "El plan de estudios es requerido";
//       if (!formValues.descripcion.trim()) {
//         nextErrors.descripcion = "La descripcion del mapeo es requerida";
//       }
//     }

//     setErrors(nextErrors);
//     return Object.keys(nextErrors).length === 0;
//   };

//   const handleNext = () => {
//     if (validateCurrentStep()) onNext();
//   };

//   const handleFieldChange = (field: keyof FormState, value: string) => {
//     setErrors((current) => ({ ...current, [field]: "" }));
//     onFormChange(field, value);
//   };

//   const availableLugares = catalogs.lugares.filter((lugar) => {
//     if (!formValues.seccionalId) return true;
//     return lugar.seccionalId === formValues.seccionalId;
//   });

//   const availableFacultades = catalogs.facultades.filter((facultad) => {
//     if (!formValues.seccionalId) return true;
//     return facultad.seccionalId === formValues.seccionalId;
//   });

//   const availableProgramas = catalogs.programas.filter((programa) => {
//     if (formValues.facultadId && programa.facultadId !== formValues.facultadId) {
//       return false;
//     }
//     if (formValues.seccionalId && programa.seccionalId !== formValues.seccionalId) {
//       return false;
//     }
//     return true;
//   });

//   return (
//     <div className="space-y-6">
//       <div>
//         <h3 className="text-lg font-semibold text-[var(--color-secondary-4)]">
//           {title}
//         </h3>
//         <p className="mt-1 text-sm text-[var(--color-gray-3)]">{description}</p>
//       </div>

//       <div className="grid gap-4 lg:grid-cols-2">
//         <Select
//           label="Seccional"
//           value={formValues.seccionalId}
//           onChange={(event) => handleFieldChange("seccionalId", event.target.value)}
//           options={catalogs.seccionales.map((item) => ({
//             label: item.nombre,
//             value: item.id,
//           }))}
//           placeholder="Selecciona una seccional"
//           error={errors.seccionalId}
//           required
//           disabled={!canEditStructure}
//         />

//         <Select
//           label="Lugar de desarrollo"
//           value={formValues.lugarId}
//           onChange={(event) => handleFieldChange("lugarId", event.target.value)}
//           options={availableLugares.map((item) => ({
//             label: item.nombre,
//             value: item.id,
//           }))}
//           placeholder="Selecciona un lugar"
//           error={errors.lugarId}
//           required
//           disabled={!canEditStructure}
//         />

//         <Select
//           label="Facultad"
//           value={formValues.facultadId}
//           onChange={(event) => handleFieldChange("facultadId", event.target.value)}
//           options={availableFacultades.map((item) => ({
//             label: item.nombre,
//             value: item.id,
//           }))}
//           placeholder="Selecciona una facultad"
//           error={errors.facultadId}
//           required
//           disabled={!canEditStructure}
//         />

//         <Select
//           label="Programa academico"
//           value={formValues.programaId}
//           onChange={(event) => handleFieldChange("programaId", event.target.value)}
//           options={availableProgramas.map((item) => ({
//             label: item.nombre,
//             value: item.id,
//           }))}
//           placeholder="Selecciona un programa"
//           error={errors.programaId}
//           required
//           disabled={!canEditStructure || !formValues.facultadId}
//         />

//         <Select
//           label="Plan de estudios"
//           value={formValues.planId}
//           onChange={(event) => handleFieldChange("planId", event.target.value)}
//           options={catalogs.planes.map((item) => ({
//             label: item.nombre,
//             value: item.id,
//           }))}
//           placeholder="Selecciona un plan"
//           error={errors.planId}
//           required
//           disabled={!canEditStructure}
//         />

//         <Textarea
//           label="Descripcion"
//           value={formValues.descripcion}
//           onChange={(event) => handleFieldChange("descripcion", event.target.value)}
//           placeholder="Descripcion del mapeo"
//           rows={4}
//           error={errors.descripcion}
//           disabled={!canEditStructure}
//           className="lg:col-span-2"
//         />
//       </div>

//       <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
//         <div className="text-sm text-[var(--color-gray-3)]">
//           Paso {step} de {totalSteps}
//         </div>

//         <div className="flex gap-3">
//           <Button
//             variant="outline"
//             leftIcon={<GoChevronLeft />}
//             onClick={onPrev}
//             disabled={step === 1}
//           >
//             Anterior
//           </Button>

//           <Button
//             variant="primary"
//             rightIcon={step === totalSteps ? undefined : <GoChevronRight />}
//             onClick={handleNext}
//             disabled={!canProceed}
//           >
//             {step === totalSteps ? "Finalizar clasificacion" : "Siguiente"}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default MapeoSemesterClassificationStep;


// import { GoGoal } from "react-icons/go";

// import WorkflowStepProgress from "../../../../components/ui/progress/WorkflowStepProgress";

// export default function Example() {
//   return (
//     <WorkflowStepProgress
//       activeId="step-1"
//       completedIds={["step-1"]}
//       items={[
//         {
//           id: "step-1",
//           label: "Step 1",
//           sublabel: "Información",
//           icon: <GoGoal />,
//         },
//         {
//           id: "step-2",
//           label: "Step 2",
//           sublabel: "Configuración",
//           icon: <GoGoal />,
//         },
//         {
//           id: "step-3",
//           label: "Step 3",
//           sublabel: "Finalización",
//           icon: <GoGoal />,
//         },
//       ]}
//     />
//   );
// }