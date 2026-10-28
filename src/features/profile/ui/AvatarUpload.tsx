'use client';

import Image from 'next/image';
import { Upload, X } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface AvatarUploadProps {
  src?: string | null;
  preview?: string | null;
  initials: string;
  alt: string;
  editable: boolean;
  error?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export function AvatarUpload({
  src,
  preview,
  initials,
  alt,
  editable,
  error,
  onSelect,
  onRemove,
}: AvatarUploadProps) {
  const { t } = useTranslation();
  const imageSrc = preview || src;

  return (
    <div className="flex items-center justify-center gap-16">
      <div className="group relative h-30 w-30">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={alt}
            width={120}
            height={120}
            unoptimized={Boolean(preview)}
            loading="eager"
            className="h-30 w-30 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted text-secondary flex h-30 w-30 items-center justify-center rounded-full text-3xl font-medium">
            {initials}
          </div>
        )}

        {editable && imageSrc && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={t('common.removeAvatar')}
            suppressHydrationWarning
            className="bg-primary text-secondary absolute top-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {editable && (
        <div className="flex flex-col items-center">
          <label className="text-foregroundus-within:text-primary flex cursor-pointer items-center gap-4 transition-colors hover:underline">
            <div className="flex gap-2">
              <Upload size={24} />
              <span className="text-lg font-medium">{t('common.uploadAvatar')}</span>
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onSelect(file);
                e.target.value = '';
              }}
            />
          </label>
          <p className="text-foreground/60 text-s">{t('common.uploadAvatarHint')}</p>
          {error ? <p className="text-primary text-s">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
