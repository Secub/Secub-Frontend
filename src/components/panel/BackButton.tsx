import { Button } from "../ui";
import { ActionIcon } from "../ui/ActionIcon";

interface BackButtonProps {
  label: string;
  onClick: () => void;
}

export default function BackButton({ label, onClick }: BackButtonProps) {
  return (
    <div className="mb-5">
      <Button variant="ghost" size="sm" leftIcon={<ActionIcon name="back" />} onClick={onClick}>
        {label}
      </Button>
    </div>
  );
}
