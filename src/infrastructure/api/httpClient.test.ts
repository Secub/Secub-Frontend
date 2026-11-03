import { afterEach, describe, expect, it, vi } from 'vitest';
import { request } from './httpClient';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('workflow invalidation', () => {
  it.each([true, false])('only triggers a refresh for relevant mutations: %s', async (affectsWorkflow) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { headers: { 'Content-Type': 'application/json' } })));
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    await request('/test', { method: 'PUT', affectsWorkflow });
    expect(dispatch.mock.calls.filter(([event]) => event.type === 'secub:workflow-changed')).toHaveLength(affectsWorkflow ? 1 : 0);
  });
});
