import { useState, type ReactNode } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";
import { ActionIcon } from "./ActionIcon";
import { Modal } from "./Modal";

interface InfoModalTriggerProps {
  title: string;
  content: ReactNode;
  ariaLabel: string;
  icon?: ReactNode;
  className?: string;
}

export function InfoModalTrigger({
  title,
  content,
  ariaLabel,
  icon = <ActionIcon name="info" size="sm" />,
  className,
}: InfoModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <IconButton
        icon={icon}
        label={ariaLabel}
        variant="primary_soft"
        size="xs"
        className={className}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      />

      <Modal
        open={open}
        title={title}
        size="md"
        onClose={() => setOpen(false)}
        footer={
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Cerrar</Button>
          </div>
        }
      >
        <div className="text-sm leading-6 text-[var(--color-gray-2)]">{content}</div>
      </Modal>
    </>
  );
}

export default InfoModalTrigger;
