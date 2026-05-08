import { SearchX } from "lucide-react";

interface EmptyState_NoDataCardProps {
  title?: string;
  description?: string;
  backgroundColor?: string;
  accentColor?: string;
  titleColor?: string;
  descriptionColor?: string;
}

export default function EmptyStateCard({
  title = "Sin información",
  description = "No hay información disponible para mostrar en este momento.",

  backgroundColor = "#ffffff",
  accentColor = "rgba(16, 15, 15, 0.2)",
  titleColor = "#1E293B",
  descriptionColor = "#4b4d50",
}: EmptyState_NoDataCardProps) {
  return (
    <div
      className="w-full max-w-md rounded-2xl p-8 shadow-sm"
      style={{
        backgroundColor,
        border: `1px solid ${accentColor}`,
      }}
    >
      <div className="flex flex-col items-center justify-center text-center">
        {/* Ilustración */}
        <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        
          <div
            className="absolute h-40 w-40 rounded-full blur-sm"
            style={{
              backgroundColor: accentColor,
            }}
          />

          {/* Card */}
          <div
            className="relative z-10 flex h-32 w-28 flex-col gap-2 rounded-xl p-3"
            style={{
              backgroundColor: accentColor,
              border: `1px solid ${accentColor}`,
            }}
          >
            <div
              className="h-3 w-full rounded"
              style={{ backgroundColor: accentColor }}
            />

            <div
              className="h-3 w-3/4 rounded"
              style={{ backgroundColor: accentColor }}
            />

            <div className="mt-2 flex flex-col gap-2">
              <div
                className="h-2 rounded"
                style={{ backgroundColor: accentColor }}
              />

              <div
                className="h-2 rounded"
                style={{ backgroundColor: accentColor }}
              />

              <div
                className="h-2 w-2/3 rounded"
                style={{ backgroundColor: accentColor }}
              />
            </div>
          </div>

          {/* Lupa */}
          <div
            className="absolute right-2 top-6 z-20 flex h-20 w-20 items-center justify-center rounded-full shadow-sm"
            style={{
              backgroundColor: accentColor,
              border: `1px solid ${accentColor}`,
            }}
          >
            <SearchX
              className="h-10 w-10"
              style={{
                color: accentColor,
              }}
            />
          </div>

          {/* Decoraciones */}
          <span
            className="absolute left-2 top-2 text-xl"
            style={{ color: accentColor }}
          >
            +
          </span>

          <span
            className="absolute bottom-4 right-4 text-xl"
            style={{ color: accentColor }}
          >
            +
          </span>

          <span
            className="absolute right-10 top-3 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />

          <span
            className="absolute left-5 bottom-10 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>

        {/* Texto */}
        <h2
          className="mb-2 text-lg font-semibold"
          style={{ color: titleColor }}
        >
          {title}
        </h2>

        <p
          className="max-w-xs text-sm leading-relaxed"
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}