import { createElement as h } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const { useProfileForm, handleVerifyEmail, useAuthStore } = vi.hoisted(() => ({
  useProfileForm: vi.fn(),
  handleVerifyEmail: vi.fn(),
  useAuthStore: vi.fn(),
}));

vi.mock('../models/useProfileForm', () => ({ useProfileForm }));
vi.mock('../models/useVerifyEmail', () => ({
  useVerifyEmail: () => ({ handleVerifyEmail, sendingCode: false }),
}));
vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: (selector: (s: { user?: { is_verified?: boolean } }) => unknown) =>
    selector(useAuthStore()),
}));
vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { date?: string }) => (opts?.date ? `${key}:${opts.date}` : key),
  }),
}));
vi.mock('@/components/ui/input', () => ({
  Input: ({
    helperText,
    invalid,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    helperText?: string;
    invalid?: boolean;
  }) =>
    h(
      'div',
      null,
      h('input', { 'aria-invalid': invalid || undefined, ...props }),
      helperText ? h('p', null, helperText) : null
    ),
}));
vi.mock('./FormSelect', () => ({
  FormSelect: ({
    label,
    value,
    onChange,
    invalid,
    errorText,
    disabled,
  }: {
    label: string;
    value?: string | null;
    onChange: (v: string) => void;
    invalid?: boolean;
    errorText?: string;
    disabled?: boolean;
  }) =>
    h(
      'div',
      null,
      h('label', null, label),
      h(
        'button',
        {
          type: 'button',
          disabled,
          onClick: () => onChange('d2'),
        },
        `select-${label}`
      ),
      invalid && errorText ? h('p', null, errorText) : null,
      h('span', null, value ?? '')
    ),
}));
vi.mock('./AvatarUpload', () => ({
  AvatarUpload: ({
    editable,
    onSelect,
    onRemove,
    error,
  }: {
    editable: boolean;
    onSelect: (f: File) => void;
    onRemove: () => void;
    error?: string;
  }) =>
    h(
      'div',
      { 'data-testid': 'avatar', 'data-editable': String(editable) },
      error ? h('p', null, error) : null,
      h('button', { type: 'button', onClick: () => onSelect(new File([], 'a.png')) }, 'pick'),
      h('button', { type: 'button', onClick: onRemove }, 'remove')
    ),
}));

import ProfileForm from './ProfileForm';

const user = {
  id: 'u1',
  created_at: '1704067200000',
  email: 'a@b.com',
  is_verified: false,
  profile: { first_name: 'Ann', last_name: 'Bee', avatar: null },
  role: 'Employee',
  department: { id: 'd1', name: 'Eng' },
  position: { id: 'p1', name: 'Dev' },
  cvs: null,
} as unknown as User;

function mockForm(overrides: Record<string, unknown> = {}) {
  return {
    firstName: 'Ann',
    setFirstName: vi.fn(),
    lastName: 'Bee',
    setLastName: vi.fn(),
    departmentId: 'd1',
    setDepartmentId: vi.fn(),
    positionId: 'p1',
    setPositionId: vi.fn(),
    handleSave: vi.fn(),
    loading: false,
    avatarPreview: null,
    avatarError: undefined,
    selectAvatar: vi.fn(),
    avatarRemoved: false,
    removeAvatar: vi.fn(),
    ...overrides,
  };
}

describe('ProfileForm', () => {
  beforeEach(() => {
    useProfileForm.mockReset();
    handleVerifyEmail.mockReset();
    useAuthStore.mockReturnValue({ user: { is_verified: false } });
  });

  it('returns null without userData', () => {
    useProfileForm.mockReturnValue(mockForm());
    const { container } = render(
      h(ProfileForm, {
        departments: [],
        positions: [],
        isEditable: true,
      })
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders editable form, validation, verify, and save', () => {
    const handleSave = vi.fn();
    const setFirstName = vi.fn();
    const selectAvatar = vi.fn();
    const removeAvatar = vi.fn();
    const setDepartmentId = vi.fn();

    useProfileForm.mockReturnValue(
      mockForm({
        firstName: '',
        lastName: '',
        departmentId: '',
        positionId: '',
        handleSave,
        setFirstName,
        selectAvatar,
        removeAvatar,
        setDepartmentId,
        avatarError: 'bad',
      })
    );

    render(
      h(ProfileForm, {
        userData: user,
        departments: [{ id: 'd1', name: 'Eng' }],
        positions: [{ id: 'p1', name: 'Dev' }],
        isEditable: true,
      })
    );

    expect(screen.getByText('Ann Bee')).toBeInTheDocument();
    expect(screen.getByText(/common.memberSince:/)).toBeInTheDocument();
    expect(screen.getByText('bad')).toBeInTheDocument();
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-editable', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'common.update' }));
    expect(screen.getByText('validation.firstNameRequired')).toBeInTheDocument();
    expect(screen.getByText('validation.departmentRequired')).toBeInTheDocument();
    expect(handleSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'common.verifyEmail' }));
    expect(handleVerifyEmail).toHaveBeenCalled();

    fireEvent.click(screen.getByText('pick'));
    fireEvent.click(screen.getByText('remove'));
    expect(selectAvatar).toHaveBeenCalled();
    expect(removeAvatar).toHaveBeenCalled();
  });

  it('updates first/last name and marks fields touched', () => {
    const setFirstName = vi.fn();
    const setLastName = vi.fn();

    useProfileForm.mockReturnValue(
      mockForm({
        firstName: '',
        lastName: '',
        setFirstName,
        setLastName,
      })
    );

    render(
      h(ProfileForm, {
        userData: user,
        departments: [],
        positions: [],
        isEditable: true,
      })
    );

    const [firstNameInput, lastNameInput] = screen.getAllByRole('textbox');

    fireEvent.change(firstNameInput, { target: { value: 'Ada' } });
    expect(setFirstName).toHaveBeenCalledWith('Ada');

    fireEvent.change(lastNameInput, { target: { value: 'Lovelace' } });
    expect(setLastName).toHaveBeenCalledWith('Lovelace');

    expect(screen.getByText('validation.firstNameRequired')).toBeInTheDocument();
    expect(screen.getByText('validation.lastNameRequired')).toBeInTheDocument();
  });

  it('saves when valid and hides actions when read-only', () => {
    const handleSave = vi.fn();
    useProfileForm.mockReturnValue(mockForm({ handleSave, loading: true }));
    useAuthStore.mockReturnValue({ user: { is_verified: true } });

    const { rerender } = render(
      h(ProfileForm, {
        userData: { ...user, is_verified: true } as User,
        departments: [],
        positions: [],
        isEditable: true,
      })
    );

    expect(screen.getByRole('button', { name: 'common.saving' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'common.verifyEmail' })).not.toBeInTheDocument();

    useProfileForm.mockReturnValue(mockForm({ handleSave }));
    rerender(
      h(ProfileForm, {
        userData: user,
        departments: [],
        positions: [],
        isEditable: true,
      })
    );
    fireEvent.click(screen.getByRole('button', { name: 'common.update' }));
    expect(handleSave).toHaveBeenCalled();

    useProfileForm.mockReturnValue(mockForm());
    rerender(
      h(ProfileForm, {
        userData: user,
        departments: [],
        positions: [],
        isEditable: false,
      })
    );
    expect(screen.queryByRole('button', { name: 'common.update' })).not.toBeInTheDocument();
  });
});
