// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { GoGoal } from "react-icons/go";
// import { Button, StepCircleProgress, ConfirmDialog } from "../../../components/ui";
// import { PanelLayout } from "../../../components/panel";
// import EmptyState_NoDataCard from "../../../components/ui/statesEmpty/EmptyState_NoDataCard";
// import MapeoCompetenciasCardInfoCompromiso from "./components/MapeoCompetenciasCardInfoCompromiso";
// import MapeoCompetenciasFiltersPanel from "./components/MapeoCompetenciasFilters";
// import NucleosManager from "./components/NucleosManager";
// import MapeoCompetenciasSemesterStep from "./components/MapeoCompetenciasSemesterStep";
// import {
//   getCatalogs,
//   getCurrentUser,
//   mockMapeoCompetencias,
// } from "./MapeoCompetencias.mock";
// import { rolePermissions } from "./MapeoCompetencias.permissions";
// import { useMapeoCompetenciasManager } from "./hooks/useMapeoCompetenciasManager";

// const currentUser = getCurrentUser();
// const catalogs = getCatalogs();

// export default function MapeoCompetenciasCreatePage() {
//   const navigate = useNavigate();
//   const [activeStep, setActiveStep] = useState<"nucleos" | "mapeo-competencia">("nucleos");

//   // Determinar el programa preestablecido según el rol
//   const defaultPrograma = useMemo(() => {
//     const isDocente = currentUser.role === "docente" || currentUser.role === "director";

//     if (isDocente) {
//       // Para docentes/directores, buscar el programa de Sistemas
//       return catalogs.programas.find((p) => p.nombre.toLowerCase().includes("sistemas")) ||
//         catalogs.programas[0];
//     }

//     // Para otros roles, permitir seleccionar
//     return null;
//   }, []);

//   const [selectedPrograma] = useState(defaultPrograma);
//   const [selectedPlanId] = useState(() =>
//     defaultPrograma?.semestres[0] ? catalogs.planes[0]?.id ?? "" : ""
//   );
//   const [selectedSeccionalId, setSelectedSeccionalId] = useState(
//     currentUser.scope?.seccionalId ?? catalogs.seccionales[0]?.id ?? ""
//   );
//   const [selectedFacultadId, setSelectedFacultadId] = useState(
//     currentUser.scope?.facultadId ?? ""
//   );
//   const [selectedProgramaIdFromFilter, setSelectedProgramaIdFromFilter] = useState(
//     defaultPrograma?.id ?? ""
//   );

//   const permissions = rolePermissions[currentUser.role];

//   // Obtener los semestres con competencias del mock
//   const semestresConCompetencias = useMemo(() => {
//     const programIdToSearch = selectedPrograma?.id ?? selectedProgramaIdFromFilter;
//     const record = mockMapeoCompetencias.find(
//       (m) => m.programaId === programIdToSearch
//     );
//     return record?.semestres ?? [];
//   }, [selectedPrograma, selectedProgramaIdFromFilter]);

//   const {
//     semestresMapping,
//     currentSemesterIndex,
//     currentSemesterComplete,
//     allSemestresEvaluated,
//     mappingSummary,
//     isEvaluationLocked,
//     showFinishModal: showMapeoFinishModal,
//     lastSaveStatus,
//     handleSetCompetenciaOption,
//     handleNextSemester,
//     handlePrevSemester,
//     handleSaveProgress,
//     handleCancelFinish,
//     handleConfirmFinish,
//     handleFinishClick,
//   } = useMapeoCompetenciasManager({
//     programa: selectedPrograma,
//     planId: selectedPlanId,
//     semestresData: semestresConCompetencias,
//   });

//   // Generar opciones de filtro desde el catálogo
//   const catalogFilterOptions = useMemo(() => {
//     const seccionales = catalogs.seccionales.map((item) => ({
//       id: item.id,
//       nombre: item.nombre,
//     }));

//     const facultades = selectedSeccionalId
//       ? catalogs.facultades
//           .filter((f) => f.seccionalId === selectedSeccionalId)
//           .map((item) => ({
//             id: item.id,
//             nombre: item.nombre,
//           }))
//       : [];

//     const programasFiltered = selectedFacultadId
//       ? catalogs.programas
//           .filter((p) => p.facultadId === selectedFacultadId)
//           .map((item) => ({
//             id: item.id,
//             nombre: item.nombre,
//           }))
//       : selectedSeccionalId
//         ? catalogs.programas
//             .filter((p) => p.seccionalId === selectedSeccionalId)
//             .map((item) => ({
//               id: item.id,
//               nombre: item.nombre,
//             }))
//         : catalogs.programas.map((item) => ({
//             id: item.id,
//             nombre: item.nombre,
//           }));

//     const planes = catalogs.planes.map((item) => ({
//       id: item.id,
//       nombre: item.nombre,
//     }));

//     return {
//       seccionales,
//       facultades,
//       lugares: [],
//       programas: programasFiltered,
//       planes,
//     };
//   }, [selectedSeccionalId, selectedFacultadId]);

//   // Obtener el programa seleccionado desde el filtro
//   const programaActual = useMemo(() => {
//     return (
//       catalogs.programas.find((p) => p.id === selectedProgramaIdFromFilter) ||
//       selectedPrograma
//     );
//   }, [selectedProgramaIdFromFilter, selectedPrograma]);

//   return (
//     <PanelLayout
//       currentStep="mapeo-competencias"
//       title="Clasificación de núcleos de formación - Creación"
//       description="Asigna competencias y resultados de aprendizaje por semestre"
//     // actions={
//     //   <Button variant="outline" onClick={() => window.location.href = "/panel/mapeo-competencias"}>
//     //     Cancelar
//     //   </Button>
//     // }
//     >
//       <div className="space-y-6 pb-24">
//         {/* <div className="surface-card rounded-lg p-6 md:p-8">
//           <MapeoCompetenciasCardInfoNucleos />
//         </div> */}

//         <div className="surface-card rounded-lg p-6 md:p-8">
//           <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
//             <div>
//               <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
//                 Progreso del flujo de clasificación
//               </h2>
//               <p className="mt-1 text-sm text-[var(--color-gray-3)]">
//                 Completa los pasos para clasificar niveles de compromiso.
//               </p>
//             </div>

//             <span className="w-fit rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
//               Paso {activeStep === "nucleos" ? 1 : 2} de 2
//             </span>
//           </div>

//           <StepCircleProgress
//             items={[
//               {
//                 id: "nucleos",
//                 label: "Núcleos",
//                 sublabel: "Selecciona núcleos de formación",
//                 icon: <GoGoal className="text-xl" />,
//               },
//               {
//                 id: "mapeo-competencia",
//                 label: "Mapeo Competencia",
//                 sublabel: "Asigna competencias y RA",
//                 icon: <GoGoal className="text-xl" />,
//               },
//             ]}
//             activeId={activeStep}
//             onChange={(stepId) => setActiveStep(stepId as "nucleos" | "mapeo-competencia")}
//           />
//         </div>

//         {/* CONTENIDO PARA EL PASO "NUCLEOS" */}
//         <MapeoCompetenciasFiltersPanel
//           user={currentUser}
//           permissions={permissions}
//           filters={{
//             seccionalId: selectedSeccionalId,
//             lugarId: "",
//             facultadId: selectedFacultadId,
//             programaId: selectedProgramaIdFromFilter,
//             planId: selectedPlanId,
//             estado: "activo",
//           }}
//           filterOptions={catalogFilterOptions}
//           filteredCount={0}
//           totalCount={0}
//           onFilterChange={(key, value) => {
//             if (key === "seccionalId") {
//               setSelectedSeccionalId(value as string);
//               setSelectedFacultadId("");
//               setSelectedProgramaIdFromFilter("");
//             } else if (key === "facultadId") {
//               setSelectedFacultadId(value as string);
//               setSelectedProgramaIdFromFilter("");
//             } else if (key === "programaId") {
//               setSelectedProgramaIdFromFilter(value as string);
//             }
//           }}
//           onReset={() => {
//             setSelectedSeccionalId(currentUser.scope?.seccionalId ?? catalogs.seccionales[0]?.id ?? "");
//             setSelectedFacultadId("");
//             setSelectedProgramaIdFromFilter(defaultPrograma?.id ?? "");
//           }}
//           activeRecords={[]}
//         />

//         {activeStep === "nucleos" && programaActual ? (
//           <NucleosManager
//             currentUser={currentUser}
//             programa={programaActual}
//             planId={selectedPlanId}
//             onEvaluationComplete={() => setActiveStep("mapeo-competencia")}
//           />
//         ) : activeStep === "nucleos" ? (
//           <div className="flex justify-center">
//             <EmptyState_NoDataCard />
//           </div>
//         ) : null}

//         {/* CONTENIDO PARA EL PASO "MAPEO COMPETENCIA" */}
//         {activeStep === "mapeo-competencia" && (
//           <>
//             <div className="surface-card rounded-lg p-6 md:p-8">
//               <MapeoCompetenciasCardInfoCompromiso />
//             </div>

//             {/* Mensaje de estado */}
//             {isEvaluationLocked && (
//               <div className="rounded-lg border-l-4 border-[var(--color-success)] bg-[var(--color-surface-soft)] p-4">
//                 <p className="text-sm font-medium text-[var(--color-success)]">
//                   ✓ Mapeo de competencias completado y guardado correctamente.
//                 </p>
//               </div>
//             )}

//             {lastSaveStatus === "saved" && (
//               <div className="rounded-lg border-l-4 border-[var(--color-success)] bg-[var(--color-surface-soft)] p-4 animate-pulse">
//                 <p className="text-sm font-medium text-[var(--color-success)]">
//                   ✓ Progreso guardado correctamente.
//                 </p>
//               </div>
//             )}

//             {lastSaveStatus === "error" && (
//               <div className="rounded-lg border-l-4 border-[var(--color-error)] bg-[var(--color-surface-soft)] p-4">
//                 <p className="text-sm font-medium text-[var(--color-error)]">
//                   × Debes completar la clasificación de todas las competencias antes de finalizar.
//                 </p>
//               </div>
//             )}

//             {!programaActual ? (
//               <div className="surface-card rounded-lg p-6 md:p-8">
//                 <div className="flex flex-col gap-4 items-center justify-center">
//                   <p className="text-[var(--color-gray-3)] font-medium">No hay programa seleccionado</p>
//                   <p className="text-xs text-[var(--color-gray-4)]">
//                     selectedPrograma: {selectedPrograma?.nombre || "null"} | selectedProgramaIdFromFilter: {selectedProgramaIdFromFilter || "null"}
//                   </p>
//                   <EmptyState_NoDataCard />
//                 </div>
//               </div>
//             ) : semestresConCompetencias.length === 0 ? (
//               <div className="surface-card rounded-lg p-6 md:p-8">
//                 <div className="flex flex-col gap-4 items-center justify-center">
//                   <p className="text-[var(--color-gray-3)] font-medium">No hay competencias disponibles para este programa</p>
//                   <p className="text-xs text-[var(--color-gray-4)]">
//                     Programa ID: {selectedPrograma?.id || selectedProgramaIdFromFilter}
//                   </p>
//                   <EmptyState_NoDataCard />
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <div className="surface-card rounded-lg p-6 md:p-8">
//                   <MapeoCompetenciasSemesterStep
//                     programa={programaActual}
//                     semestresData={semestresConCompetencias}
//                     currentSemesterIndex={currentSemesterIndex}
//                     semestresMapping={semestresMapping}
//                     isCompletionLocked={isEvaluationLocked}
//                     onCompetenciaChange={handleSetCompetenciaOption}
//                     onNextSemester={handleNextSemester}
//                     onPrevSemester={handlePrevSemester}
//                     canAdvance={currentSemesterComplete}
//                   />
//                 </div>

//                 {/* Resumen de asignaciones */}
//                 <div className="surface-card rounded-lg p-6 md:p-8">
//                   <h3 className="font-heading text-lg font-semibold text-[var(--color-secondary-4)] mb-4">
//                     Resumen de clasificación
//                   </h3>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                     <div className="p-4 bg-[var(--color-primary-6)] rounded-lg">
//                       <p className="text-xs text-[var(--color-gray-3)] uppercase font-semibold mb-1">
//                         Introduce
//                       </p>
//                       <p className="text-2xl font-bold text-[var(--color-primary-1)]">
//                         {mappingSummary.introduces}
//                       </p>
//                     </div>
//                     <div className="p-4 bg-[var(--color-warning-6)] rounded-lg">
//                       <p className="text-xs text-[var(--color-gray-3)] uppercase font-semibold mb-1">
//                         Refuerza
//                       </p>
//                       <p className="text-2xl font-bold text-[var(--color-warning-1)]">
//                         {mappingSummary.refuerza}
//                       </p>
//                     </div>
//                     <div className="p-4 bg-[var(--color-success-6)] rounded-lg">
//                       <p className="text-xs text-[var(--color-gray-3)] uppercase font-semibold mb-1">
//                         Afianza
//                       </p>
//                       <p className="text-2xl font-bold text-[var(--color-success-1)]">
//                         {mappingSummary.afianza}
//                       </p>
//                     </div>
//                     <div className="p-4 bg-[var(--color-gray-6)] rounded-lg">
//                       <p className="text-xs text-[var(--color-gray-3)] uppercase font-semibold mb-1">
//                         No Aplica
//                       </p>
//                       <p className="text-2xl font-bold text-[var(--color-gray-3)]">
//                         {mappingSummary.noAplica}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>

//       {/* Footer con botones para el paso mapeo-competencia */}
//       {activeStep === "mapeo-competencia" && (
//         <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-gray-6)] bg-[var(--color-white)] px-6 py-4 shadow-[var(--shadow-lg)] xl:left-[320px]">
//           <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
//             <p className="max-w-3xl text-sm leading-6 text-[var(--color-gray-3)]">
//               Guardar permite conservar avances parciales. Finalizar valida todos los
//               semestres: cada uno debe tener todas sus competencias clasificadas.
//             </p>
//             <div className="flex gap-3 flex-col sm:flex-row">
//               <Button
//                 variant="outline"
//                 onClick={() => navigate("/panel/mapeo-competencias")}
//                 disabled={isEvaluationLocked}
//               >
//                 Volver
//               </Button>
//               <Button
//                 variant="primary_soft"
//                 onClick={handleSaveProgress}
//                 disabled={isEvaluationLocked}
//               >
//                 Guardar Progreso
//               </Button>
//               <Button
//                 variant="primary"
//                 onClick={handleFinishClick}
//                 disabled={!allSemestresEvaluated || isEvaluationLocked}
//               >
//                 Finalizar
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal de confirmación para finalizar mapeo competencias */}
//       <ConfirmDialog
//         open={showMapeoFinishModal}
//         title="Finalizar Mapeo de Competencias"
//         description="¿Estás seguro de que deseas finalizar? Todos los semestres deben tener sus competencias completamente clasificadas. Después de finalizar, podrás volver a la vista general."
//         confirmLabel="Finalizar"
//         cancelLabel="Cancelar"
//         onConfirm={() => {
//           handleConfirmFinish();
//           setTimeout(() => {
//             navigate("/panel/mapeo-competencias");
//           }, 1000);
//         }}
//         onCancel={handleCancelFinish}
//       />
//     </PanelLayout>
//   );
// }









import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoGoal } from "react-icons/go";

import {
  Button,
  StepCircleProgress,
  ConfirmDialog,
} from "../../../components/ui";

import { PanelLayout } from "../../../components/panel";

import EmptyState_NoDataCard from "../../../components/ui/statesEmpty/EmptyState_NoDataCard";

import MapeoCompetenciasCardInfoCompromiso from "./components/MapeoCompetenciasCardInfoCompromiso";

import MapeoCompetenciasFiltersPanel from "./components/MapeoCompetenciasFilters";

import NucleosManager from "./components/NucleosManager";

import MapeoCompetenciasSemesterStep from "./components/MapeoCompetenciasSemesterStep";

import { rolePermissions } from "./MapeoCompetencias.permissions";

import { useMapeoCompetenciasManager } from "./hooks/useMapeoCompetenciasManager";

import { useMapeoCompetenciasData } from "./hooks/useMapeoCompetenciasData";

import { getMapeoByPrograma } from "../../../api/repositories/mapeo.repository";

import type {
  MapeoCompetenciasRecord,
  ProgramaAcademico,
  MapeoCompetenciasRole,
  Seccional,
} from "./MapeoCompetencias.types";

export default function MapeoCompetenciasCreatePage() {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState<
    "nucleos" | "mapeo-competencia"
  >("nucleos");

  // =========================
  // DATA API
  // =========================

  const {
    loading,
    currentUser,
    catalogs,
  } = useMapeoCompetenciasData();

  // =========================
  // STATES
  // =========================

  const [selectedSeccionalId, setSelectedSeccionalId] =
    useState("");

  const [selectedFacultadId, setSelectedFacultadId] =
    useState("");

  const [selectedProgramaIdFromFilter, setSelectedProgramaIdFromFilter] =
    useState("");

  const [selectedPlanId, setSelectedPlanId] =
    useState("");

  const [mapeos, setMapeos] = useState<
    MapeoCompetenciasRecord[]
  >([]);

  // =========================
  // LOADING
  // =========================

  if (loading || !currentUser) {
    return (
      <PanelLayout
        currentStep="mapeo-competencias"
        title="Cargando..."
        description="Obteniendo información"
      >
        <div className="p-10 text-center">
          Cargando información...
        </div>
      </PanelLayout>
    );
  }

  // =========================
  // DEFAULT PROGRAMA
  // =========================

  const defaultPrograma =
    useMemo<ProgramaAcademico | null>(() => {
      const isRestrictedRole =
        currentUser.role === "docente" ||
        currentUser.role === "director";

      if (isRestrictedRole) {
        return (
          catalogs.programas.find(
            (p: ProgramaAcademico) =>
            p.nombre
              .toLowerCase()
              .includes("sistemas")
          ) ?? catalogs.programas[0]
        );
      }

      return null;
    }, [catalogs.programas, currentUser.role]);

  // =========================
  // INIT FILTERS
  // =========================

  useEffect(() => {
    if (!catalogs.seccionales.length) return;

    setSelectedSeccionalId(
      currentUser.scope?.seccionalId ??
        catalogs.seccionales[0]?.id ??
        ""
    );

    setSelectedFacultadId(
      currentUser.scope?.facultadId ?? ""
    );

    setSelectedProgramaIdFromFilter(
      defaultPrograma?.id ?? ""
    );

    setSelectedPlanId(
      catalogs.planes[0]?.id ?? ""
    );
  }, [
    catalogs,
    currentUser,
    defaultPrograma,
  ]);

  // =========================
  // LOAD MAPEOS
  // =========================

  useEffect(() => {
    if (!selectedProgramaIdFromFilter)
      return;

    const loadMapeos = async () => {
      try {
        const data =
          await getMapeoByPrograma(
            selectedProgramaIdFromFilter
          );

        setMapeos(data);
      } catch (error) {
        console.error(
          "Error cargando mapeos:",
          error
        );
      }
    };

    loadMapeos();
  }, [selectedProgramaIdFromFilter]);

  // =========================
  // CURRENT PROGRAMA
  // =========================

  const programaActual =
    useMemo(() => {
      return (
        catalogs.programas.find(
          (p: ProgramaAcademico) =>
            p.id ===
            selectedProgramaIdFromFilter
        ) ?? defaultPrograma
      );
    }, [
      catalogs.programas,
      selectedProgramaIdFromFilter,
      defaultPrograma,
    ]);

  // =========================
  // SEMESTRES
  // =========================

  const semestresConCompetencias =
    useMemo(() => {
      return mapeos[0]?.semestres ?? [];
    }, [mapeos]);

  // =========================
  // PERMISSIONS
  // =========================

  const permissions =
    rolePermissions[currentUser.role as MapeoCompetenciasRole];

  // =========================
  // FILTER OPTIONS
  // =========================

  const catalogFilterOptions =
    useMemo(() => {
      const seccionales =
        catalogs.seccionales.map(
        (item: Seccional) => ({
          id: item.id,
          nombre: item.nombre,
        }));

      const facultades =
        selectedSeccionalId
          ? catalogs.facultades
              .filter(
                (f) =>
                  f.seccionalId ===
                  selectedSeccionalId
              )
              .map((item) => ({
                id: item.id,
                nombre: item.nombre,
              }))
          : [];

      const programasFiltered =
        selectedFacultadId
          ? catalogs.programas
              .filter(
                (p) =>
                  p.facultadId ===
                  selectedFacultadId
              )
              .map((item) => ({
                id: item.id,
                nombre: item.nombre,
              }))
          : catalogs.programas.map(
              (item) => ({
                id: item.id,
                nombre: item.nombre,
              })
            );

      const planes =
        catalogs.planes.map((item) => ({
          id: item.id,
          nombre: item.nombre,
        }));

      return {
        seccionales,
        facultades,
        lugares: [],
        programas: programasFiltered,
        planes,
      };
    }, [
      catalogs,
      selectedSeccionalId,
      selectedFacultadId,
    ]);

  // =========================
  // MANAGER
  // =========================

  const {
    semestresMapping,
    currentSemesterIndex,
    currentSemesterComplete,
    allSemestresEvaluated,
    mappingSummary,
    isEvaluationLocked,
    showFinishModal:
      showMapeoFinishModal,
    lastSaveStatus,
    handleSetCompetenciaOption,
    handleNextSemester,
    handlePrevSemester,
    handleSaveProgress,
    handleCancelFinish,
    handleConfirmFinish,
    handleFinishClick,
  } = useMapeoCompetenciasManager({
    programa: programaActual,
    planId: selectedPlanId,
    semestresData:
      semestresConCompetencias,
  });

  return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title="Clasificación de núcleos de formación - Creación"
      description="Asigna competencias y resultados de aprendizaje por semestre"
    >
      <div className="space-y-6 pb-24">

        {/* STEP HEADER */}

        <div className="surface-card rounded-lg p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-xl font-semibold text-[var(--color-secondary-4)]">
                Progreso del flujo de clasificación
              </h2>

              <p className="mt-1 text-sm text-[var(--color-gray-3)]">
                Completa los pasos para clasificar niveles de compromiso.
              </p>
            </div>

            <span className="w-fit rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm font-semibold text-[var(--color-secondary-1)]">
              Paso{" "}
              {activeStep === "nucleos"
                ? 1
                : 2}{" "}
              de 2
            </span>
          </div>

          <StepCircleProgress
            items={[
              {
                id: "nucleos",
                label: "Núcleos",
                sublabel:
                  "Selecciona núcleos de formación",
                icon: (
                  <GoGoal className="text-xl" />
                ),
              },
              {
                id: "mapeo-competencia",
                label:
                  "Mapeo Competencia",
                sublabel:
                  "Asigna competencias y RA",
                icon: (
                  <GoGoal className="text-xl" />
                ),
              },
            ]}
            activeId={activeStep}
            onChange={(stepId) =>
              setActiveStep(
                stepId as
                  | "nucleos"
                  | "mapeo-competencia"
              )
            }
          />
        </div>

        {/* FILTERS */}

        <MapeoCompetenciasFiltersPanel
          user={currentUser}
          permissions={permissions}
          filters={{
            seccionalId:
              selectedSeccionalId,
            lugarId: "",
            facultadId:
              selectedFacultadId,
            programaId:
              selectedProgramaIdFromFilter,
            planId: selectedPlanId,
            estado: "activo",
          }}
          filterOptions={
            catalogFilterOptions
          }
          filteredCount={0}
          totalCount={0}
          activeRecords={[]}
          onFilterChange={(
            key,
            value
          ) => {
            if (key === "seccionalId") {
              setSelectedSeccionalId(
                value as string
              );

              setSelectedFacultadId(
                ""
              );

              setSelectedProgramaIdFromFilter(
                ""
              );
            }

            if (key === "facultadId") {
              setSelectedFacultadId(
                value as string
              );

              setSelectedProgramaIdFromFilter(
                ""
              );
            }

            if (key === "programaId") {
              setSelectedProgramaIdFromFilter(
                value as string
              );
            }
          }}
          onReset={() => {
            setSelectedSeccionalId(
              currentUser.scope
                ?.seccionalId ??
                catalogs.seccionales[0]
                  ?.id ??
                ""
            );

            setSelectedFacultadId("");

            setSelectedProgramaIdFromFilter(
              defaultPrograma?.id ?? ""
            );
          }}
        />

        {/* NUCLEOS */}

        {activeStep === "nucleos" &&
        programaActual ? (
          <NucleosManager
            currentUser={currentUser}
            programa={programaActual}
            planId={selectedPlanId}
            onEvaluationComplete={() =>
              setActiveStep(
                "mapeo-competencia"
              )
            }
          />
        ) : activeStep === "nucleos" ? (
          <div className="flex justify-center">
            <EmptyState_NoDataCard />
          </div>
        ) : null}

      </div>

      <ConfirmDialog
        open={showMapeoFinishModal}
        title="Finalizar Mapeo de Competencias"
        description="¿Deseas finalizar el proceso?"
        confirmLabel="Finalizar"
        cancelLabel="Cancelar"
        onConfirm={() => {
          handleConfirmFinish();

          setTimeout(() => {
            navigate(
              "/panel/mapeo-competencias"
            );
          }, 1000);
        }}
        onCancel={
          handleCancelFinish
        }
      />
    </PanelLayout>
  );
}