'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useCvPdfExport } from '../model/useCvPdfExport';
import { useCvPreview } from '../model/useCvPreview';
import { CvPreviewDocument } from './CvPreviewDocument';

function PreviewSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-8 sm:p-10" aria-hidden="true">
      <div className="bg-muted/40 h-8 w-1/2 animate-pulse rounded" />
      <div className="bg-muted/40 h-4 w-1/4 animate-pulse rounded" />
      <div className="bg-muted/30 mt-8 h-40 animate-pulse rounded" />
      <div className="bg-muted/30 h-40 animate-pulse rounded" />
      <div className="bg-muted/30 h-40 animate-pulse rounded" />
    </div>
  );
}

export function CvPreviewPage({ cvId }: { cvId: string }) {
  const preview = useCvPreview(cvId);
  const exporter = useCvPdfExport(preview.model?.name);
  const documentRef = useRef<HTMLDivElement>(null);

  const renderContent = () => {
    if (preview.error && !preview.model) {
      return (
        <div className="flex flex-col items-center gap-4 pt-16 text-center">
          <p className="text-primary text-sm">Failed to load CV preview</p>
          <Button variant="secondary" onClick={() => void preview.refetch()}>
            Retry
          </Button>
        </div>
      );
    }

    if (preview.initialLoading) return <PreviewSkeleton />;

    if (!preview.model) {
      return (
        <p className="text-primary-foreground pt-16 text-center text-sm">
          CV preview is not available
        </p>
      );
    }

    return <CvPreviewDocument ref={documentRef} model={preview.model} />;
  };

  return (
    <div className="relative mx-auto w-full max-w-225">
      <div className="absolute top-8 right-8 z-1 flex flex-col items-end gap-2 sm:top-10 sm:right-10">
        <Button
          variant="primaryV2"
          className="border-primary px-8 py-2.5 text-xs"
          disabled={!preview.model || exporter.exporting}
          onClick={() => void exporter.exportPdf(documentRef.current)}
        >
          {exporter.exporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        {exporter.error ? (
          <p className="text-primary max-w-56 text-right text-xs">{exporter.error}</p>
        ) : null}
      </div>

      {renderContent()}
    </div>
  );
}
