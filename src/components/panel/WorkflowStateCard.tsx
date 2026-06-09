import { GoLock, GoPlus, GoShieldCheck } from "react-icons/go";
import { Button } from "../ui";

interface WorkflowStateCardProps {
  variant?: "empty" | "locked";
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  helperText?: string;
}

export default function WorkflowStateCard({
  variant = "empty",
  title,
  description,
  actionLabel,
  onAction,
  helperText,
}: WorkflowStateCardProps) {
  const isLocked = variant === "locked";
  const Icon = isLocked ? GoLock : GoPlus;

  return (
    <div className="surface-card p-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-surface-soft)] text-[var(--color-secondary-1)]">
          <Icon className="text-3xl" />
        </div>

        <h2 className="mt-5 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
          {title}
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
          {description}
        </p>

        {actionLabel && onAction ? (
          <div className="mt-6 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<GoPlus className="text-xl" />}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          </div>
        ) : null}

        {helperText ? (
          <div className="mt-5 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-gray-6)] bg-white px-4 py-2 text-sm text-[var(--color-gray-3)]">
              <GoShieldCheck className="text-base text-[var(--color-secondary-1)]" />
              {helperText}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
