import { SecubIcon } from "../../../../components/ui";
interface CicloSavedMessageProps {
  message: string;
  onClose?: () => void;
  variant?: "success" | "warning";
}

const messageStyles = {
  success:
    "border-[var(--color-success)] bg-[color:rgba(118,202,102,0.14)] text-[var(--color-secondary-4)]",
  warning:
    "border-amber-300 bg-amber-50 text-amber-800",
} as const;

export default function CicloSavedMessage({ message, onClose, variant = "success" }: CicloSavedMessageProps) {
  if (!message) return null;

  const iconName = variant === "warning" ? "warning" : "complete";

  return (
    <div
      role={variant === "warning" ? "alert" : "status"}
      className={`flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border px-5 py-4 text-sm ${messageStyles[variant]}`}
    >
      <span className="inline-flex items-center gap-2">
        <SecubIcon name={iconName} weight="fill" size={20} />
        {message}
      </span>
      {onClose ? (
        <button
          type="button"
          className="font-semibold text-[var(--color-secondary-1)]"
          onClick={onClose}
        >
          Cerrar
        </button>
      ) : null}
    </div>
  );
}
