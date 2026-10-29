'use client';

import { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfileForm } from '../model/useProfileForm';
import { User } from '@/shared/types/user';
import { FormSelect, Option } from './FormSelect';
import { AvatarUpload } from './AvatarUpload';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { useVerifyEmail } from '../model/useVerifyEmail';

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
  const { t } = useTranslation();
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
    avatarRemoved,
    removeAvatar,
  } = useProfileForm(userData, isEditable);

  const { handleVerifyEmail, sendingCode } = useVerifyEmail(userData?.email);
  const authIsVerified = useAuthStore((state) => state.user?.is_verified);
  const [submitted, setSubmitted] = useState(false);
  const [touched, setTouched] = useState({ firstName: false, lastName: false });

  const firstNameInvalid = (submitted || touched.firstName) && !firstName.trim();
  const lastNameInvalid = (submitted || touched.lastName) && !lastName.trim();
  const departmentInvalid = submitted && !departmentId;
  const positionInvalid = submitted && !positionId;

  const onUpdate = () => {
    setSubmitted(true);
    if (!firstName.trim() || !lastName.trim() || !departmentId || !positionId) return;
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

  const createdAtValue = Number(userData.created_at);
  const formattedCreatedAt = Number.isFinite(createdAtValue)
    ? new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(createdAtValue))
    : null;

  const isVerified = isEditable ? authIsVerified : userData.is_verified;
  const showVerifyButton = isEditable && isVerified === false;

  return (
    <div className="relative flex w-full flex-col items-start justify-center pt-6 pb-20">
      <div className="mb-15 flex w-full flex-col items-center justify-center gap-8 text-center">
        <AvatarUpload
          src={avatarRemoved ? null : avatar}
          preview={avatarPreview}
          initials={initials}
          alt={`${profileFirstName} ${profileLastName}`}
          editable={isEditable}
          error={avatarError}
          onSelect={selectAvatar}
          onRemove={removeAvatar}
        />

        <div className="flex flex-col">
          <h1 className="text-foreground mb-2 text-xl">
            {profileFirstName} {profileLastName}
          </h1>
          <p className="text-primary-foreground mb-0.5 text-sm">{userData?.email}</p>
          {formattedCreatedAt && (
            <p className="text-m text-foreground">
              {t('common.memberSince', { date: formattedCreatedAt })}
            </p>
          )}
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-212.5 grid-cols-2 gap-6">
        <Input
          type="text"
          placeholder={t('common.firstName')}
          value={firstName}
          disabled={!isEditable}
          invalid={firstNameInvalid}
          helperText={firstNameInvalid ? t('validation.firstNameRequired') : undefined}
          onChange={(e) => {
            setFirstName(e.target.value);
            setTouched((prev) => ({ ...prev, firstName: true }));
          }}
        />

        <Input
          type="text"
          placeholder={t('common.lastName')}
          value={lastName}
          disabled={!isEditable}
          invalid={lastNameInvalid}
          helperText={lastNameInvalid ? t('validation.lastNameRequired') : undefined}
          onChange={(e) => {
            setLastName(e.target.value);
            setTouched((prev) => ({ ...prev, lastName: true }));
          }}
        />

        <FormSelect
          label={t('common.department')}
          placeholder={t('common.selectDepartment')}
          options={departments}
          value={departmentId}
          onChange={setDepartmentId}
          disabled={!isEditable}
          invalid={departmentInvalid}
          errorText={t('validation.departmentRequired')}
        />

        <FormSelect
          label={t('common.position')}
          placeholder={t('common.selectPosition')}
          options={positions}
          value={positionId}
          onChange={setPositionId}
          disabled={!isEditable}
          invalid={positionInvalid}
          errorText={t('validation.positionRequired')}
        />
      </div>

      {isEditable && (
        <div className="mx-auto mt-9 flex w-full max-w-212.5 items-center justify-end gap-6">
          {showVerifyButton && (
            <Button
              variant="secondary"
              onClick={handleVerifyEmail}
              disabled={sendingCode || loading}
            >
              {sendingCode ? t('common.sending') : t('common.verifyEmail')}
            </Button>
          )}
          <Button variant="primary" onClick={onUpdate} disabled={loading}>
            {loading ? t('common.saving') : t('common.update')}
          </Button>
        </div>
      )}
    </div>
  );
}
