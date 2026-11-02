import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useCvPreview, useCvPdfExport } = vi.hoisted(() => ({
  useCvPreview: vi.fn(),
  useCvPdfExport: vi.fn(),
}));

vi.mock('../models/useCvPreview', () => ({ useCvPreview }));
vi.mock('../models/useCvPdfExport', () => ({ useCvPdfExport }));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('./CvPreviewDocument', () => ({
  CvPreviewDocument: ({ model }: { model: { name: string } }) =>
    h('div', { 'data-testid': 'doc' }, model.name),
}));

import { CvPreviewPage } from './CvPreviewPage';

describe('CvPreviewPage', () => {
  beforeEach(() => {
    useCvPdfExport.mockReturnValue({
      exporting: false,
      error: null,
      exportPdf: vi.fn(),
    });
  });

  it('shows error with retry', () => {
    const refetch = vi.fn();
    useCvPreview.mockReturnValue({
      model: null,
      error: new Error('x'),
      initialLoading: false,
      refetch,
    });
    render(h(CvPreviewPage, { cvId: 'c1' }));
    expect(screen.getByText('errors.loadCvPreview')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows skeleton while loading', () => {
    useCvPreview.mockReturnValue({
      model: null,
      error: undefined,
      initialLoading: true,
      refetch: vi.fn(),
    });
    const { container } = render(h(CvPreviewPage, { cvId: 'c1' }));
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('shows unavailable empty state', () => {
    useCvPreview.mockReturnValue({
      model: null,
      error: undefined,
      initialLoading: false,
      refetch: vi.fn(),
    });
    render(h(CvPreviewPage, { cvId: 'c1' }));
    expect(screen.getByText('errors.cvPreviewUnavailable')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'cv.exportPdf' })).toBeDisabled();
  });

  it('renders document and exports pdf', () => {
    const exportPdf = vi.fn();
    useCvPdfExport.mockReturnValue({
      exporting: false,
      error: 'export failed',
      exportPdf,
    });
    useCvPreview.mockReturnValue({
      model: { name: 'My CV' },
      error: undefined,
      initialLoading: false,
      refetch: vi.fn(),
    });

    render(h(CvPreviewPage, { cvId: 'c1' }));
    expect(screen.getByTestId('doc')).toHaveTextContent('My CV');
    expect(screen.getByText('export failed')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'cv.exportPdf' }));
    expect(exportPdf).toHaveBeenCalled();
  });

  it('shows exporting label', () => {
    useCvPdfExport.mockReturnValue({
      exporting: true,
      error: null,
      exportPdf: vi.fn(),
    });
    useCvPreview.mockReturnValue({
      model: { name: 'My CV' },
      error: undefined,
      initialLoading: false,
      refetch: vi.fn(),
    });
    render(h(CvPreviewPage, { cvId: 'c1' }));
    expect(screen.getByRole('button', { name: 'cv.exporting' })).toBeDisabled();
  });
});
