import { beforeEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../infrastructure/api';
import { clearOnboardingTourCache, hasSeenUserTour, loadOnboardingTours, markUserTourSeen } from './onboardingTours';

vi.mock('../infrastructure/api', () => ({ httpClient: { get: vi.fn(), put: vi.fn() } }));

describe('onboarding history persistence', () => {
  beforeEach(() => {
    clearOnboardingTourCache();
    localStorage.clear();
    vi.resetAllMocks();
    vi.mocked(httpClient.get).mockResolvedValue([]);
    vi.mocked(httpClient.put).mockResolvedValue(undefined);
  });

  it('loads history on a new device and shares one request across tours', async () => {
    vi.mocked(httpClient.get).mockResolvedValue(['tour_sidebar_v1']);
    await Promise.all([loadOnboardingTours('A'), loadOnboardingTours('A')]);
    expect(httpClient.get).toHaveBeenCalledTimes(1);
    expect(hasSeenUserTour('A', 'tour_sidebar_v1')).toBe(true);
    expect(localStorage.length).toBe(0);
  });

  it('isolates users and versions even on the same browser', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce(['tour_sidebar_v1']).mockResolvedValueOnce([]);
    await loadOnboardingTours('A');
    await loadOnboardingTours('B');
    expect(hasSeenUserTour('A', 'tour_sidebar_v1')).toBe(true);
    expect(hasSeenUserTour('A', 'tour_sidebar_v2')).toBe(false);
    expect(hasSeenUserTour('B', 'tour_sidebar_v1')).toBe(false);
  });

  it('retries unsaved progress after a network failure and a new session', async () => {
    vi.mocked(httpClient.put).mockRejectedValueOnce(new Error('offline'));
    markUserTourSeen('A', 'tour_sidebar_v1');
    await vi.waitFor(() => expect(httpClient.put).toHaveBeenCalledTimes(1));
    expect(localStorage.getItem('secub:onboarding:pending:A')).toBe('["tour_sidebar_v1"]');
    clearOnboardingTourCache();
    await loadOnboardingTours('A');
    await vi.waitFor(() => expect(localStorage.getItem('secub:onboarding:pending:A')).toBeNull());
    expect(httpClient.put).toHaveBeenCalledTimes(2);
    expect(hasSeenUserTour('A', 'tour_sidebar_v1')).toBe(true);
  });

  it('does not assign unscoped legacy flags to a different account', async () => {
    localStorage.setItem('tour_sidebar_v1', 'true');
    await loadOnboardingTours('B');
    expect(hasSeenUserTour('B', 'tour_sidebar_v1')).toBe(false);
    expect(httpClient.put).not.toHaveBeenCalled();
  });

  it('can retry a failed history request', async () => {
    vi.mocked(httpClient.get).mockRejectedValueOnce(new Error('offline'));
    await expect(loadOnboardingTours('A')).rejects.toThrow('offline');
    await loadOnboardingTours('A');
    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });

  it('does not sync an old account after logout during loading', async () => {
    let resolve!: (keys: string[]) => void;
    vi.mocked(httpClient.get).mockReturnValue(new Promise<string[]>((done) => { resolve = done; }));
    localStorage.setItem('secub:onboarding:pending:A', '["tour_sidebar_v1"]');
    const loading = loadOnboardingTours('A');
    clearOnboardingTourCache();
    resolve([]);
    await loading;
    expect(httpClient.put).not.toHaveBeenCalled();
  });
});
