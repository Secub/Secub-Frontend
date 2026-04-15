import { useMemo } from "react";
import {

  GoChevronRight,


} from "react-icons/go";
import { HiCheck } from "react-icons/hi";
import { LuCircleDot } from "react-icons/lu";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";
import LogoSecub from "../../assets/logos/logo-secub-blanco.webp";

interface PanelSidebarProps {
  currentStep: PanelStepKey;
}

type NavigationItem = (typeof panelNavigation)[number];

const academicLabels = [
  "Perfil de Egreso",
  "Propósito de Formación",
  "Competencias y RA",
  "Mapeo de Competencias",
  "Creación del ciclo",
  "Asignar RA",
];

export default function PanelSidebar({ currentStep }: PanelSidebarProps) {
  const dashboardItem =
    panelNavigation.find((item) => item.label === "Dashboard") ??
    panelNavigation[0];

  const academicItems = academicLabels
    .map((label) => panelNavigation.find((item) => item.label === label))
    .filter((item): item is NavigationItem => Boolean(item));

  const measurementItem = panelNavigation.find((item) => {
    const label = item.label.toLowerCase();
    return label === "medición ra" || label === "medicion ra";
  });

  const currentAcademicIndex = academicItems.findIndex(
    (item) => item.key === currentStep,
  );

  const goTo = (href: string) => {
    window.location.href = href;
  };

  const userName = "Usuario demo";

  const academicProgress = useMemo(() => {
    return academicItems.map((item, index) => {
      const isCurrent = item.key === currentStep;
      const isCompleted =
        currentAcademicIndex !== -1 && index < currentAcademicIndex;
      const isPending =
        currentAcademicIndex === -1 || index > currentAcademicIndex;

      return {
        ...item,
        stepNumber: index + 1,
        isCurrent,
        isCompleted,
        isPending,
      };
    });
  }, [academicItems, currentAcademicIndex, currentStep]);

  return (
    <aside className="hidden h-screen w-[320px] shrink-0 flex-col bg-[#11203A] text-white xl:flex">
      <div className="flex h-full flex-col overflow-hidden rounded-r-[32px] border-r border-white/10">
        <div className="px-6 pb-6 pt-8">
          <a href="#inicio" className="flex items-center gap-3">
            <img
              src={LogoSecub}
              alt="SECUB"
              className="h-10 w-auto object-contain"
            />
          </a>
        </div>

        <div className="sidebar-scroll flex-1 overflow-y-auto px-6 pb-6">
          <nav className="space-y-6">
            <button
              type="button"
              onClick={() => goTo(dashboardItem.href)}
              className={[
                "flex w-full items-center rounded-full px-5 py-3 text-left text-[1rem] font-medium transition-colors",
                currentStep === dashboardItem.key
                  ? "bg-[#E8EBF3] text-[#0E65D9]"
                  : "text-[#D8DFEC] hover:bg-white/10",
              ].join(" ")}
            >
              Dashboard
            </button>

            <div>
              <button
                type="button"
                onClick={() => academicItems[0] && goTo(academicItems[0].href)}
                className="text-left text-[1.05rem] font-medium text-[#D8DFEC] transition-colors hover:text-white"
              >
                Gestión Académica
              </button>

              <div className="mt-6 pl-12">
                <div className="space-y-0">
                  {academicProgress.map((item, index) => {
                    const ItemIcon = item.icon;
                    const showConnector = index < academicProgress.length - 1;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => goTo(item.href)}
                        className="group flex w-full items-start gap-4 text-left"
                      >
                        <div className="flex w-8 flex-col items-center">
                          <div
                            className={[
                              "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                              item.isCompleted
                                ? "border-[#27D7B0] bg-[#27D7B0] text-[#11203A]"
                                : item.isCurrent
                                  ? "border-[#0E65D9] bg-[#0E65D9] text-white"
                                  : "border-[#D9DDE5] bg-transparent text-[#D9DDE5]",
                            ].join(" ")}
                          >
                            {item.isCompleted ? (
                              <HiCheck className="text-base" />
                            ) : item.isCurrent ? (
                              <ItemIcon className="text-[0.9rem]" />
                            ) : (
                              <LuCircleDot className="text-[0.9rem]" />
                            )}
                          </div>

                          {showConnector && (
                            <div
                              className={[
                                "my-1 h-8 w-px",
                                item.isCompleted || item.isCurrent
                                  ? "bg-[#27D7B0]"
                                  : "bg-[#D9DDE5]",
                              ].join(" ")}
                            />
                          )}
                        </div>

                        <div className="pt-0.5">
                          <p className="text-[0.52rem] uppercase tracking-[0.16em] text-white/55">
                            Paso {item.stepNumber}
                          </p>
                          <p
                            className={[
                              "max-w-[150px] text-[1rem] leading-[1.2] transition-colors",
                              item.isCurrent
                                ? "text-white"
                                : "text-[#D8DFEC] group-hover:text-white",
                            ].join(" ")}
                          >
                            {item.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {measurementItem && (
              <button
                type="button"
                onClick={() => goTo(measurementItem.href)}
                className={[
                  "flex w-full items-center rounded-full px-5 py-3 text-left text-[1rem] font-medium transition-colors",
                  currentStep === measurementItem.key
                    ? "bg-[#E8EBF3] text-[#0E65D9]"
                    : "text-[#D8DFEC] hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                Medición RA
              </button>
            )}


          </nav>
        </div>



        <div className="mt-auto border-t border-white/20 px-6 py-5">
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-2xl transition-colors hover:bg-white/5"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#FFC928] text-[#11203A]">
              <span className="text-lg font-bold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="text-sm text-[#D8DFEC]">Bienvenido de nuevo</p>
              <p className="truncate text-[1.1rem] font-medium text-white">
                {userName}
              </p>
            </div>

            <GoChevronRight className="text-lg text-white/70" />
          </button>
        </div>
      </div>
    </aside>
  );
}