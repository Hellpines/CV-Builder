import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from './useAuthStore';
import { SIGNUP_MUTATION } from '../api/AuthMutations';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useRegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [touchedEmail, setTouchedEmail] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirmPassword, setTouchedConfirmPassword] = useState(false);

  const [serverError, setServerError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      const { access_token, refresh_token, user } = data.signup;
      setAuth(access_token, refresh_token, user);
      router.push('/verify-email');
    },
    onError: (err) => {
      const msg = err.message.toLowerCase();
      if (msg.includes('exist') || msg.includes('already') || msg.includes('duplicate')) {
        setServerError('An account with this email already exists');
        setGeneralError(null);
      } else {
        setGeneralError('Something went wrong. Please try again later');
        setServerError(null);
      }
    },
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setTouchedEmail(true);
    if (serverError) setServerError(null);
    if (generalError) setGeneralError(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setTouchedPassword(true);
    if (generalError) setGeneralError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setTouchedConfirmPassword(true);
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouchedEmail(true);
    setTouchedPassword(true);
    setTouchedConfirmPassword(true);
    setServerError(null);
    setGeneralError(null);

    if (
      !email ||
      !EMAIL_REGEX.test(email) ||
      !password ||
      password.length < 6 ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      return;
    }

    signup({
      variables: {
        auth: { email, password, confirmPassword },
      },
    });
  };

  const isEmailEmpty = touchedEmail && !email;
  const isEmailInvalidFormat = touchedEmail && email.length > 0 && !EMAIL_REGEX.test(email);
  const isPasswordEmpty = touchedPassword && !password;
  const isPasswordTooShort = touchedPassword && password.length > 0 && password.length < 6;
  const isConfirmPasswordEmpty = touchedConfirmPassword && !confirmPassword;
  const isPasswordMismatch =
    touchedConfirmPassword && confirmPassword.length > 0 && password !== confirmPassword;

  const emailInvalid = isEmailEmpty || isEmailInvalidFormat || !!serverError;
  const passwordInvalid = isPasswordEmpty || isPasswordTooShort;
  const confirmPasswordInvalid = isConfirmPasswordEmpty || isPasswordMismatch;

  const emailHelperText = isEmailEmpty
    ? 'Email is required'
    : isEmailInvalidFormat
      ? 'Please enter a valid email address'
      : serverError
        ? serverError
        : undefined;

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

  const isFormValid =
    email.length > 0 &&
    EMAIL_REGEX.test(email) &&
    password.length >= 6 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  return {
    email,
    setEmail: handleEmailChange,
    password,
    setPassword: handlePasswordChange,
    confirmPassword,
    setConfirmPassword: handleConfirmPasswordChange,
    handleSubmit,
    loading,
    emailInvalid,
    passwordInvalid,
    confirmPasswordInvalid,
    emailHelperText,
    passwordHelperText,
    confirmPasswordHelperText,
    generalError,
    isFormValid,
  };
}
