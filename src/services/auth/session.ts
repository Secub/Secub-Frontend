import { httpClient } from '../../infrastructure/api';
import { sessionStorageClient } from '../../shared/browser';

export interface AuthContext {
  context_id: string;
  role: string;
  campus_codigo: string;
  location_codigo: string;
  faculty_codigo: string;
  faculty_name: string;
  program_codigo: string;
  program_name: string;
  plan_codigo: string;
  plan_name: string;
}

export interface AuthSession {
  user_id: string;
  person_id: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
  status: string;
  contexts: AuthContext[];
  requires_selection: boolean;
  selected_context_id: string | null;
}

export const AUTH_SESSION_STORAGE_KEY = 'secub:auth-session:v1';

export function persistAuthSession(session: AuthSession): void {
  sessionStorageClient.set(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function getStoredAuthSession(): AuthSession | null {
  const raw = sessionStorageClient.get(AUTH_SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    sessionStorageClient.remove(AUTH_SESSION_STORAGE_KEY);
    return null;
  }
}

export async function fetchAuthSession(): Promise<AuthSession> {
  const session = await httpClient.get<AuthSession>('/auth/session');
  persistAuthSession(session);
  return session;
}

export async function selectAuthContext(contextId: string): Promise<AuthSession> {
  const session = await httpClient.post<AuthSession>('/auth/context', {
    context_id: contextId,
  });
  persistAuthSession(session);
  return session;
}

export async function logoutAuthSession(): Promise<void> {
  await httpClient.post<void>('/auth/logout');
  sessionStorageClient.remove(AUTH_SESSION_STORAGE_KEY);
}
