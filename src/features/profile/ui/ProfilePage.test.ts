import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { useProfileData } = vi.hoisted(() => ({
  useProfileData: vi.fn(),
}));

vi.mock('../models/useProfileData', () => ({ useProfileData }));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('./ProfileForm', () => ({
  default: ({ userData, isEditable }: { userData?: { id: string }; isEditable: boolean }) =>
    h('div', {
      'data-testid': 'profile-form',
      'data-user': userData?.id ?? '',
      'data-editable': String(isEditable),
    }),
}));

import { ProfilePage } from './ProfilePage';

describe('ProfilePage', () => {
  beforeEach(() => useProfileData.mockReset());

  it('shows error message', () => {
    useProfileData.mockReturnValue({
      userData: undefined,
      departments: [],
      positions: [],
      isEditable: false,
      error: new Error('boom'),
    });
    render(h(ProfilePage));
    expect(screen.getByText(/errors.loadProfile/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it('renders profile form on success', () => {
    useProfileData.mockReturnValue({
      userData: { id: 'u1' },
      departments: [],
      positions: [],
      isEditable: true,
      error: undefined,
    });
    render(h(ProfilePage));
    expect(screen.getByTestId('profile-form')).toHaveAttribute('data-user', 'u1');
    expect(screen.getByTestId('profile-form')).toHaveAttribute('data-editable', 'true');
  });
});
