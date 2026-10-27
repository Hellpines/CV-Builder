import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { SEND_VERIFICATION_MUTATION } from '@/features/auth/api/AuthMutations';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { toast } from '@/shared/lib/toast';

export function useVerifyEmail(email?: string) {
  const router = useRouter();
  const [sendVerification, { loading }] = useMutation(SEND_VERIFICATION_MUTATION);

  const handleVerifyEmail = async () => {
    if (!email) return;

    try {
      await sendVerification({ variables: { email } });
      useAuthStore.getState().startVerification();
      router.push('/verify-email');
      toast.success('Verification email has been sent');
    } catch (err: unknown) {
      console.error('Error sending verification code:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to send verification email');
    }
  };

  return { handleVerifyEmail, sendingCode: loading };
}
