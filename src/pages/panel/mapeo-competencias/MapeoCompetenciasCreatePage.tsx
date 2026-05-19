import { useEffect, useMemo, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { GoGoal } from "react-icons/go";

import {
  StepCircleProgress,
  ConfirmDialog,
} from "../../../components/ui";

import { PanelLayout } from "../../../components/panel";

import EmptyState_NoDataCard from "../../../components/ui/statesEmpty/EmptyState_NoDataCard";

import MapeoCompetenciasFiltersPanel from "./components/MapeoCompetenciasFilters";

import NucleosManager from "./components/NucleosManager";

import MapeoCompetenciasCardInfoNucleos from "./components/MapeoCompetenciasCardInfoNucleos";

import MapeoCompetenciasCardInfoCompromiso from "./components/MapeoCompetenciasCardInfoCompromiso";

import MapeoCompetenciasSemesterStep from "./components/MapeoCompetenciasSemesterStep";

import WorkflowStepProgress from "../../../components/ui/progress/WorkflowStepProgress";

import { rolePermissions } from "./MapeoCompetencias.permissions";

import { useMapeoCompetenciasManager } from "./hooks/useMapeoCompetenciasManager";

import {
  NUCLEOS_STORAGE_EVENT,
  NUCLEOS_STORAGE_KEY,
  readStoredNucleos,
  type NucleoType,
} from "./hooks/useNucleosManager";

import { useMapeoCompetenciasData } from "./hooks/useMapeoCompetenciasData";

import {
  getMapeoByPrograma,
} from "../../../api/repositories/mapeo.repository";

import type {
  MapeoCompetenciasRecord,
  MapeoSemesterData,
  ProgramaAcademico,
  MapeoCompetenciasRole,
  Seccional,
} from "./MapeoCompetencias.types";

const NUCLEO_WORKFLOW_LABELS: Record<
  NucleoType,
  string
> = {
  fundamentacion: "Fundamentacion",
  profesionalizacion:
    "Profesionalizacion",
  sintesis: "Sintesis",
};

function getNucleoWorkflowLabel(
  nucleo?: NucleoType | null
) {
  return nucleo
    ? NUCLEO_WORKFLOW_LABELS[nucleo]
    : "Sin clasificar";
}

export default function MapeoCompetenciasCreatePage() {

  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode =
    Boolean(id);

  const [
    activeStep,
    setActiveStep,
  ] = useState<
    "nucleos" | "niveles-compromiso"
  >("nucleos");

  // =========================
  // DATA API
  // =========================

  const {
    currentUser,
    catalogs,
  } = useMapeoCompetenciasData();

  // =========================
  // STATES
  // =========================

  const [
    selectedSeccionalId,
    setSelectedSeccionalId,
  ] = useState("");

  const [
    selectedFacultadId,
    setSelectedFacultadId,
  ] = useState("");

  const [
    selectedProgramaIdFromFilter,
    setSelectedProgramaIdFromFilter,
  ] = useState("");

  const [
    selectedPlanId,
    setSelectedPlanId,
  ] = useState("");

  const [mapeos, setMapeos] =
    useState<
      MapeoCompetenciasRecord[]
    >([]);

  const [
    semestresNucleosWorkflow,
    setSemestresNucleosWorkflow,
  ] = useState<
    Record<number, NucleoType | null>
  >({});

  // =========================
  // LOAD FILTERS FROM STORAGE
  // =========================

  useEffect(() => {

    const storedFilters =
      localStorage.getItem(
        "mapeoCompetenciasFilters"
      );

    if (!storedFilters) {
      return;
    }

    try {

      const parsedFilters =
        JSON.parse(storedFilters);

      setSelectedSeccionalId(
        parsedFilters.seccionalId ??
        ""
      );

      setSelectedFacultadId(
        parsedFilters.facultadId ??
        ""
      );

      setSelectedProgramaIdFromFilter(
        parsedFilters.programaId ??
        ""
      );

      setSelectedPlanId(
        parsedFilters.planId ??
        ""
      );

    } catch (error) {

      console.error(
        "Error leyendo filtros:",
        error
      );
    }

  }, []);

  // =========================
  // DEFAULT PROGRAMA
  // =========================

  const defaultPrograma =
    useMemo<ProgramaAcademico | null>(
      () => {

        if (!currentUser) {
          return null;
        }

        const isRestrictedRole =
          currentUser.role ===
            "docente" ||
          currentUser.role ===
            "director";

        if (isRestrictedRole) {

          return (
            catalogs.programas.find(
              (
                p: ProgramaAcademico
              ) =>
                p.nombre
                  .toLowerCase()
                  .includes(
                    "sistemas"
                  )
            ) ??
            catalogs.programas[0]
          );
        }

        return null;

      },
      [
        catalogs.programas,
        currentUser?.role,
      ]
    );

  // =========================
  // INIT FILTERS
  // =========================

  useEffect(() => {

    if (
      !catalogs.seccionales.length ||
      !currentUser
    ) {
      return;
    }

    // Solo aplicar defaults
    // si NO vienen filtros guardados

    if (!selectedSeccionalId) {

      setSelectedSeccionalId(
        currentUser.scope
          ?.seccionalId ??
        catalogs.seccionales[0]
          ?.id ??
        ""
      );
    }

    if (!selectedProgramaIdFromFilter) {

      setSelectedProgramaIdFromFilter(
        defaultPrograma?.id ?? ""
      );
    }

    if (!selectedPlanId) {

      setSelectedPlanId(
        catalogs.planes[0]?.id ??
        ""
      );
    }

  }, [
    catalogs,
    currentUser,
    defaultPrograma,
    selectedSeccionalId,
    selectedProgramaIdFromFilter,
    selectedPlanId,
  ]);

  // =========================
  // LOAD MAPEOS
  // =========================

  useEffect(() => {

    if (
      !selectedProgramaIdFromFilter
    ) {
      return;
    }

    const loadMapeos =
      async () => {

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

  }, [
    selectedProgramaIdFromFilter,
  ]);

  // =========================
  // CURRENT PROGRAMA
  // =========================

  const programaActual =
    useMemo(() => {

      return (
        catalogs.programas.find(
          (
            p: ProgramaAcademico
          ) =>
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
  // LOAD EDIT DATA
  // =========================

  useEffect(() => {

    if (
      !isEditMode ||
      !id ||
      !mapeos.length
    ) {
      return;
    }

    const mapeoActual =
      mapeos.find(
        (mapeo) =>
          mapeo.id === id
      );

    if (!mapeoActual) {
      return;
    }

    setSelectedProgramaIdFromFilter(
      mapeoActual.programaId
    );

    setSelectedPlanId(
      mapeoActual.planId
    );

  }, [
    id,
    isEditMode,
    mapeos,
  ]);

  // =========================
  // NUCLEOS STORAGE
  // =========================

  useEffect(() => {

    if (
      !programaActual?.id ||
      !selectedPlanId
    ) {

      setSemestresNucleosWorkflow(
        {}
      );

      return;
    }

    const syncStoredNucleos =
      () => {

        setSemestresNucleosWorkflow(
          readStoredNucleos(
            programaActual.id,
            selectedPlanId
          )
        );
      };

    const handleStorageChange =
      (
        event: StorageEvent
      ) => {

        if (
          event.key ===
          NUCLEOS_STORAGE_KEY
        ) {
          syncStoredNucleos();
        }
      };

    const handleNucleosUpdated =
      (event: Event) => {

        const { detail } =
          event as CustomEvent<{
            programaId: string;
            planId: string;
            semestres: Record<
              number,
              NucleoType | null
            >;
          }>;

        if (
          detail?.programaId ===
            programaActual.id &&
          detail.planId ===
            selectedPlanId
        ) {

          setSemestresNucleosWorkflow(
            detail.semestres
          );
        }
      };

    syncStoredNucleos();

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    window.addEventListener(
      NUCLEOS_STORAGE_EVENT,
      handleNucleosUpdated
    );

    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

      window.removeEventListener(
        NUCLEOS_STORAGE_EVENT,
        handleNucleosUpdated
      );
    };

  }, [
    programaActual?.id,
    selectedPlanId,
  ]);

  // =========================
  // SEMESTRES
  // =========================

  const semestresConCompetencias =
    useMemo<
      MapeoSemesterData[]
    >(() => {

      const mapeoDelPlan =
        mapeos.find(
          (mapeo) =>
            !selectedPlanId ||
            mapeo.planId ===
              selectedPlanId
        ) ?? mapeos[0];

      const mapeoSemestres =
        mapeoDelPlan?.semestres ??
        [];

      const semestresPrograma = [
        ...(programaActual
          ?.semestres ?? []),
      ].sort(
        (a, b) =>
          a.numero - b.numero
      );

      if (
        semestresPrograma.length ===
        0
      ) {
        return mapeoSemestres;
      }

      const mapeoPorId =
        new Map(
          mapeoSemestres.map(
            (semestre) => [
              semestre.semesterId,
              semestre,
            ]
          )
        );

      const mapeoPorNumero =
        new Map(
          mapeoSemestres.map(
            (semestre) => [
              semestre.semesterNumber,
              semestre,
            ]
          )
        );

      return semestresPrograma.map(
        (
          semestre,
          index
        ) => {

          const semestreMapeado =
            mapeoPorId.get(
              semestre.id
            ) ??
            mapeoPorNumero.get(
              semestre.numero
            );

          return {
            semesterId:
              semestre.id ??
              semestreMapeado?.semesterId ??
              `sem-${index + 1}`,

            semesterNumber:
              semestre.numero ??
              semestreMapeado?.semesterNumber ??
              index + 1,

            tipo:
              semestreMapeado?.tipo ??
              semestre.tipo,

            competencias:
              semestreMapeado?.competencias ??
              [],
          };
        }
      );

    }, [
      mapeos,
      programaActual?.semestres,
      selectedPlanId,
    ]);

  // =========================
  // WORKFLOW ITEMS
  // =========================

  const workflowItems =
    useMemo(() => {

      return semestresConCompetencias.map(
        (
          semestre,
          index
        ) => ({
          id: semestre.semesterId,

          label: `Semestre ${
            semestre.semesterNumber ??
            index + 1
          }`,

          sublabel:
            semestre.semesterNumber
              ? getNucleoWorkflowLabel(
                  semestresNucleosWorkflow[
                    semestre
                      .semesterNumber
                  ] ??
                    semestre.tipo ??
                    null
                )
              : `Nivel ${
                  index + 1
                }`,
        })
      );

    }, [
      semestresConCompetencias,
      semestresNucleosWorkflow,
    ]);

  // =========================
  // PERMISSIONS
  // =========================

  const permissions =
    currentUser
      ? rolePermissions[
          currentUser.role as MapeoCompetenciasRole
        ]
      : undefined;

  // =========================
  // FILTER OPTIONS
  // =========================

  const catalogFilterOptions =
    useMemo(() => {

      const seccionales =
        catalogs.seccionales.map(
          (
            item: Seccional
          ) => ({
            id: item.id,
            nombre: item.nombre,
          })
        );

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
                nombre:
                  item.nombre,
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
                nombre:
                  item.nombre,
              }))
          : catalogs.programas.map(
              (item) => ({
                id: item.id,
                nombre:
                  item.nombre,
              })
            );

      const planes =
        catalogs.planes.map(
          (item) => ({
            id: item.id,
            nombre:
              item.nombre,
          })
        );

      return {
        seccionales,
        facultades,
        lugares: [],
        programas:
          programasFiltered,
        planes,
        estados: [
          {
            id: "activo",
            nombre:
              "Activo",
          },
          {
            id: "inactivo",
            nombre:
              "Inactivo",
          },
        ],
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
    isEvaluationLocked,
    showFinishModal:
      showMapeoFinishModal,

    handleSetCompetenciaOption,
    handleGoToSemester,
    handlePrevSemester,
    handleCancelFinish,
    handleConfirmFinish,
  } =
    useMapeoCompetenciasManager(
      {
        programa:
          programaActual,

        planId:
          selectedPlanId,

        semestresData:
          semestresConCompetencias,
      }
    );

   return (
    <PanelLayout
      currentStep="mapeo-competencias"
      title={
        isEditMode
          ? "Editar Mapeo de Competencias"
          : "Clasificación de núcleos de formación - Creación"
      }
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
                id: "niveles-compromiso",
                label:
                  "Niveles de Compromiso",
                sublabel:
                  "Selecciona los niveles de compromiso",
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
                | "niveles-compromiso"
              )
            }
          />
        </div>

        {/* FILTERS */}

        {currentUser && (
          <MapeoCompetenciasFiltersPanel
            user={currentUser}
            permissions={permissions as any}
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

              if (key === "planId") {
                setSelectedPlanId(
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

              setSelectedPlanId(
                catalogs.planes[0]?.id ?? ""
              );
            }}
          />
        )}

        {/* Card Info Nucleos */}

        {activeStep === "nucleos" && (
          <MapeoCompetenciasCardInfoNucleos />
        )}



        {/* NUCLEOS */}

        {activeStep === "nucleos" &&
          programaActual && currentUser ? (
          <NucleosManager
            currentUser={currentUser}
            programa={programaActual}
            planId={selectedPlanId}
            onEvaluationComplete={() =>
              setActiveStep(
                "niveles-compromiso"
              )
            }
          />
        ) : activeStep === "nucleos" ? (
          <div className="flex justify-center">
            <EmptyState_NoDataCard />
          </div>
        ) : null}


        {/* Card Info niveles compromiso */}

        {activeStep === "niveles-compromiso" && (
          <div className="surface-card rounded-lg p-6 md:p-8">
            <MapeoCompetenciasCardInfoCompromiso />
          </div>
        )}

        {activeStep === "niveles-compromiso" &&
          programaActual && currentUser && semestresConCompetencias.length > 0 ? (
          <WorkflowStepProgress
            items={workflowItems}
            activeId={
              workflowItems[currentSemesterIndex]
                ?.id ??
              workflowItems[0]?.id ??
              ""
            }
            completedIds={workflowItems
              .slice(0, currentSemesterIndex)
              .map((item) => item.id)}
            onChange={(semesterId: string) => {
              const semesterIndex =
                workflowItems.findIndex(
                  (item) =>
                    item.id === semesterId,
                );

              if (semesterIndex >= 0) {
                handleGoToSemester(
                  semesterIndex,
                );
              }
            }}
          />
        ): null}



        {/* Niveles Compromiso */}

        {activeStep === "niveles-compromiso" &&
          programaActual && currentUser ? (
          <div className="surface-card rounded-lg p-6 md:p-8">
            <MapeoCompetenciasSemesterStep
              programa={programaActual}
              semestresData={semestresConCompetencias}
              currentSemesterIndex={currentSemesterIndex}
              semestresMapping={semestresMapping}
              isCompletionLocked={isEvaluationLocked}
              onCompetenciaChange={handleSetCompetenciaOption}
              OnGoToSemester={handleGoToSemester}
              onPrevSemester={handlePrevSemester}
              canAdvance={currentSemesterComplete}
            />
          </div>
        ) : activeStep === "niveles-compromiso" ? (
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
