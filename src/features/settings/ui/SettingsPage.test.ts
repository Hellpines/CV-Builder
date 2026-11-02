import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { setTheme, setLanguage } = vi.hoisted(() => ({
  setTheme: vi.fn(),
  setLanguage: vi.fn(),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({ theme: 'system', setTheme }),
}));

vi.mock('@/shared/i18n/useLanguage', () => ({
  useLanguage: () => ({ language: 'en', setLanguage }),
}));

vi.mock('@/components/ui/select-field', () => ({
  SelectField: ({
    label,
    value,
    options,
    onChange,
  }: {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }) =>
    h(
      'div',
      null,
      h('label', null, label),
      h(
        'select',
        {
          'aria-label': label,
          value,
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value),
        },
        options.map((opt) => h('option', { key: opt.value, value: opt.value }, opt.label))
      )
    ),
}));

vi.mock('./PasswordSection', () => ({
  PasswordSection: () => h('div', { 'data-testid': 'password-section' }),
}));

import SettingsPage from './SettingsPage';

describe('SettingsPage', () => {
  beforeEach(() => {
    setTheme.mockReset();
    setLanguage.mockReset();
  });

  it('renders theme/language selects and password section', () => {
    render(h(SettingsPage));

    expect(screen.getByLabelText('common.theme')).toHaveValue('system');
    expect(screen.getByLabelText('common.language')).toHaveValue('en');
    expect(screen.getByTestId('password-section')).toBeInTheDocument();
    expect(screen.getByText('common.dark')).toBeInTheDocument();
    expect(screen.getByText('languages.languageNames.ru')).toBeInTheDocument();
  });

  it('updates theme and language', () => {
    render(h(SettingsPage));

    fireEvent.change(screen.getByLabelText('common.theme'), { target: { value: 'dark' } });
    fireEvent.change(screen.getByLabelText('common.language'), { target: { value: 'ru' } });

    expect(setTheme).toHaveBeenCalledWith('dark');
    expect(setLanguage).toHaveBeenCalledWith('ru');
  });
});
