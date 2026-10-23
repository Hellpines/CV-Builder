import { useParams } from 'next/navigation';
import { skipToken, useQuery } from '@apollo/client/react';
import { useAuthStore } from '../../auth/model/useAuthStore';
import { GET_CV_DETAILS } from '../api/CvDetailsQueries';

export function useCv() {
  const params = useParams();
  const cvId = params?.id as string | undefined;
  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data, loading, error, refetch } = useQuery(
    GET_CV_DETAILS,
    cvId
      ? {
          variables: { cvId },
          fetchPolicy: 'cache-and-network',
        }
      : skipToken
  );

  const cv = data?.cv;
  const isOwner = !cv?.user || cv.user.id === currentUserId;

  return {
    cvId,
    cv,
    isOwner,
    loading,
    error,
    refetch: () => refetch().catch(() => undefined),
  };
}
