import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { SEND_VERIFICATION_MUTATION } from '@/features/auth/api/AuthMutations';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { toast } from '@/shared/lib/toast';

export function useVerifyEmail(email?: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const [sendVerification, { loading }] = useMutation(SEND_VERIFICATION_MUTATION);

  const handleVerifyEmail = async () => {
    if (!email) return;

    try {
      await sendVerification({ variables: { email } });
      useAuthStore.getState().startVerification();
      router.push('/verify-email');
      toast.success(t('notifications.verificationEmailSent'));
    } catch (err: unknown) {
      console.error('Error sending verification code:', err);
      toast.error(
        err instanceof Error ? err.message : t('notifications.verificationEmailSendFailed')
      );
    }
  };

  return { handleVerifyEmail, sendingCode: loading };
}
