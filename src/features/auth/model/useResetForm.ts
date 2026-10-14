import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RESET_PASSWORD_MUTATION, LOGIN_MUTATION } from '../api/AuthMutations';
import { useAuthStore } from './useAuthStore';
import { parseJwt } from '../helpers/parseJwt';

export function useResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((state) => state.setAuth);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [submitted, setSubmitted] = useState(false);

  const [linkError, setLinkError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/forgot-password');
      return;
    }
    useAuthStore.setState({ accessToken: token });
  }, [token, router]);

  const [resetPassword, { loading: resetLoading }] = useMutation(RESET_PASSWORD_MUTATION, {
    onError: (err) => {
      const msg = err.message.toLowerCase();
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('token')) {
        setLinkError('This password reset link has expired');
      } else {
        setGeneralError('Something went wrong. Please try again later');
      }
    },
  });

  const [login, { loading: loginLoading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { access_token, refresh_token, user } = data.login;
      setAuth(access_token, refresh_token, user);
      router.push('/users');
    },
    onError: (err) => {
      console.error('Auto-login after reset error:', err.message);
      router.push('/login');
    },
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (linkError) setLinkError(null);
    if (generalError) setGeneralError(null);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (linkError) setLinkError(null);
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setLinkError(null);
    setGeneralError(null);

    if (!password || password.length < 6 || !confirmPassword || password !== confirmPassword) {
      return;
    }

    try {
      await resetPassword({
        variables: {
          auth: {
            newPassword: password,
            confirmPassword,
          },
        },
      });

      if (token) {
        const payload = parseJwt(token);
        const email = payload?.email;

        if (email) {
          await login({
            variables: {
              auth: { email, password },
            },
          });
          return;
        }
      }

      router.push('/login');
    } catch (err) {
      console.error('Reset flow error:', err);
    }
  };

  const loading = resetLoading || loginLoading;

  const isPasswordEmpty = submitted && !password;
  const isPasswordTooShort = submitted && password.length > 0 && password.length < 6;
  const isConfirmPasswordEmpty = submitted && !confirmPassword;
  const isPasswordMismatch =
    submitted && confirmPassword.length > 0 && password !== confirmPassword;

  const passwordInvalid = isPasswordEmpty || isPasswordTooShort;
  const confirmPasswordInvalid = isConfirmPasswordEmpty || isPasswordMismatch;

  const passwordHelperText = isPasswordEmpty
    ? 'Password is required'
    : isPasswordTooShort
      ? 'Password must be at least 6 characters long'
      : undefined;

  const confirmPasswordHelperText = isConfirmPasswordEmpty
    ? 'Confirm Password is required'
    : isPasswordMismatch
      ? 'Passwords do not match'
      : undefined;

  return {
    password,
    handlePasswordChange,
    confirmPassword,
    handleConfirmPasswordChange,
    handleSubmit,
    loading,
    passwordInvalid,
    confirmPasswordInvalid,
    passwordHelperText,
    confirmPasswordHelperText,
    linkError,
    generalError,
  };
}
