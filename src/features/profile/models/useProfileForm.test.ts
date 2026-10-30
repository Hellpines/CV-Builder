import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@/shared/types/user';

const {
  useMutation,
  toast,
  updateProfile,
  updateUser,
  uploadAvatar,
  deleteAvatar,
  updateAuthUser,
  authGetState,
} = vi.hoisted(() => {
  const updateAuthUser = vi.fn();
  const authGetState = vi.fn(() => ({
    user: { id: 'u1', profile: { first_name: 'Old', last_name: 'Name' } },
    updateUser: updateAuthUser,
  }));

  return {
    useMutation: vi.fn(),
    toast: {
      success: vi.fn(),
      error: vi.fn(),
    },
    updateProfile: vi.fn(),
    updateUser: vi.fn(),
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
    updateAuthUser,
    authGetState,
  };
});

vi.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => useMutation(...args),
}));

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('@/shared/lib/toast', () => ({ toast }));

vi.mock('@/features/auth/models/useAuthStore', () => ({
  useAuthStore: {
    getState: (...args: unknown[]) => authGetState(...args),
  },
}));

import { useProfileForm } from './useProfileForm';

const baseUser = {
  id: 'u1',
  created_at: '2024-01-01',
  email: 'a@b.c',
  is_verified: true,
  role: 'Employee' as const,
  department: { id: 'd1', created_at: '2024-01-01', name: 'Eng' },
  position: { id: 'p1', created_at: '2024-01-01', name: 'Dev' },
  cvs: null,
  profile: {
    id: 'pr1',
    created_at: '2024-01-01',
    first_name: 'Ada',
    last_name: 'Lovelace',
    full_name: 'Ada Lovelace',
    avatar: 'https://cdn/avatar.png',
    skills: [],
    languages: [],
    email: 'a@b.c',
    is_verified: true,
    role: 'Employee' as const,
  },
} satisfies User;

function makeFile(overrides: Partial<File> & { name?: string; type?: string; size?: number } = {}) {
  const { name = 'avatar.png', type = 'image/png', size = 100 } = overrides;
  const file = new File(['x'.repeat(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('useProfileForm', () => {
  const createObjectURL = vi.fn(() => 'blob:preview');
  const revokeObjectURL = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    authGetState.mockReturnValue({
      user: { id: 'u1', profile: { first_name: 'Old', last_name: 'Name' } },
      updateUser: updateAuthUser,
    });

    const mutations = [
      [updateProfile, { loading: false }],
      [updateUser, { loading: false }],
      [uploadAvatar, { loading: false }],
      [deleteAvatar, { loading: false }],
    ];
    let index = 0;
    useMutation.mockImplementation(() => mutations[index++ % mutations.length]);

    updateProfile.mockResolvedValue({
      data: { updateProfile: { first_name: 'Ada', last_name: 'Byron' } },
    });
    updateUser.mockResolvedValue({});
    uploadAvatar.mockResolvedValue({});
    deleteAvatar.mockResolvedValue({});

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });

    class MockFileReader {
      result: string | null = null;
      onload: ((ev: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((ev: ProgressEvent<FileReader>) => void) | null = null;
      error: DOMException | null = null;

      readAsDataURL() {
        this.result = 'data:image/png;base64,abc';
        this.onload?.({} as ProgressEvent<FileReader>);
      }
    }
    vi.stubGlobal('FileReader', MockFileReader);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('seeds form fields from userData', () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    expect(result.current.firstName).toBe('Ada');
    expect(result.current.lastName).toBe('Lovelace');
    expect(result.current.departmentId).toBe('d1');
    expect(result.current.positionId).toBe('p1');
  });

  it('falls back to empty strings without userData', () => {
    const { result } = renderHook(() => useProfileForm(undefined, true));

    expect(result.current.firstName).toBe('');
    expect(result.current.lastName).toBe('');
    expect(result.current.departmentId).toBe('');
    expect(result.current.positionId).toBe('');
  });

  it('updates editable fields through setters', () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.setFirstName('Grace');
      result.current.setLastName('Hopper');
      result.current.setDepartmentId('d2');
      result.current.setPositionId('p2');
    });

    expect(result.current.firstName).toBe('Grace');
    expect(result.current.lastName).toBe('Hopper');
    expect(result.current.departmentId).toBe('d2');
    expect(result.current.positionId).toBe('p2');
  });

  it('rejects invalid avatar type and oversized files', () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.selectAvatar(makeFile({ type: 'image/webp', name: 'a.webp' }));
    });
    expect(result.current.avatarError).toBe('common.invalidAvatarType');

    act(() => {
      result.current.selectAvatar(
        makeFile({ type: 'image/png', size: 5 * 1024 * 1024 + 1, name: 'big.png' })
      );
    });
    expect(result.current.avatarError).toBe('common.invalidAvatarSize');
  });

  it('selects a valid avatar and creates a preview URL', () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));
    const file = makeFile();

    act(() => {
      result.current.selectAvatar(file);
    });

    expect(createObjectURL).toHaveBeenCalledWith(file);
    expect(result.current.avatarPreview).toBe('blob:preview');
    expect(result.current.avatarError).toBe('');
    expect(result.current.avatarRemoved).toBe(false);
  });

  it('removeAvatar clears preview and marks removed when profile has avatar', () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.selectAvatar(makeFile());
      result.current.removeAvatar();
    });

    expect(revokeObjectURL).toHaveBeenCalled();
    expect(result.current.avatarPreview).toBeNull();
    expect(result.current.avatarRemoved).toBe(true);
  });

  it('no-ops handleSave when not editable or without userData', async () => {
    const { result: noUser } = renderHook(() => useProfileForm(undefined, true));
    await act(async () => {
      await noUser.current.handleSave();
    });
    expect(updateProfile).not.toHaveBeenCalled();

    const { result: locked } = renderHook(() => useProfileForm(baseUser, false));
    await act(async () => {
      await locked.current.handleSave();
    });
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('saves profile and user, syncs auth store, and toasts success', async () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.setFirstName('Ada');
      result.current.setLastName('Byron');
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(updateProfile).toHaveBeenCalledWith({
      variables: {
        profile: {
          userId: 'u1',
          first_name: 'Ada',
          last_name: 'Byron',
        },
      },
    });
    expect(updateUser).toHaveBeenCalledWith({
      variables: {
        user: {
          userId: 'u1',
          departmentId: 'd1',
          positionId: 'p1',
          role: 'Employee',
        },
      },
    });
    expect(updateAuthUser).toHaveBeenCalledWith({
      profile: { first_name: 'Ada', last_name: 'Byron' },
    });
    expect(toast.success).toHaveBeenCalledWith('notifications.profileUpdated');
  });

  it('uploads avatar before profile update when a file is selected', async () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.selectAvatar(makeFile({ size: 12, type: 'image/jpeg', name: 'a.jpg' }));
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(uploadAvatar).toHaveBeenCalledWith({
      variables: {
        avatar: {
          userId: 'u1',
          base64: 'data:image/png;base64,abc',
          size: 12,
          type: 'image/jpeg',
        },
      },
    });
    expect(deleteAvatar).not.toHaveBeenCalled();
  });

  it('deletes avatar when marked removed and no new file is selected', async () => {
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.removeAvatar();
    });

    await act(async () => {
      await result.current.handleSave();
    });

    expect(deleteAvatar).toHaveBeenCalledWith({
      variables: { avatar: { userId: 'u1' } },
    });
    expect(uploadAvatar).not.toHaveBeenCalled();
  });

  it('skips updateUser when department or position cannot be resolved', async () => {
    const userWithoutDept = {
      ...baseUser,
      department: null,
      position: null,
    };

    const { result } = renderHook(() => useProfileForm(userWithoutDept, true));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(updateProfile).toHaveBeenCalled();
    expect(updateUser).not.toHaveBeenCalled();
  });

  it('does not sync auth store when auth user id differs', async () => {
    authGetState.mockReturnValue({
      user: { id: 'other', profile: { first_name: 'X' } },
      updateUser: updateAuthUser,
    });

    const { result } = renderHook(() => useProfileForm(baseUser, true));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(updateAuthUser).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('toasts Error.message on save failure', async () => {
    updateProfile.mockRejectedValue(new Error('save failed'));
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith('save failed');
  });

  it('falls back to generic error toast when rejection is not an Error', async () => {
    updateProfile.mockRejectedValue('boom');
    const { result } = renderHook(() => useProfileForm(baseUser, true));

    await act(async () => {
      await result.current.handleSave();
    });

    expect(toast.error).toHaveBeenCalledWith('errors.somethingWentWrong');
  });

  it('revokes preview URL on unmount', () => {
    const { result, unmount } = renderHook(() => useProfileForm(baseUser, true));

    act(() => {
      result.current.selectAvatar(makeFile());
    });

    unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');
  });

  it('combines mutation loading flags', () => {
    useMutation.mockReset();
    useMutation
      .mockReturnValueOnce([updateProfile, { loading: true }])
      .mockReturnValueOnce([updateUser, { loading: false }])
      .mockReturnValueOnce([uploadAvatar, { loading: false }])
      .mockReturnValueOnce([deleteAvatar, { loading: false }]);

    const { result } = renderHook(() => useProfileForm(baseUser, true));
    expect(result.current.loading).toBe(true);
  });
});
