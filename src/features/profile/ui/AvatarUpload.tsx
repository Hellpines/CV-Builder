'use client';

import Image from 'next/image';
import { Upload } from 'lucide-react';

interface AvatarUploadProps {
  src?: string | null;
  preview?: string | null;
  initials: string;
  alt: string;
  editable: boolean;
  error?: string;
  onSelect: (file: File) => void;
}

export function AvatarUpload({
  src,
  preview,
  initials,
  alt,
  editable,
  error,
  onSelect,
}: AvatarUploadProps) {
  const imageSrc = preview || src;

  return (
    <div className="flex items-center justify-center gap-16">
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={alt}
          width={120}
          height={120}
          unoptimized={Boolean(preview)}
          className="h-30 w-30 rounded-full object-cover"
        />
      ) : (
        <div className="bg-muted text-secondary flex h-30 w-30 items-center justify-center rounded-full text-3xl font-medium">
          {initials}
        </div>
      )}

      {editable && (
        <div className="flex flex-col items-start gap-1 text-left">
          <label className="text-primary-bold hover:text-primary focus-within:text-primary flex cursor-pointer items-center gap-4 transition-colors">
            <Upload size={24} />
            <span className="text-lg font-medium">Upload avatar image</span>
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
          <p className="text-primary-bold/60 text-s">png, jpg or gif no more than 5MB</p>
          {error ? <p className="text-primary text-s">{error}</p> : null}
        </div>
      )}
    </div>
  );
}
