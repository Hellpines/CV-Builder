import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => h('img', props),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { AvatarUpload } from './AvatarUpload';

describe('AvatarUpload', () => {
  it('shows initials when no image and hides upload when not editable', () => {
    render(
      h(AvatarUpload, {
        initials: 'AB',
        alt: 'Ann Bee',
        editable: false,
        onSelect: vi.fn(),
        onRemove: vi.fn(),
      })
    );

    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.queryByText('common.uploadAvatar')).not.toBeInTheDocument();
  });

  it('shows image, remove, and wires file select/remove when editable', () => {
    const onSelect = vi.fn();
    const onRemove = vi.fn();

    render(
      h(AvatarUpload, {
        src: 'https://cdn/a.png',
        initials: 'AB',
        alt: 'Ann',
        editable: true,
        error: 'bad file',
        onSelect,
        onRemove,
      })
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://cdn/a.png');
    expect(screen.getByText('common.uploadAvatar')).toBeInTheDocument();
    expect(screen.getByText('bad file')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('common.removeAvatar'));
    expect(onRemove).toHaveBeenCalled();

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    expect(onSelect).toHaveBeenCalledWith(file);
  });

  it('prefers preview over src', () => {
    render(
      h(AvatarUpload, {
        src: 'https://cdn/a.png',
        preview: 'blob:preview',
        initials: 'AB',
        alt: 'Ann',
        editable: true,
        onSelect: vi.fn(),
        onRemove: vi.fn(),
      })
    );

    expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:preview');
  });
});
