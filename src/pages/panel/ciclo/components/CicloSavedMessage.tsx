import { GoCheckCircle } from "react-icons/go";

interface CicloSavedMessageProps {
  message: string;
  onClose: () => void;
}

export default function CicloSavedMessage({ message, onClose }: CicloSavedMessageProps) {
  if (!message) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[color:rgba(118,202,102,0.14)] px-5 py-4 text-sm text-[var(--color-secondary-4)]">
      <span className="inline-flex items-center gap-2">
        <GoCheckCircle className="text-xl" />
        {message}
      </span>
      <button
        type="button"
        className="font-semibold text-[var(--color-secondary-1)]"
        onClick={onClose}
      >
        Cerrar
      </button>
    </div>
  );
}
