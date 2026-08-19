import type { TableActionsLayout } from "../../../components/ui";

export const PROFILE_PURPOSE_COLUMN_WIDTHS = {
  facultad: "w-[12%]",
  programa: "w-[16%]",
  plan: "w-[12%]",
  descripcion: "w-[34%]",
  estado: "w-[11%]",
} as const;

export const PROFILE_PURPOSE_ACTIONS_LAYOUT: TableActionsLayout = {
  columnWidthClassName: "w-[15%]",
  horizontalPaddingClassName: "px-1",
  alignment: "center",
  groupClassName: "flex-wrap justify-center gap-0.5",
};

export const PROFILE_PURPOSE_DELETE_ACTION_CLASSNAME = "ml-1.5";
