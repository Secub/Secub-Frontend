interface InformativeProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
}

export default function InformativeProgressBar({
  value,
  label,
  showPercentage = true,
}: InformativeProgressBarProps) {
  const normalizedValue = Math.min(100, Math.max(0, Math.round(value)));
  const accessibleLabel = label ?? "Progreso";

  return (
    <div className="w-full">
      {label || showPercentage ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--color-gray-4)]">
          <span>{label}</span>
          {showPercentage ? <span>{normalizedValue}% completado</span> : null}
        </div>
      ) : null}

      <div
        className="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-gray-7)]"
        role="progressbar"
        aria-label={accessibleLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedValue}
        aria-valuetext={`${normalizedValue}% completado`}
      >
        <div
          aria-hidden="true"
          className="h-full rounded-[var(--radius-pill)] bg-[var(--color-success)] transition-all duration-300"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
