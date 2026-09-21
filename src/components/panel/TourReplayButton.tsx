interface TourReplayButtonProps {
  onClick: () => void;
  label?: string;
  variant?: "default" | "on-dark";
  className?: string;
}

const variantClassName = {
  default:
    "rounded-[6px] text-sm font-semibold text-[var(--color-secondary-1)] underline transition-colors hover:text-[var(--color-secondary-4)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
  "on-dark":
    "w-full rounded-[10px] px-2 py-1 text-xs font-semibold text-[var(--color-secondary-2)] underline transition-colors hover:text-[var(--color-white)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[color:rgba(14,101,217,0.28)]",
} as const;

export default function TourReplayButton({
  onClick,
  label = "Ver guía de esta sección",
  variant = "default",
  className,
}: TourReplayButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onClick()}
      className={[variantClassName[variant], className].filter(Boolean).join(" ")}
    >
      {label}
    </button>
  );
}
