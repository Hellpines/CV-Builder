import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { VERIFY_MAIL_MUTATION } from '../api/AuthMutations';
import { useAuthStore } from './useAuthStore';
import { toast } from '@/shared/lib/toast';

export function useVerifyForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, accessToken } = useAuthStore();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!accessToken || !user) {
      router.replace('/login');
      return;
    }

    if (user.is_verified) {
      router.replace('/users');
    }
  }, [accessToken, user, router]);

  const [verifyMail, { loading }] = useMutation(VERIFY_MAIL_MUTATION, {
    onCompleted: () => {
      useAuthStore.setState((state) => ({
        user: state.user ? { ...state.user, is_verified: true } : null,
        verificationRequested: false,
      }));

      toast.success(t('notifications.emailVerified'));
      router.push('/users');
    },
    onError: (err) => {
      const msg = err.message.toLowerCase();
      if (msg.includes('expired')) {
        setServerError(t('notifications.verificationExpired'));
        toast.error(t('notifications.verificationExpired'));
      } else if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('code')) {
        setServerError(t('notifications.invalidVerificationCode'));
        toast.error(t('notifications.invalidVerificationCode'));
      } else {
        setServerError(t('notifications.generalError'));
        toast.error(t('notifications.generalError'));
      }
    },
  });

  const clearErrors = () => {
    if (serverError) setServerError(null);
    if (submitted) setSubmitted(false);
  };

  const handleChange = (value: string, index: number) => {
    clearErrors();

    if (value.length > 1) {
      const pastedCode = value.replace(/\D/g, '').slice(0, 6).split('');
      setCode((prev) => {
        const next = [...prev];
        pastedCode.forEach((digit, offset) => {
          if (index + offset < 6) next[index + offset] = digit;
        });
        return next;
      });

      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanedValue = value.replace(/\D/g, '');
    setCode((prev) => {
      const next = [...prev];
      next[index] = cleanedValue;
      return next;
    });

    if (cleanedValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      clearErrors();
      setCode((prev) => {
        if (!prev[index] && index > 0) {
          const next = [...prev];
          next[index - 1] = '';
          inputRefs.current[index - 1]?.focus();
          return next;
        }
        if (prev[index]) {
          const next = [...prev];
          next[index] = '';
          return next;
        }
        return prev;
      });
    }
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);

    const otp = code.join('');
    if (otp.length < 6) return;

    verifyMail({
      variables: {
        mail: { otp },
      },
    });
  };

  const handleLater = () => {
    useAuthStore.getState().clearVerification();
    router.push('/users');
  };

  const otp = code.join('');
  const isCodeEmpty = submitted && otp.length === 0;
  const isCodeIncomplete = submitted && otp.length > 0 && otp.length < 6;

  const helperText = isCodeEmpty
    ? 'Verification code is required'
    : isCodeIncomplete
      ? 'Please enter a valid 6-digit code'
      : (serverError ?? undefined);

  const hasError = isCodeEmpty || isCodeIncomplete || !!serverError;

  return {
    code,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleSubmit,
    handleLater,
    loading,
    hasError,
    helperText,
  };
}
