import type { ComponentPropsWithoutRef } from "react";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  CalendarPlusIcon,
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  ChartBarIcon,
  ChartLineUpIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  DownloadSimpleIcon,
  DotsThreeOutlineVerticalIcon,
  EnvelopeSimpleIcon,
  EyeIcon,
  FileIcon,
  FilePdfIcon,
  FileXlsIcon,
  FileTextIcon,
  GearSixIcon,
  HouseIcon,
  InfoIcon,
  LinkSimpleIcon,
  ListBulletsIcon,
  ListChecksIcon,
  LockIcon,
  MagnifyingGlassIcon,
  MapTrifoldIcon,
  PencilSimpleIcon,
  PersonArmsSpreadIcon,
  PlusIcon,
  SealCheckIcon,
  ShieldCheckIcon,
  SignOutIcon,
  StopCircleIcon,
  TargetIcon,
  TrashIcon,
  UploadSimpleIcon,
  UsersThreeIcon,
  WarningIcon,
  XCircleIcon,
  XIcon,
} from "@phosphor-icons/react";

export type SecubIconName =
  | "add"
  | "view"
  | "edit"
  | "delete"
  | "download"
  | "pdf"
  | "excel"
  | "document"
  | "file"
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
  | "more"
  | "list"
  | "checklist"
  | "chart"
  | "chart-up"
  | "info"
  | "search"
  | "settings"
  | "sign-out"
  | "warning"
  | "people"
  | "target"
  | "book"
  | "map"
  | "cycle"
  | "home"
  | "lock"
  | "shield-check"
  | "calendar"
  | "verified"
  | "accessibility"
  | "stop"
  | "error";

type SvgProps = Omit<ComponentPropsWithoutRef<"svg">, "color">;

export interface SecubIconProps extends SvgProps {
  name: SecubIconName;
  size?: number | string;
  color?: string;
  weight?: IconWeight;
  mirrored?: boolean;
  decorative?: boolean;
}

const secubIcons: Record<SecubIconName, Icon> = {
  add: PlusIcon,
  view: EyeIcon,
  edit: PencilSimpleIcon,
  delete: TrashIcon,
  download: DownloadSimpleIcon,
  pdf: FilePdfIcon,
  excel: FileXlsIcon,
  document: FileTextIcon,
  file: FileIcon,
  email: EnvelopeSimpleIcon,
  back: ArrowLeftIcon,
  next: ArrowRightIcon,
  "chevron-right": CaretRightIcon,
  "chevron-down": CaretDownIcon,
  "chevron-up": CaretUpIcon,
  link: LinkSimpleIcon,
  close: XIcon,
  check: CheckIcon,
  complete: CheckCircleIcon,
  clock: ClockIcon,
  upload: UploadSimpleIcon,
  copy: CopyIcon,
  more: DotsThreeOutlineVerticalIcon,
  list: ListBulletsIcon,
  checklist: ListChecksIcon,
  chart: ChartBarIcon,
  "chart-up": ChartLineUpIcon,
  info: InfoIcon,
  search: MagnifyingGlassIcon,
  settings: GearSixIcon,
  "sign-out": SignOutIcon,
  warning: WarningIcon,
  people: UsersThreeIcon,
  target: TargetIcon,
  book: BookOpenIcon,
  map: MapTrifoldIcon,
  cycle: CalendarPlusIcon,
  home: HouseIcon,
  lock: LockIcon,
  "shield-check": ShieldCheckIcon,
  calendar: CalendarIcon,
  verified: SealCheckIcon,
  accessibility: PersonArmsSpreadIcon,
  stop: StopCircleIcon,
  error: XCircleIcon,
};

export function SecubIcon({
  name,
  size,
  color,
  weight = "regular",
  mirrored = false,
  decorative = true,
  className = "",
  ...props
}: SecubIconProps) {
  const IconComponent = secubIcons[name];

  return (
    <IconComponent
      aria-hidden={decorative ? "true" : undefined}
      focusable="false"
      size={size}
      color={color}
      weight={weight}
      mirrored={mirrored}
      className={["shrink-0", className].join(" ")}
      {...props}
    />
  );
}

export default SecubIcon;
