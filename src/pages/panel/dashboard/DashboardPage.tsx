import {
  GoArrowUpRight,
  GoBook,
  GoChecklist,
  GoGraph,
  GoPeople,
} from "react-icons/go";
import { Button } from "../../../components/ui";
import { PanelLayout } from "../../../components/panel";

const summaryCards = [
  {
    label: "Programas activos",
    value: "24",
    helper: "+2 este mes",
    icon: GoBook,
    tone: "bg-[color:rgba(14,101,217,0.10)] text-[var(--color-secondary-1)]",
  },
  {
    label: "Competencias mapeadas",
    value: "1,248",
    helper: "+12% interanual",
    icon: GoChecklist,
    tone: "bg-[color:rgba(248,129,29,0.12)] text-[var(--color-primary)]",
  },
  {
    label: "Resultado logrado",
    value: "84.5%",
    helper: "+3.2% vs anterior",
    icon: GoGraph,
    tone: "bg-[color:rgba(118,202,102,0.14)] text-[color:#2f7d32]",
  },
  {
    label: "Estudiantes evaluados",
    value: "8,432",
    helper: "+154 esta semana",
    icon: GoPeople,
    tone: "bg-[color:rgba(160,195,255,0.18)] text-[var(--color-secondary-4)]",
  },
];


export default function DashboardPage() {
  return (
    <PanelLayout
      currentStep="dashboard"
      title="Vista general del panel"
      description="Resumen ejecutivo del estado de los ciclos, progreso académico y componentes principales del workflow institucional."
      actions={<Button variant="primary">Descargar resumen</Button>}
    >
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="surface-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className={["flex h-12 w-12 items-center justify-center rounded-2xl", card.tone].join(" ")}>
                <card.icon className="text-xl" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[color:rgba(118,202,102,0.14)] px-2.5 py-1 text-xs font-semibold text-[color:#2f7d32]">
                <GoArrowUpRight className="text-sm" />
                Creciendo
              </span>
            </div>
            <div className="mt-5">
              <p className="text-sm text-[var(--color-gray-3)]">{card.label}</p>
              <p className="mt-1 text-3xl font-semibold text-[var(--color-secondary-4)]">{card.value}</p>
              <p className="mt-2 text-xs text-[var(--color-gray-4)]">{card.helper}</p>
            </div>
          </article>
        ))}
      </section>

      
    </PanelLayout>
  );
}
