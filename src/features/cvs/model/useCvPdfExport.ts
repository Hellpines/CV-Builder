import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { downloadPdf } from '@/shared/lib/download';
import { toast } from '@/shared/lib/toast';
import { EXPORT_PDF_MUTATION } from '../api/CvPreviewQueries';
import { buildPdfHtml, slugify } from '../helpers/pdf';

const PDF_MARGIN = { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' };

export function useCvPdfExport(cvName?: string) {
  const { t } = useTranslation();
  const [exportPdf, { loading }] = useMutation(EXPORT_PDF_MUTATION);
  const [error, setError] = useState('');

  const run = async (element: HTMLElement | null) => {
    if (!element) return;

    setError('');
    try {
      const { data } = await exportPdf({
        variables: { pdf: { html: buildPdfHtml(element), margin: PDF_MARGIN } },
      });
      if (!data?.exportPdf) throw new Error('Server returned an empty file');

      await downloadPdf(data.exportPdf, `${slugify(cvName)}.pdf`);
      toast.success(t('notifications.pdfExported'));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('notifications.pdfExportFailed');
      setError(message);
      toast.error(message);
    }
  };

  return { exportPdf: run, exporting: loading, error };
}
