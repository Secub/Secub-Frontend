import type { ReactNode } from "react";

interface UserProfileActionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  href?: string;
  intent?: "default" | "danger";
  role?: string;
  onClick?: () => void;
}

function UserProfileActionCardContent({
  icon,
  title,
  description,
}: Pick<UserProfileActionCardProps, "icon" | "title" | "description">) {
  return (
    <>
      <span className="profile-action-card__icon" aria-hidden="true">
        {icon}
      </span>

      <span className="profile-action-card__body">
        <span className="profile-action-card__title">{title}</span>
        {description ? (
          <span className="profile-action-card__description">{description}</span>
        ) : null}
      </span>
    </>
  );
}

export default function UserProfileActionCard({
  icon,
  title,
  description,
  href,
  intent = "default",
  role,
  onClick,
}: UserProfileActionCardProps) {
  const className = [
    "profile-action-card",
    intent === "danger" ? "profile-action-card--danger" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} role={role} className={className} onClick={onClick}>
        <UserProfileActionCardContent icon={icon} title={title} description={description} />
      </a>
    );
  }

  return (
    <button type="button" role={role} className={className} onClick={onClick}>
      <UserProfileActionCardContent icon={icon} title={title} description={description} />
    </button>
  );
}
