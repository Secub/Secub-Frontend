import { IconButton } from "../ui/IconButton";
import { SecubIcon } from "../ui/SecubIcon";

interface TourReplayButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export default function TourReplayButton({
  onClick,
  label = "Ver guía de esta sección",
  className,
}: TourReplayButtonProps) {
  return (
    <IconButton
      label={label}
      icon={<SecubIcon name="lightbulb" size={22} />}
      activeIcon={<SecubIcon name="lightbulb" size={22} weight="fill" />}
      variant="primary_soft"
      size="sm"
      className={["rounded-[var(--radius-pill)] focus-visible:ring-4 focus-visible:ring-[color:var(--secub-focus-soft)]", className]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onClick()}
    />
  );
}
