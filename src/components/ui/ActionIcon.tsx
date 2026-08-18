import type { ComponentPropsWithoutRef } from "react";
import type { IconWeight } from "@phosphor-icons/react";
import { SecubIcon, type SecubIconName } from "./SecubIcon";

export type ActionIconName =
  | "add"
  | "view"
  | "edit"
  | "delete"
  | "download"
  | "pdf"
  | "excel"
  | "document"
  | "email"
  | "back"
  | "next"
  | "chevron-right"
  | "chevron-down"
  | "chevron-up"
  | "link"
  | "close"
  | "check"
  | "complete"
  | "clock"
  | "upload"
  | "copy"
  | "list"
  | "chart"
  | "info"
  | "search"
  | "settings"
  | "sign-out";

export type ActionIconSize = "sm" | "md" | "lg";

type SvgIconProps = Omit<ComponentPropsWithoutRef<"svg">, "name">;

interface ActionIconProps extends SvgIconProps {
  name: ActionIconName;
  size?: ActionIconSize;
  weight?: IconWeight;
}

const iconSizes: Record<ActionIconSize, number> = {
  sm: 18,
  md: 20,
  lg: 22,
};

const boldActionIcons = new Set<ActionIconName>([
  "add",
  "back",
  "next",
  "chevron-right",
  "chevron-down",
  "chevron-up",
  "link",
  "close",
  "check",
  "search",
]);

function getActionWeight(name: ActionIconName): IconWeight {
  return boldActionIcons.has(name) ? "bold" : "fill";
}

export function ActionIcon({
  name,
  size = "md",
  weight,
  className = "",
  ...props
}: ActionIconProps) {
  return (
    <SecubIcon
      name={name as SecubIconName}
      size={iconSizes[size]}
      weight={weight ?? getActionWeight(name)}
      className={["leading-none", className].join(" ")}
      {...props}
    />
  );
}

export default ActionIcon;
