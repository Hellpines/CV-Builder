'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileForm } from '../model/useProfileForm';
import { User } from '@/shared/types/user';
import { FormSelect, Option } from './FormSelect';
import { AvatarUpload } from './AvatarUpload';

interface ProfileFormProps {
  userData?: User;
  departments: Option[];
  positions: Option[];
  isEditable: boolean;
}

export default function ProfileForm({
  userData,
  departments,
  positions,
  isEditable,
}: ProfileFormProps) {
  const router = useRouter();
  const {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    departmentId,
    setDepartmentId,
    positionId,
    setPositionId,
    handleSave,
    loading,
    avatarPreview,
    avatarError,
    selectAvatar,
  } = useProfileForm(userData, isEditable);
  const [submitted, setSubmitted] = useState(false);

  const departmentInvalid = submitted && !departmentId;
  const positionInvalid = submitted && !positionId;

  const onUpdate = () => {
    setSubmitted(true);
    if (!departmentId || !positionId) return;
    handleSave();
  };

  if (!userData) {
    return null;
  }

  const profile = userData?.profile;
  const profileFirstName = profile?.first_name || '';
  const profileLastName = profile?.last_name || '';
  const initials = `${profileFirstName[0] || ''}${profileLastName[0] || ''}`.toUpperCase() || 'U';
  const avatar = profile?.avatar;

  const showVerifyButton = isEditable && userData.is_verified === false;

  return (
    <div className="relative flex w-full flex-col items-start justify-center pt-6 pb-20">
      <div className="mb-15 flex w-full flex-col items-center justify-center gap-8 text-center">
        <AvatarUpload
          src={avatar}
          preview={avatarPreview}
          initials={initials}
          alt={`${profileFirstName} ${profileLastName}`}
          editable={isEditable}
          error={avatarError}
          onSelect={selectAvatar}
        />

        <div className="flex flex-col">
          <h1 className="text-primary-bold mb-2 text-xl">
            {profileFirstName} {profileLastName}
          </h1>
          <p className="text-primary-foreground mb-0.5 text-sm">{userData?.email}</p>
          {userData?.created_at && (
            <p className="text-m text-primary-bold">
              A member since{' '}
              {new Date(Number(userData.created_at) || userData.created_at).toDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-212.5 grid-cols-2 gap-6">
        <Input
          type="text"
          placeholder="First Name"
          value={firstName}
          disabled={!isEditable}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <Input
          type="text"
          placeholder="Last Name"
          value={lastName}
          disabled={!isEditable}
          onChange={(e) => setLastName(e.target.value)}
        />

        <FormSelect
          label="Department"
          placeholder="Select department"
          options={departments}
          value={departmentId}
          onChange={setDepartmentId}
          disabled={!isEditable}
          invalid={departmentInvalid}
          errorText="Department is required"
        />

        <FormSelect
          label="Position"
          placeholder="Select position"
          options={positions}
          value={positionId}
          onChange={setPositionId}
          disabled={!isEditable}
          invalid={positionInvalid}
          errorText="Position is required"
        />
      </div>

      {isEditable && (
        <div className="mx-auto mt-9 flex w-full max-w-212.5 items-center justify-end gap-6">
          {showVerifyButton && (
            <Button variant="secondary" onClick={() => router.push('/verify-email')}>
              VERIFY EMAIL
            </Button>
          )}
          <Button variant="primary" onClick={onUpdate} disabled={loading}>
            {loading ? 'Saving...' : 'Update'}
          </Button>
        </div>
      )}
    </div>
  );
}
