import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkflowStatus } from '../../services/workflow';
import { persistAuthSession, type AuthSession } from '../../services/auth/session';
import { useAcademicWorkflowProgress } from './academicWorkflow.hooks';
import { clearWorkflowProgressCache } from './academicWorkflow.store';
import type { AcademicWorkflowProgress } from './academicWorkflow.rules';
import { readAcademicWorkflowProgress } from './academicWorkflow.repository';

vi.mock('../../services/workflow', () => ({ getWorkflowStatus: vi.fn() }));

const select = (user = 'A', context = 'plan-1') => persistAuthSession({ user_id: user, selected_context_id: context } as AuthSession);
const deferred = () => {
  let resolve!: (value: AcademicWorkflowProgress) => void;
  const promise = new Promise<AcademicWorkflowProgress>((done) => { resolve = done; });
  return { promise, resolve };
};

describe('shared workflow progress', () => {
  beforeEach(() => {
    clearWorkflowProgressCache();
    select();
    vi.mocked(getWorkflowStatus).mockReset().mockResolvedValue({ 'perfil-egreso': true });
  });
  afterEach(() => {
    clearWorkflowProgressCache();
    persistAuthSession(null as unknown as AuthSession);
    vi.restoreAllMocks();
  });

  it('shares one request and the result across components', async () => {
    const { result } = renderHook(() => [useAcademicWorkflowProgress(), useAcademicWorkflowProgress(), useAcademicWorkflowProgress()]);
    await waitFor(() => expect(result.current.every((value) => value['perfil-egreso'])).toBe(true));
    expect(getWorkflowStatus).toHaveBeenCalledTimes(1);
  });

  it('does not cancel another component when one unmounts', async () => {
    const pending = deferred();
    vi.mocked(getWorkflowStatus).mockReturnValue(pending.promise);
    const first = renderHook(() => useAcademicWorkflowProgress());
    const second = renderHook(() => useAcademicWorkflowProgress());
    first.unmount();
    pending.resolve({ 'perfil-egreso': true });
    await waitFor(() => expect(second.result.current['perfil-egreso']).toBe(true));
    expect(getWorkflowStatus).toHaveBeenCalledTimes(1);
  });

  it('reuses recent progress during navigation without flashing empty state', async () => {
    const first = renderHook(() => useAcademicWorkflowProgress());
    await waitFor(() => expect(first.result.current['perfil-egreso']).toBe(true));
    first.unmount();
    const second = renderHook(() => useAcademicWorkflowProgress());
    expect(second.result.current['perfil-egreso']).toBe(true);
    expect(getWorkflowStatus).toHaveBeenCalledTimes(1);
  });

  it('refreshes once after a change even with multiple subscribers', async () => {
    const { result } = renderHook(() => [useAcademicWorkflowProgress(), useAcademicWorkflowProgress()]);
    await waitFor(() => expect(result.current[0]['perfil-egreso']).toBe(true));
    vi.mocked(getWorkflowStatus).mockResolvedValue({ 'perfil-egreso': false });
    act(() => { window.dispatchEvent(new Event('secub:workflow-changed')); });
    await waitFor(() => expect(result.current.every((value) => value['perfil-egreso'] === false)).toBe(true));
    expect(getWorkflowStatus).toHaveBeenCalledTimes(2);
  });

  it('discards a response started before a mutation and requests fresh progress', async () => {
    const old = deferred();
    const fresh = deferred();
    vi.mocked(getWorkflowStatus).mockReturnValueOnce(old.promise).mockReturnValueOnce(fresh.promise);
    const { result } = renderHook(() => useAcademicWorkflowProgress());
    act(() => { window.dispatchEvent(new Event('secub:workflow-changed')); });
    old.resolve({ 'perfil-egreso': true });
    await waitFor(() => expect(getWorkflowStatus).toHaveBeenCalledTimes(2));
    expect(result.current['perfil-egreso']).toBeUndefined();
    fresh.resolve({ 'perfil-egreso': false });
    await waitFor(() => expect(result.current['perfil-egreso']).toBe(false));
  });

  it('isolates users and selected contexts, including the remembered progress', async () => {
    const first = renderHook(() => useAcademicWorkflowProgress());
    await waitFor(() => expect(first.result.current['perfil-egreso']).toBe(true));
    first.unmount();
    select('B', 'plan-2');
    expect(readAcademicWorkflowProgress()).toEqual({});
    const pending = deferred();
    vi.mocked(getWorkflowStatus).mockReturnValueOnce(pending.promise);
    const second = renderHook(() => useAcademicWorkflowProgress());
    expect(second.result.current).toEqual({});
    pending.resolve({ 'perfil-egreso': false });
    await waitFor(() => expect(second.result.current['perfil-egreso']).toBe(false));
    expect(getWorkflowStatus).toHaveBeenCalledTimes(2);
  });

  it('refreshes old cached progress and invalidates it even between mounts', async () => {
    const first = renderHook(() => useAcademicWorkflowProgress());
    await waitFor(() => expect(first.result.current['perfil-egreso']).toBe(true));
    first.unmount();
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 6_000);
    const second = renderHook(() => useAcademicWorkflowProgress());
    await waitFor(() => expect(getWorkflowStatus).toHaveBeenCalledTimes(2));
    await act(async () => {});
    second.unmount();
    window.dispatchEvent(new Event('secub:workflow-changed'));
    renderHook(() => useAcademicWorkflowProgress());
    await waitFor(() => expect(getWorkflowStatus).toHaveBeenCalledTimes(3));
  });

  it('keeps the workflow locked after an error and allows retry', async () => {
    vi.mocked(getWorkflowStatus).mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useAcademicWorkflowProgress());
    await act(async () => {});
    expect(result.current).toEqual({});
    act(() => { window.dispatchEvent(new Event('secub:workflow-changed')); });
    await waitFor(() => expect(result.current['perfil-egreso']).toBe(true));
  });
});
