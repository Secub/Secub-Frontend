import { GoGear, GoSignOut } from "react-icons/go";
import { panelNavigation, type PanelStepKey } from "./panelNavigation";
import LogoSecub from "../../assets/logos/logo-secub.png";
interface PanelSidebarProps {
  currentStep: PanelStepKey;
}

export default function PanelSidebar({ currentStep }: PanelSidebarProps) {
  const dashboardItem = panelNavigation[0];
  const workflowSteps = panelNavigation.slice(1);

  return (
    <aside className="hidden h-screen w-[300px] shrink-0 flex-col border-r border-[var(--color-gray-6)] bg-white xl:flex">
      <div className="border-b border-[var(--color-gray-6)] px-6 py-6">
        <div>
            <a href="#inicio" className="flex items-center gap-3">
              <img
                src={LogoSecub}
                alt="Universidad de San Buenaventura"
                className="h-10 w-30 object-contain mx-auto"
              />
            </a>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <a
          href={dashboardItem.href}
          className={[
            "flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
            currentStep === dashboardItem.key
              ? "bg-[color:rgba(14,101,217,0.10)] text-[var(--color-secondary-1)]"
              : "text-[var(--color-gray-3)] hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)]",
          ].join(" ")}
        >
          <dashboardItem.icon className="text-lg" />
          <div>
            <p className="text-sm font-semibold">{dashboardItem.label}</p>
            <p className="text-xs opacity-70">{dashboardItem.description}</p>
          </div>
        </a>

        <div className="mt-7">
          <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-gray-4)]">
            Workflow académico
          </p>

          <div className="mt-4 space-y-2">
            {workflowSteps.map((item) => {
              const isActive = currentStep === item.key;

              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={[
                    "group flex items-start gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                    isActive
                      ? "bg-[color:rgba(14,101,217,0.10)]"
                      : "hover:bg-[var(--color-surface-soft)]",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200",
                      isActive
                        ? "border-[var(--color-secondary-1)] bg-[var(--color-secondary-1)] text-white"
                        : "border-[var(--color-gray-6)] bg-white text-[var(--color-gray-4)] group-hover:border-[var(--color-secondary-2)] group-hover:text-[var(--color-secondary-1)]",
                    ].join(" ")}
                  >
                    <item.icon className="text-lg" />
                  </div>

                  <div className="min-w-0 pt-0.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-gray-4)]">
                      {item.description}
                    </p>
                    <p
                      className={[
                        "mt-1 text-sm font-medium leading-5",
                        isActive
                          ? "text-[var(--color-secondary-1)]"
                          : "text-[var(--color-secondary-4)]",
                      ].join(" ")}
                    >
                      {item.label}
                    </p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--color-gray-6)] p-4">
        <div className="rounded-2xl border border-[var(--color-gray-6)] bg-[var(--color-surface-soft)] p-4">
          <p className="text-xs text-[var(--color-gray-4)]">Usuario actual</p>
          <p className="mt-1 font-medium text-[var(--color-secondary-4)]">
            Usuario Demo
          </p>
          <p className="mt-1 text-xs text-[var(--color-gray-4)]">
            Director de Programa
          </p>
        </div>

        <div className="mt-4 space-y-1">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-gray-3)] transition-colors hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-secondary-4)]">
            <GoGear className="text-lg" />
            Configuración
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--color-gray-3)] transition-colors hover:bg-[color:rgba(235,87,87,0.08)] hover:text-[var(--color-error)]">
            <GoSignOut className="text-lg" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </aside>
  );
}
