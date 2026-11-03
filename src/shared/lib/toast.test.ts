import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/i18n', () => ({
  i18n: {
    t: (key: string) => key,
  },
}));

import { toast, useToastStore } from './toast';

describe('toast', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('adds typed toasts with default titles', () => {
    toast.success('Saved');
    toast.error('Failed');
    toast.warning('Careful');
    toast.info('Heads up');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(4);
    expect(toasts.map((item) => item.type)).toEqual(['success', 'error', 'warning', 'info']);
    expect(toasts[0]).toMatchObject({
      title: 'toast.success',
      description: 'Saved',
      duration: 5000,
    });
  });

  it('allows custom title and duration', () => {
    toast.info('Body', { title: 'Custom', duration: 1000 });

    expect(useToastStore.getState().toasts[0]).toMatchObject({
      title: 'Custom',
      description: 'Body',
      duration: 1000,
    });
  });

  it('keeps only the last 5 toasts', () => {
    for (let i = 0; i < 7; i += 1) {
      toast.info(`msg-${i}`);
    }

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(5);
    expect(toasts[0].description).toBe('msg-2');
    expect(toasts[4].description).toBe('msg-6');
  });

  it('dismisses toast by id', () => {
    const id = toast.success('Keep me');
    toast.error('Remove me');

    toast.dismiss(id);

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('error');
  });
});
