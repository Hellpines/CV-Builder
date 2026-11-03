import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useAuthStore } from './useAuthStore';
import { LOGIN_MUTATION } from '../api/AuthMutations';
import { toast } from '@/shared/lib/toast';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useLoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);

  const [authError, setAuthError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { access_token, refresh_token, user } = data.login;
      setAuth(access_token, refresh_token, user);
      toast.success(t('notifications.loginSuccess'));
      router.push('/users');
    },
    onError: (err) => {
      const msg = err.message.toLowerCase();
      if (
        msg.includes('invalid') ||
        msg.includes('credentials') ||
        msg.includes('password') ||
        msg.includes('user') ||
        msg.includes('found')
      ) {
        setAuthError(t('notifications.invalidCredentials'));
        toast.error(t('notifications.invalidCredentials'));
      } else {
        setGeneralError(t('notifications.generalError'));
        toast.error(t('notifications.generalError'));
      }
    },
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setTouchedEmail(true);
    if (authError) setAuthError(null);
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setTouchedPassword(true);
    if (authError) setAuthError(null);
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);
    setAuthError(null);
    setGeneralError(null);

    if (!email || !EMAIL_REGEX.test(email) || !password || password.length < 6) {
      return;
    }

    login({
      variables: {
        auth: { email, password },
      },
    });
  };

  const isEmailEmpty = touchedEmail && !email;
  const isEmailInvalidFormat = touchedEmail && email.length > 0 && !EMAIL_REGEX.test(email);
  const isPasswordEmpty = touchedPassword && !password;
  const isPasswordTooShort = touchedPassword && password.length > 0 && password.length < 6;

  const emailInvalid = isEmailEmpty || isEmailInvalidFormat || !!authError;
  const passwordInvalid = isPasswordEmpty || isPasswordTooShort || !!authError;

  const emailHelperText = isEmailEmpty
    ? 'Email is required'
    : isEmailInvalidFormat
      ? 'Please enter a valid email address'
      : authError
        ? authError
        : undefined;

  const passwordHelperText = isPasswordEmpty
    ? 'Password is required'
    : isPasswordTooShort
      ? 'Password must be at least 6 characters long'
      : undefined;

  const isFormValid = email.length > 0 && EMAIL_REGEX.test(email) && password.length >= 6;

  return {
    email,
    setEmail: handleEmailChange,
    password,
    setPassword: handlePasswordChange,
    handleSubmit,
    loading,
    emailInvalid,
    passwordInvalid,
    emailHelperText,
    passwordHelperText,
    generalError,
    isFormValid,
  };
}
