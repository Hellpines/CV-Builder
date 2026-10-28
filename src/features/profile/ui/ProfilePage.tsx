'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import { useProfileData } from '../model/useProfileData';
import ProfileForm from './ProfileForm';

export function ProfilePage() {
  const { t } = useTranslation();
  const { userData, departments, positions, isEditable, error } = useProfileData();

  if (error) {
    return (
      <div className="text-primary pt-6">
        {t('errors.loadProfile')}: {error.message}
      </div>
    );
  }

  return (
    <ProfileForm
      key={userData?.id}
      userData={userData}
      departments={departments}
      positions={positions}
      isEditable={isEditable}
    />
  );
}
