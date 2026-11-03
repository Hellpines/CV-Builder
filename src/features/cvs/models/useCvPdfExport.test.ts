import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useMutation, exportPdfMutation, toast, downloadPdf, buildPdfHtml, slugify } = vi.hoisted(
  () => ({
    useMutation: vi.fn(),
    exportPdfMutation: vi.fn(),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    downloadPdf: vi.fn(),
    buildPdfHtml: vi.fn(),
    slugify: vi.fn(),
  })
);

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('@/shared/lib/download', () => ({
  downloadPdf: (...args: unknown[]) => downloadPdf(...args),
}));

vi.mock('../helpers/pdf', () => ({
  buildPdfHtml: (...args: unknown[]) => buildPdfHtml(...args),
  slugify: (...args: unknown[]) => slugify(...args),
}));

import { EXPORT_PDF_MUTATION } from '../api/CvPreviewQueries';
import { useCvPdfExport } from './useCvPdfExport';

describe('useCvPdfExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutation.mockReturnValue([exportPdfMutation, { loading: false }]);
    buildPdfHtml.mockReturnValue('<html>pdf</html>');
    slugify.mockReturnValue('main-cv');
    downloadPdf.mockResolvedValue(undefined);
  });

  it('wires export mutation and exposes exporting flag', () => {
    useMutation.mockReturnValue([exportPdfMutation, { loading: true }]);
    const { result } = renderHook(() => useCvPdfExport('Main CV'));

    expect(useMutation).toHaveBeenCalledWith(EXPORT_PDF_MUTATION);
    expect(result.current.exporting).toBe(true);
    expect(result.current.error).toBe('');
  });

  it('no-ops when element is null', async () => {
    const { result } = renderHook(() => useCvPdfExport('Main CV'));

    await act(async () => {
      await result.current.exportPdf(null);
    });

    expect(exportPdfMutation).not.toHaveBeenCalled();
    expect(downloadPdf).not.toHaveBeenCalled();
  });

  it('exports pdf, downloads file, and toasts success', async () => {
    exportPdfMutation.mockResolvedValue({ data: { exportPdf: 'base64-pdf' } });
    const element = document.createElement('div');

    const { result } = renderHook(() => useCvPdfExport('Main CV'));

    await act(async () => {
      await result.current.exportPdf(element);
    });

    expect(buildPdfHtml).toHaveBeenCalledWith(element);
    expect(exportPdfMutation).toHaveBeenCalledWith({
      variables: {
        pdf: {
          html: '<html>pdf</html>',
          margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' },
        },
      },
    });
    expect(slugify).toHaveBeenCalledWith('Main CV');
    expect(downloadPdf).toHaveBeenCalledWith('base64-pdf', 'main-cv.pdf');
    expect(toast.success).toHaveBeenCalledWith('notifications.pdfExported');
    expect(result.current.error).toBe('');
  });

  it('sets error and toasts when server returns empty file', async () => {
    exportPdfMutation.mockResolvedValue({ data: { exportPdf: null } });
    const element = document.createElement('div');

    const { result } = renderHook(() => useCvPdfExport('Main CV'));

    await act(async () => {
      await result.current.exportPdf(element);
    });

    expect(result.current.error).toBe('Server returned an empty file');
    expect(toast.error).toHaveBeenCalledWith('Server returned an empty file');
    expect(downloadPdf).not.toHaveBeenCalled();
  });

  it('uses Error.message on failure', async () => {
    exportPdfMutation.mockRejectedValue(new Error('export failed'));
    const element = document.createElement('div');

    const { result } = renderHook(() => useCvPdfExport('Main CV'));

    await act(async () => {
      await result.current.exportPdf(element);
    });

    expect(result.current.error).toBe('export failed');
    expect(toast.error).toHaveBeenCalledWith('export failed');
  });

  it('falls back to i18n key when rejection is not an Error', async () => {
    exportPdfMutation.mockRejectedValue('boom');
    const element = document.createElement('div');

    const { result } = renderHook(() => useCvPdfExport());

    await act(async () => {
      await result.current.exportPdf(element);
    });

    expect(result.current.error).toBe('notifications.pdfExportFailed');
    expect(toast.error).toHaveBeenCalledWith('notifications.pdfExportFailed');
    expect(downloadPdf).not.toHaveBeenCalled();
  });
});
