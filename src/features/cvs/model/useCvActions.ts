import { useMutation } from '@apollo/client/react';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { CREATE_CV_MUTATION, DELETE_CV_MUTATION, UPDATE_CV_MUTATION } from '../api/CvMutations';
import type { CvFormValues } from '../types/CvTypes';

/** onChanged: перезапрос текущей страницы списка после успешной операции */
export function useCvActions(onChanged: () => Promise<unknown>) {
  const userId = useAuthStore((state) => state.user?.id);

  const [createCv] = useMutation(CREATE_CV_MUTATION);
  const [updateCv] = useMutation(UPDATE_CV_MUTATION);
  const [deleteCv] = useMutation(DELETE_CV_MUTATION);

  const create = async (values: CvFormValues) => {
    if (!userId) throw new Error('User not found');
    await createCv({ variables: { cv: { ...values, userId } } });
    await onChanged();
  };

  const update = async (cvId: string, values: CvFormValues) => {
    await updateCv({ variables: { cv: { cvId, ...values } } });
    await onChanged();
  };

  const remove = async (cvId: string) => {
    await deleteCv({
      variables: { cv: { cvId } },
      update: (cache) => {
        cache.evict({ id: cache.identify({ __typename: 'Cv', id: cvId }) });
        cache.gc();
      },
    });
    await onChanged();
  };

  return { create, update, remove };
}
