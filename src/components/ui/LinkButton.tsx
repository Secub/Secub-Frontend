import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { isInternalRouteHref, navigateToRoute } from "../../app/appRoutes";
import { getButtonClassName, type ButtonSize, type ButtonVariant } from "./Button";

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export function LinkButton({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = "",
  href,
  onClick,
  ...props
}: LinkButtonProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey ||
      props.target === "_blank" ||
      !isInternalRouteHref(href)
    ) {
      return;
    }

    event.preventDefault();
    navigateToRoute(href ?? "");
  };

  return (
    <a
      className={getButtonClassName({ variant, size, fullWidth, className })}
      href={href}
      onClick={handleClick}
      {...props}
    >
      {leftIcon ? (
        <span className="shrink-0" aria-hidden="true">
          {leftIcon}
        </span>
      ) : null}
      <span>{children}</span>
      {rightIcon ? (
        <span className="shrink-0" aria-hidden="true">
          {rightIcon}
        </span>
      ) : null}
    </a>
  );
}

export default LinkButton;
