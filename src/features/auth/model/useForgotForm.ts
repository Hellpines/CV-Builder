import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { FORGOT_PASSWORD_MUTATION } from '../api/AuthMutations';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useForgotForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [forgotPassword, { loading }] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: () => {
      setIsSuccess(true);
      setServerError(null);
      setFormError(null);
    },
    onError: (err) => {
      const msg = err.message.toLowerCase();

      if (msg.includes('not found') || msg.includes('user') || msg.includes('email')) {
        setServerError('No account found with this email address');
        setFormError(null);
      } else {
        setFormError('Something went wrong. Please try again later');
        setServerError(null);
      }
    },
  });

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (serverError) setServerError(null);
    if (formError) setFormError(null);
    if (submitted) setSubmitted(false);
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    setFormError(null);

    if (!email || !EMAIL_REGEX.test(email)) {
      return;
    }

    forgotPassword({
      variables: {
        auth: { email },
      },
    });
  };

  const isEmailEmpty = submitted && !email;
  const isEmailFormatInvalid = submitted && email.length > 0 && !EMAIL_REGEX.test(email);

  const emailInvalid = isEmailEmpty || isEmailFormatInvalid || !!serverError;

  const emailHelperText = isEmailEmpty
    ? 'Email is required'
    : isEmailFormatInvalid
      ? 'Please enter a valid email address'
      : serverError
        ? serverError
        : undefined;

  return {
    email,
    setEmail: handleEmailChange,
    handleSubmit,
    loading,
    emailInvalid,
    emailHelperText,
    isSuccess,
    formError,
  };
}
