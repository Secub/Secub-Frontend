import { useEffect, useState } from "react";
import { listNotifications, markNotificationRead, type SecubNotification } from "../../services/notifications";
import { ActionIcon } from "../ui/ActionIcon";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<SecubNotification[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    void listNotifications(controller.signal).then(setItems).catch(() => undefined);
    return () => controller.abort();
  }, []);

  const unread = items.filter((item) => !item.read).length;
  return (
    <div className="relative">
      <button type="button" className="relative rounded-full border border-[var(--color-gray-6)] bg-white p-2 text-[var(--color-secondary-4)]" aria-label={`Notificaciones${unread ? `, ${unread} sin leer` : ""}`} onClick={() => setOpen((value) => !value)}>
        <ActionIcon name="info" />
        {unread ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--color-primary-1)] px-1 text-center text-xs font-semibold text-white">{unread}</span> : null}
      </button>
      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-3rem))] rounded-2xl border border-[var(--color-gray-6)] bg-white p-3 shadow-xl">
          <p className="px-2 pb-2 font-heading font-semibold">Notificaciones</p>
          <div className="max-h-80 space-y-2 overflow-auto">
            {items.length ? items.map((item) => (
              <button key={item.id} type="button" className={`w-full rounded-xl p-3 text-left ${item.read ? "bg-white" : "bg-blue-50"}`} onClick={() => { if (!item.read) void markNotificationRead(item.id).then(() => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry))); }}>
                <span className="block text-sm font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-[var(--color-gray-3)]">{item.message}</span>
              </button>
            )) : <p className="p-3 text-sm text-[var(--color-gray-3)]">No tienes notificaciones.</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
