import { SecubIcon, type SecubIconName } from "../../../../components/ui";

interface DashboardStatCardProps {
  label: string;
  value: string | number;
  helper: string;
  icon: SecubIconName;
  tone?: "info" | "success" | "warning" | "danger" | "accent";
}

const toneStyles = {
  info: "bg-[color:var(--color-tint-info)] text-[var(--color-link)]",
  success: "bg-[color:var(--color-tint-success-strong)] text-[color:var(--color-success-text)]",
  warning: "bg-[color:var(--color-tint-warning-strong)] text-[var(--color-secondary-4)]",
  danger: "bg-[color:var(--color-tint-danger-strong)] text-[var(--color-error)]",
  accent: "bg-[color:var(--color-tint-accent)] text-[var(--color-primary)]",
} as const;

export default function DashboardStatCard({
  label,
  value,
  helper,
  icon,
  tone = "info",
}: DashboardStatCardProps) {
  return (
    <article className="surface-card p-5">
      <div className="flex items-start justify-between gap-4">
        <span className={["flex h-12 w-12 items-center justify-center rounded-2xl", toneStyles[tone]].join(" ")}>
          <SecubIcon name={icon} weight="fill" size={20} />
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
