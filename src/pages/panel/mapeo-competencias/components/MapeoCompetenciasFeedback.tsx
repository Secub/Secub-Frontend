interface MapeoCompetenciasFeedbackProps {
  feedback?: { type: "success" | "warning" | "danger"; message: string } | null;
}

export default function MapeoCompetenciasFeedback({ feedback }: MapeoCompetenciasFeedbackProps) {
  if (!feedback) return null;

  return (
    <div
      className={[
        "rounded-[var(--radius-lg)] border px-5 py-4 text-sm font-medium leading-6",
        feedback.type === "success"
          ? "border-[var(--color-success)] bg-[color:rgba(118,202,102,0.14)] text-[var(--color-secondary-4)]"
          : feedback.type === "danger"
            ? "border-[var(--color-error)] bg-[color:rgba(235,87,87,0.10)] text-[var(--color-secondary-4)]"
            : "border-[var(--color-warning)] bg-[var(--color-surface-soft)] text-[var(--color-gray-3)]",
      ].join(" ")}
    >
      {feedback.message}
    </div>
  );
}
