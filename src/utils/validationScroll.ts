interface ScrollToFirstValidationErrorOptions {
  fieldOrder?: string[];
  delay?: number;
}

const defaultErrorSelector =
  '[aria-invalid="true"], [data-validation-error="true"], [data-validation-section-error="true"]';

function getFirstErrorByOrder(fieldOrder: string[]) {
  for (const fieldName of fieldOrder) {
    const selector = [
      `[data-validation-field="${fieldName}"][aria-invalid="true"]`,
      `[data-validation-field="${fieldName}"][data-validation-error="true"]`,
      `[data-validation-section="${fieldName}"][data-validation-section-error="true"]`,
    ].join(", ");

    const element = document.querySelector<HTMLElement>(selector);
    if (element) return element;
  }

  return null;
}

function getFocusableElement(element: HTMLElement) {
  const isFocusable = element.matches(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );

  if (isFocusable) return element;

  return element.querySelector<HTMLElement>(
    'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
}

export function scrollToFirstValidationError({
  fieldOrder = [],
  delay = 80,
}: ScrollToFirstValidationErrorOptions = {}) {
  if (typeof window === "undefined") return;

  window.setTimeout(() => {
    const target =
      getFirstErrorByOrder(fieldOrder) ??
      document.querySelector<HTMLElement>(defaultErrorSelector);

    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });

    const focusable = getFocusableElement(target);

    if (focusable) {
      focusable.focus({ preventScroll: true });
      return;
    }

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }, delay);
}
