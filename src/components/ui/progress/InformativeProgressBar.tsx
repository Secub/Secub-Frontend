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

  return (
    <div className="w-full">
      {label || showPercentage ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--color-gray-4)]">
          <span>{label}</span>
          {showPercentage ? <span>{normalizedValue}%</span> : null}
        </div>
      ) : null}

      <div className="h-2 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-gray-7)]">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[var(--color-secondary-1)] transition-all duration-300"
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
}
