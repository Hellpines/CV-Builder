import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { SEND_VERIFICATION_MUTATION } from '@/features/auth/api/AuthMutations';

export function useVerifyEmail(email?: string) {
  const router = useRouter();
  const [sendVerification, { loading }] = useMutation(SEND_VERIFICATION_MUTATION);

  const handleVerifyEmail = async () => {
    if (!email) return;

    try {
      await sendVerification({ variables: { email } });
      router.push('/verify-email');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error sending verification code:', err);
      alert(`Failed to send verification code: ${errorMessage}`);
    }
  };

  return { handleVerifyEmail, sendingCode: loading };
}
