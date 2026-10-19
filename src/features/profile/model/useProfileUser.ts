import { useParams } from 'next/navigation';
import { skipToken, useQuery } from '@apollo/client/react';
import { GET_USER_PROFILE } from '../api/ProfileQueries';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

export function useProfileUser() {
  const params = useParams();
  const userId = params?.id as string | undefined;

  const currentUserId = useAuthStore((state) => state.user?.id);
  const isEditable = userId === 'me' || userId === currentUserId;
  const targetId = userId === 'me' ? currentUserId : userId;

  const { data, loading, error } = useQuery(
    GET_USER_PROFILE,
    targetId ? { variables: { userId: targetId } } : skipToken
  );

  return { userData: data?.user, isEditable, loading, error };
}
