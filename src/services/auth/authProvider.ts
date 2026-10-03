import { setAccessTokenProvider } from "../../infrastructure/api";

/** La autenticación usa la cookie de sesión HTTP; no expone tokens al navegador. */
async function resolveAccessToken(): Promise<string | null> {
  return null;
}

export function initAuth(): void {
  setAccessTokenProvider(resolveAccessToken);
}
