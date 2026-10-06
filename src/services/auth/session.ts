import { httpClient } from '../../infrastructure/api';

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

let currentSession: AuthSession | null = null;

export function persistAuthSession(session: AuthSession): void {
  currentSession = session;
}

export function getStoredAuthSession(): AuthSession | null {
  return currentSession;
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
  currentSession = null;
}
