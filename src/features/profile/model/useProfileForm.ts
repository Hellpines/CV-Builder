import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import {
  UPDATE_PROFILE_MUTATION,
  UPDATE_USER_MUTATION,
  UPLOAD_AVATAR_MUTATION,
  DELETE_AVATAR_MUTATION,
} from '../api/ProfileMutations';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { User } from '@/shared/types/user';
import { toast } from '@/shared/lib/toast';

const ALLOWED_AVATAR_TYPES = ['image/png', 'image/jpeg', 'image/gif'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

interface FormEdits {
  firstName?: string;
  lastName?: string;
  departmentId?: string;
  positionId?: string;
}

export function useProfileForm(userData: User | undefined, isEditable: boolean) {
  const { t } = useTranslation();
  const [edits, setEdits] = useState<FormEdits>({});

  const firstName = edits.firstName ?? userData?.profile?.first_name ?? '';
  const lastName = edits.lastName ?? userData?.profile?.last_name ?? '';
  const departmentId = edits.departmentId ?? userData?.department?.id ?? '';
  const positionId = edits.positionId ?? userData?.position?.id ?? '';

  const setFirstName = (value: string) => setEdits((prev) => ({ ...prev, firstName: value }));
  const setLastName = (value: string) => setEdits((prev) => ({ ...prev, lastName: value }));
  const setDepartmentId = (value: string) => setEdits((prev) => ({ ...prev, departmentId: value }));
  const setPositionId = (value: string) => setEdits((prev) => ({ ...prev, positionId: value }));

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState('');
  const [avatarRemoved, setAvatarRemoved] = useState(false);

  const previewUrlRef = useRef<string | null>(null);

  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_PROFILE_MUTATION);
  const [updateUser, { loading: updatingUser }] = useMutation(UPDATE_USER_MUTATION);
  const [uploadAvatar, { loading: uploadingAvatar }] = useMutation(UPLOAD_AVATAR_MUTATION);
  const [deleteAvatar, { loading: deletingAvatar }] = useMutation(DELETE_AVATAR_MUTATION);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const clearAvatar = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const removeAvatar = () => {
    clearAvatar();
    if (userData?.profile?.avatar) setAvatarRemoved(true);
  };

  const selectAvatar = (file: File) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError(t('common.invalidAvatarType'));
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError(t('common.invalidAvatarSize'));
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;

    setAvatarError('');
    setAvatarRemoved(false);
    setAvatarFile(file);
    setAvatarPreview(url);
  };

  const handleSave = async () => {
    if (!userData || !isEditable) return;

    try {
      if (avatarFile) {
        await uploadAvatar({
          variables: {
            avatar: {
              userId: userData.id,
              base64: await fileToBase64(avatarFile),
              size: avatarFile.size,
              type: avatarFile.type,
            },
          },
        });
      } else if (avatarRemoved) {
        await deleteAvatar({
          variables: {
            avatar: {
              userId: userData.id,
            },
          },
        });
      }

      const { data: profileData } = await updateProfile({
        variables: {
          profile: {
            userId: userData.id,
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      const targetDepartmentId = departmentId || userData.department?.id;
      const targetPositionId = positionId || userData.position?.id;

      if (targetDepartmentId && targetPositionId) {
        await updateUser({
          variables: {
            user: {
              userId: userData.id,
              departmentId: targetDepartmentId,
              positionId: targetPositionId,
              role: userData.role,
            },
          },
        });
      }

      const { user: authUser, updateUser: updateAuthUser } = useAuthStore.getState();
      const updatedProfile = profileData?.updateProfile;

      if (authUser && authUser.id === userData.id && updatedProfile) {
        updateAuthUser({
          profile: { ...authUser.profile, ...updatedProfile },
        });
      }

      clearAvatar();
      setAvatarRemoved(false);
      toast.success(t('notifications.profileUpdated'));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('errors.somethingWentWrong');
      console.error('Error updating profile:', err);
      toast.error(errorMessage);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    departmentId,
    setDepartmentId,
    positionId,
    setPositionId,
    avatarPreview,
    avatarError,
    selectAvatar,
    handleSave,
    avatarRemoved,
    removeAvatar,
    loading: updatingProfile || updatingUser || uploadingAvatar || deletingAvatar,
  };
}
