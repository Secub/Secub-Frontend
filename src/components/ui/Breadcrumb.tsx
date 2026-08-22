import { SecubIcon } from "./SecubIcon";
import type { MouseEvent } from "react";
import { isInternalRouteHref, navigateToRoute } from "../../app/appRoutes";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
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
        const isInteractive = Boolean((item.href || item.onClick) && !isLast);

        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {isInteractive ? (
              <a
                href={item.href ?? "#"}
                onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                  if (item.onClick) {
                    event.preventDefault();
                    item.onClick();
                    return;
                  }

                  if (!isInternalRouteHref(item.href)) return;
                  event.preventDefault();
                  navigateToRoute(item.href ?? "");
                }}
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
              <SecubIcon name="chevron-right" weight="bold" aria-hidden="true" className="text-base text-[var(--color-gray-4)]" />
            ) : null}
          </span>
        );
      })}
    </nav>
  );
}
