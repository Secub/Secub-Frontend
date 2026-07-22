import { useState, type ReactNode } from "react";
import { GoInfo } from "react-icons/go";
import { Button } from "./Button";
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
  icon = <GoInfo aria-hidden="true" className="text-sm" />,
  className,
}: InfoModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={
          className ??
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-secondary-1)] bg-white text-[var(--color-secondary-1)] transition hover:bg-[var(--color-secondary-1)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(14,101,217,0.28)] focus-visible:ring-offset-2"
        }
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        {icon}
      </button>

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
