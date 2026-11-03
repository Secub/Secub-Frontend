import { httpClient } from '../infrastructure/api';

interface TourHistory {
  seen: Set<string>;
  pending: Set<string>;
  saving: Map<string, Promise<void>>;
  ready: boolean;
  loading?: Promise<void>;
}

const histories = new Map<string, TourHistory>();
const pendingKey = (userId: string) => `secub:onboarding:pending:${userId}`;

function historyFor(userId: string): TourHistory {
  let history = histories.get(userId);
  if (!history) {
    let pending: string[] = [];
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(pendingKey(userId)) ?? '[]');
      if (Array.isArray(stored)) pending = stored.filter((key): key is string =>
        typeof key === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(key));
    } catch { /* La BD sigue siendo la fuente del historial si el navegador bloquea almacenamiento. */ }
    history = { seen: new Set(pending), pending: new Set(pending), saving: new Map(), ready: false };
    histories.set(userId, history);
  }
  return history;
}

function savePendingLocally(userId: string, history: TourHistory) {
  try {
    if (history.pending.size) localStorage.setItem(pendingKey(userId), JSON.stringify([...history.pending]));
    else localStorage.removeItem(pendingKey(userId));
  } catch { /* Conserva los cambios pendientes en memoria durante esta sesión. */ }
}

function persistSeen(userId: string, history: TourHistory, tourKey: string): Promise<void> {
  const saving = history.saving.get(tourKey);
  if (saving) return saving;
  const request = httpClient.put<void>(`/onboarding-tours/${encodeURIComponent(tourKey)}`)
    .then(() => {
      if (histories.get(userId) !== history) return;
      history.pending.delete(tourKey);
      savePendingLocally(userId, history);
    })
    .finally(() => history.saving.delete(tourKey));
  history.saving.set(tourKey, request);
  return request;
}

function syncPending(userId: string, history: TourHistory) {
  if (histories.get(userId) !== history) return;
  for (const key of history.pending) void persistSeen(userId, history, key).catch(() => undefined);
}

export function loadOnboardingTours(userId: string): Promise<void> {
  const history = historyFor(userId);
  if (history.ready) {
    syncPending(userId, history);
    return Promise.resolve();
  }
  if (!history.loading) {
    history.loading = httpClient.get<string[]>('/onboarding-tours').then((keys) => {
      if (histories.get(userId) !== history) return;
      for (const key of keys) {
        history.seen.add(key);
        history.pending.delete(key);
      }
      history.ready = true;
      savePendingLocally(userId, history);
      syncPending(userId, history);
    }).finally(() => { history.loading = undefined; });
  }
  return history.loading;
}

export function hasSeenUserTour(userId: string, tourKey: string): boolean {
  return historyFor(userId).seen.has(tourKey);
}

export function markUserTourSeen(userId: string, tourKey: string): void {
  const history = historyFor(userId);
  if (history.seen.has(tourKey) && !history.pending.has(tourKey)) return;
  history.seen.add(tourKey);
  history.pending.add(tourKey);
  savePendingLocally(userId, history);
  void persistSeen(userId, history, tourKey).catch(() => undefined);
}

export function clearOnboardingTourCache(): void {
  histories.clear();
}
