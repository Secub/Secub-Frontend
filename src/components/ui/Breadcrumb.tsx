import { GoChevronRight } from "react-icons/go";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items = [] }: BreadcrumbProps) {
  if (items.length <= 1) return null;

  return (
    <nav
      className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[var(--color-gray-3)]"
      aria-label="Migas de pan"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <a
                href={item.href}
                className="font-medium text-[var(--color-gray-3)] transition-colors hover:text-[var(--color-secondary-1)]"
              >
                {item.label}
              </a>
            ) : (
              <span
                className={[
                  "font-medium",
                  isLast
                    ? "text-[var(--color-secondary-4)]"
                    : "text-[var(--color-gray-3)]",
                ].join(" ")}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast ? (
              <GoChevronRight className="text-base text-[var(--color-gray-4)]" />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
