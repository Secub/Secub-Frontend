export interface SegmentedStepProgressItem {
  id: string;
  label: string;
  completed?: boolean;
  active?: boolean;
}

interface SegmentedStepProgressProps {
  items: SegmentedStepProgressItem[];
}

export default function SegmentedStepProgress({ items }: SegmentedStepProgressProps) {
  if (!items.length) return null;

  return (
    <div className="flex w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-gray-6)] bg-[var(--color-white)] shadow-[var(--shadow-sm)]">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = index === items.length - 1;
        const tone = item.completed || item.active;

        return (
          <div
            key={item.id}
            className={[
              "relative flex min-h-11 flex-1 items-center justify-center px-4 text-sm font-semibold transition-colors",
              tone
                ? "bg-[var(--color-secondary-1)] text-[var(--color-white)]"
                : "bg-[var(--color-white)] text-[var(--color-secondary-4)]",
              !isFirst ? "border-l border-[var(--color-gray-6)]" : "",
              !isLast ? "after:absolute after:right-[-11px] after:top-0 after:z-10 after:h-full after:w-[22px] after:skew-x-[-18deg] after:border-r after:border-[var(--color-gray-6)]" : "",
              !isLast && tone
                ? "after:bg-[var(--color-secondary-1)]"
                : !isLast
                  ? "after:bg-[var(--color-white)]"
                  : "",
            ].join(" ")}
            aria-current={item.active ? "step" : undefined}
          >
            <span className="relative z-20 truncate">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
