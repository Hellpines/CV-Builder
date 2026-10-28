import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { toast } from '@/shared/lib/toast';
import { CHANGE_PASSWORD_MUTATION } from '../api/SettingsMutations';

export const PASSWORD_MIN_LENGTH = 6;

type Field = 'current' | 'next' | 'confirm';

const EMPTY_VALUES: Record<Field, string> = { current: '', next: '', confirm: '' };
const UNTOUCHED: Record<Field, boolean> = { current: false, next: false, confirm: false };

const CURRENT_PASSWORD_HINTS = [
  'incorrect',
  'wrong',
  'invalid',
  'old password',
  'oldpassword',
  'current password',
];
const MISMATCH_HINTS = ['match'];

export function usePasswordForm() {
  const { t } = useTranslation();
  const [changePassword, { loading }] = useMutation(CHANGE_PASSWORD_MUTATION);

  const [values, setValues] = useState<Record<Field, string>>(EMPTY_VALUES);
  const [touched, setTouched] = useState<Record<Field, boolean>>(UNTOUCHED);
  const [serverErrors, setServerErrors] = useState<Partial<Record<Field, string>>>({});

  const errors: Record<Field, string | undefined> = {
    current: values.current ? undefined : t('settings.password.validation.required'),
    next: !values.next
      ? t('settings.password.validation.newRequired')
      : values.next.length < PASSWORD_MIN_LENGTH
        ? t('settings.password.validation.tooShort', { min: PASSWORD_MIN_LENGTH })
        : undefined,
    confirm: !values.confirm
      ? t('settings.password.validation.confirmRequired')
      : values.confirm !== values.next
        ? t('settings.password.validation.mismatch')
        : undefined,
  };

  const visibleErrors: Record<Field, string | undefined> = {
    current: serverErrors.current ?? (touched.current ? errors.current : undefined),
    next: serverErrors.next ?? (touched.next ? errors.next : undefined),
    confirm: serverErrors.confirm ?? (touched.confirm ? errors.confirm : undefined),
  };

  const isValid = !errors.current && !errors.next && !errors.confirm;
  const canSubmit = isValid && !loading;

  const setField = (field: Field, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
    setServerErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    setServerErrors({});
    try {
      await changePassword({
        variables: {
          args: {
            oldPassword: values.current,
            newPassword: values.next,
            confirmPassword: values.confirm,
          },
        },
      });

      setValues(EMPTY_VALUES);
      setTouched(UNTOUCHED);
      toast.success(t('settings.password.messages.success'));
    } catch (err) {
      const message = (err instanceof Error ? err.message : '').toLowerCase();

      if (CURRENT_PASSWORD_HINTS.some((hint) => message.includes(hint))) {
        setServerErrors({ current: t('settings.password.validation.incorrect') });
      } else if (MISMATCH_HINTS.some((hint) => message.includes(hint))) {
        setServerErrors({ confirm: t('settings.password.validation.mismatch') });
      } else {
        toast.error(t('settings.password.messages.failed'));
      }
    }
  };

  return { values, errors: visibleErrors, setField, handleSubmit, canSubmit };
}
