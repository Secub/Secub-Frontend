import { httpClient } from '../../infrastructure/api';
import { isSecubRole } from '../../config/access/roles';

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

/**
 * Contexto seleccionado de la sesión, solo si su rol es uno de los oficiales.
 * Un rol desconocido se trata como "sin contexto": el router vuelve a pedir la
 * selección y el selector descarta ese rol, así que nunca se entra al panel con
 * un rol inválido.
 */
export function getSelectedAuthContext(): AuthContext | undefined {
  const session = currentSession;
  const context = session?.contexts.find((item) => item.context_id === session.selected_context_id);
  if (!context) return undefined;
  return isSecubRole(String(context.role ?? "").trim().toLowerCase()) ? context : undefined;
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
