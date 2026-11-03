import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useVerifyForm } = vi.hoisted(() => ({
  useVerifyForm: vi.fn(),
}));

vi.mock('../models/useVerifyForm', () => ({ useVerifyForm }));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: () => h('nav', { 'data-testid': 'auth-tabs' }),
}));

import { VerifyForm } from './VerifyForm';

function mockForm(overrides: Record<string, unknown> = {}) {
  return {
    code: ['', '', '', '', '', ''],
    inputRefs: { current: [] as (HTMLInputElement | null)[] },
    handleChange: vi.fn(),
    handleKeyDown: vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    handleLater: vi.fn(),
    loading: false,
    hasError: false,
    helperText: null,
    ...overrides,
  };
}

describe('VerifyForm', () => {
  beforeEach(() => {
    useVerifyForm.mockReset();
  });

  it('renders six code inputs and disables empty submit', () => {
    const refs = { current: [] as (HTMLInputElement | null)[] };
    useVerifyForm.mockReturnValue(mockForm({ inputRefs: refs }));
    render(h(VerifyForm));

    expect(screen.getByRole('heading', { name: 'auth.emailVerification' })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'AUTH.CONFIRM' })).toBeDisabled();
    expect(screen.queryByTestId('auth-tabs')).not.toBeInTheDocument();
  });

  it('shows helper text and error styling', () => {
    useVerifyForm.mockReturnValue(
      mockForm({
        code: ['1', '2', '3', '4', '5', '6'],
        hasError: true,
        helperText: 'Invalid code',
        inputRefs: { current: [] },
      })
    );
    render(h(VerifyForm));

    expect(screen.getByText('Invalid code')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[0].className).toContain('border-border-error');
  });

  it('enables submit when code filled and wires later/change/keydown', () => {
    const handleChange = vi.fn();
    const handleKeyDown = vi.fn();
    const handleLater = vi.fn();
    const handleSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());

    useVerifyForm.mockReturnValue(
      mockForm({
        code: ['1', '2', '3', '4', '5', '6'],
        handleChange,
        handleKeyDown,
        handleLater,
        handleSubmit,
        inputRefs: { current: [] },
      })
    );
    render(h(VerifyForm));

    const first = screen.getAllByRole('textbox')[0];
    fireEvent.change(first, { target: { value: '9' } });
    fireEvent.keyDown(first, { key: 'Backspace' });
    fireEvent.click(screen.getByRole('button', { name: 'AUTH.LATER' }));
    fireEvent.submit(screen.getByRole('button', { name: 'AUTH.CONFIRM' }).closest('form')!);

    expect(handleChange).toHaveBeenCalled();
    expect(handleKeyDown).toHaveBeenCalled();
    expect(handleLater).toHaveBeenCalled();
    expect(handleSubmit).toHaveBeenCalled();
  });

  it('shows confirming label while loading', () => {
    useVerifyForm.mockReturnValue(
      mockForm({
        code: ['1', '2', '3', '4', '5', '6'],
        loading: true,
        inputRefs: { current: [] },
      })
    );
    render(h(VerifyForm));
    expect(screen.getByRole('button', { name: 'auth.confirming' })).toBeDisabled();
  });
});
