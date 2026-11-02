import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { LanguagesPage } from './LanguagesPage';

describe('LanguagesPage', () => {
  it('renders languages stub label', () => {
    render(h(LanguagesPage));
    expect(screen.getByText('nav.languages')).toBeInTheDocument();
  });
});
