import { beforeEach, describe, expect, it, vi } from 'vitest';
import { showNotification } from '../shared/feedback';
import { continueAccessAfterSectionSelection, getSelectedSection } from './sectionSelection';

vi.mock('../shared/feedback', () => ({ showNotification: vi.fn() }));

describe('sectionSelection', () => {
  beforeEach(() => window.localStorage.clear());

  it.each([
    ['cali', 'USBCA'], ['bogota', 'USBBO'],
  ] as const)('inicia el acceso de %s con su campus de Microsoft', (section, campus) => {
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    continueAccessAfterSectionSelection(section);
    expect(assign).toHaveBeenCalledWith(`/auth/microsoft?campus=${campus}`);
    expect(getSelectedSection()).toBe(section);
    expect(showNotification).not.toHaveBeenCalled();
  });

  it.each(['medellin', 'cartagena'] as const)('mantiene %s pendiente sin redirigir', (section) => {
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    continueAccessAfterSectionSelection(section);
    expect(assign).not.toHaveBeenCalled();
    expect(showNotification).toHaveBeenCalledWith(expect.objectContaining({ title: 'Acceso próximamente' }));
  });
});
