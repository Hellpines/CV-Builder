import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadPdf } from './download';

describe('downloadPdf', () => {
  const click = vi.fn();
  let createObjectURL: ReturnType<typeof vi.fn>;
  let revokeObjectURL: ReturnType<typeof vi.fn>;
  let open: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURL = vi.fn(() => 'blob:mock');
    revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });

    open = vi.spyOn(window, 'open').mockImplementation(() => null);

    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') {
        return {
          href: '',
          download: '',
          click,
          remove: vi.fn(),
        } as unknown as HTMLAnchorElement;
      }
      return document.createElement(tag);
    });
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('downloads base64 pdf via blob link', async () => {
    const base64 = btoa('%PDF-1.4 mock');
    await downloadPdf(base64, 'cv.pdf');

    expect(createObjectURL).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock');
    expect(open).not.toHaveBeenCalled();
  });

  it('fetches remote url and saves blob', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        blob: async () => blob,
      })
    );

    await downloadPdf('https://cdn.example.com/file.pdf', 'remote.pdf');

    expect(fetch).toHaveBeenCalledWith('https://cdn.example.com/file.pdf');
    expect(click).toHaveBeenCalled();
    expect(open).not.toHaveBeenCalled();
  });

  it('opens url in new tab when fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));

    await downloadPdf('https://cdn.example.com/file.pdf', 'remote.pdf');

    expect(open).toHaveBeenCalledWith('https://cdn.example.com/file.pdf', '_blank', 'noopener');
  });
});
