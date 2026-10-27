import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { VERIFY_MAIL_MUTATION } from '../api/AuthMutations';
import { useAuthStore } from './useAuthStore';
import { toast } from '@/shared/lib/toast';

export function useVerifyForm() {
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

      toast.success('Email verified successfully');
      router.push('/users');
    },
    onError: (err) => {
      const msg = err.message.toLowerCase();
      if (msg.includes('expired')) {
        setServerError('Verification code has expired');
        toast.error('Verification code has expired');
      } else if (msg.includes('invalid') || msg.includes('wrong') || msg.includes('code')) {
        setServerError('Invalid verification code');
        toast.error('Invalid verification code');
      } else {
        setServerError('Something went wrong. Please try again later');
        toast.error('Something went wrong. Please try again later');
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
      const newCode = [...code];

      pastedCode.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });

      setCode(newCode);

      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const cleanedValue = value.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = cleanedValue;
    setCode(newCode);

    if (cleanedValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      clearErrors();
      if (!code[index] && index > 0) {
        const newCode = [...code];
        newCode[index - 1] = '';
        setCode(newCode);
        inputRefs.current[index - 1]?.focus();
      } else if (code[index]) {
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
      }
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
