'use client';

import { useProfileData } from '../model/useProfileData';
import ProfileForm from './ProfileForm';

export function ProfilePage() {
  const { userData, departments, positions, isEditable, error } = useProfileData();

  if (error) {
    return <div className="text-primary pt-6">Error loading profile: {error.message}</div>;
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
