import { Badge, Button } from "../../../../components/ui";

interface AsignarRAEmptyStateProps {
  title: string;
  description: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AsignarRAEmptyState({
  title,
  description,
  badge = "Asignar RA",
  actionLabel,
  onAction,
}: AsignarRAEmptyStateProps) {
  return (
    <section className="surface-card flex min-h-[260px] items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <Badge variant="info">{badge}</Badge>
        <h2 className="mt-4 font-heading text-2xl font-semibold text-[var(--color-secondary-4)]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--color-gray-3)]">{description}</p>
        {actionLabel && onAction ? (
          <div className="mt-5">
            <Button variant="outline" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
