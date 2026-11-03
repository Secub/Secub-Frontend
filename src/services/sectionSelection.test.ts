import { beforeEach, describe, expect, it, vi } from 'vitest';
import { continueAccessAfterSectionSelection, getSelectedSection } from './sectionSelection';

describe('sectionSelection', () => {
  beforeEach(() => window.localStorage.clear());

  it.each([
    ['cali', 'USBCA'], ['bogota', 'USBBO'], ['cartagena', 'USBCT'],
    ['medellin', 'USBME'],
  ] as const)('inicia el acceso de %s con su campus de Microsoft', (section, campus) => {
    const assign = vi.spyOn(window.location, 'assign').mockImplementation(() => {});
    continueAccessAfterSectionSelection(section);
    expect(assign).toHaveBeenCalledWith(`/auth/microsoft?campus=${campus}`);
    expect(getSelectedSection()).toBe(section);
  });

});
