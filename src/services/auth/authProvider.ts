import { setAccessTokenProvider } from "../../infrastructure/api";

/**
 * Single seam for authentication.
 *
 * There is no real session yet: the token provider returns null, and identity
 * for the mock backend is derived from the `?role=` query param (see
 * `mockUser.ts`). When real auth lands, replace the body of
 * `resolveAccessToken` with the session/token lookup — every HTTP call already
 * routes through here, so nothing else changes. See
 * `docs/BACKEND_INTEGRATION.md`.
 */
async function resolveAccessToken(): Promise<string | null> {
  return null;
}

export function initAuth(): void {
  setAccessTokenProvider(resolveAccessToken);
}
