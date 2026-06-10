import type { IconType } from "react-icons";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: IconType;
  tone?: "info" | "success" | "warning" | "danger" | "accent";
}

const toneStyles = {
  info: "bg-[color:rgba(160,195,255,0.22)] text-[var(--color-secondary-1)]",
  success: "bg-[color:rgba(118,202,102,0.18)] text-[color:#2f7d32]",
  warning: "bg-[color:rgba(251,199,86,0.24)] text-[var(--color-secondary-4)]",
  danger: "bg-[color:rgba(235,87,87,0.12)] text-[var(--color-error)]",
  accent: "bg-[color:rgba(248,129,29,0.14)] text-[var(--color-primary)]",
} as const;

export default function DashboardStatCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "info",
}: DashboardStatCardProps) {
  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <span className={["flex h-12 w-12 items-center justify-center rounded-2xl", toneStyles[tone]].join(" ")}>
          <Icon className="text-xl" />
        </span>
      </div>

      <div className="mt-5">
        <p className="text-sm text-[var(--color-gray-3)]">{label}</p>
        <p className="mt-1 font-heading text-3xl font-semibold text-[var(--color-secondary-4)]">
          {value}
        </p>
        <p className="mt-2 text-xs text-[var(--color-gray-4)]">{helper}</p>
      </div>
    </article>
  );
}
