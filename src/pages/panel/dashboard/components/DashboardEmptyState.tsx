import { GoChecklist } from "react-icons/go";
import { Button } from "../../../../components/ui";

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  helperText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function DashboardEmptyState({
  title,
  description,
  helperText,
  actionLabel,
  onAction,
}: DashboardEmptyStateProps) {
  return (
    <section className="surface-card p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:rgba(160,195,255,0.18)] text-[var(--color-secondary-1)]">
        <GoChecklist className="text-2xl" />
      </div>
      <h2 className="mt-5 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[var(--color-gray-3)]">
        {description}
      </p>
      {helperText ? (
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-5 text-[var(--color-gray-4)]">
          {helperText}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      ) : null}
    </section>
  );
}
