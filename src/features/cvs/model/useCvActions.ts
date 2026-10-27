import { useMutation } from '@apollo/client/react';
import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { toast } from '@/shared/lib/toast';
import { CREATE_CV_MUTATION, DELETE_CV_MUTATION, UPDATE_CV_MUTATION } from '../api/CvMutations';
import type { CvFormValues } from '../types/CvTypes';

export function useCvActions(onChanged: () => Promise<unknown>) {
  const userId = useAuthStore((state) => state.user?.id);

  const [createCv] = useMutation(CREATE_CV_MUTATION);
  const [updateCv] = useMutation(UPDATE_CV_MUTATION);
  const [deleteCv] = useMutation(DELETE_CV_MUTATION);

  const create = async (values: CvFormValues) => {
    if (!userId) throw new Error('User not found');
    try {
      await createCv({ variables: { cv: { ...values, userId } } });
      await onChanged();
      toast.success('CV created successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create CV');
      throw err;
    }
  };

  const update = async (cvId: string, values: CvFormValues) => {
    try {
      await updateCv({ variables: { cv: { cvId, ...values } } });
      await onChanged();
      toast.success('CV updated successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update CV');
      throw err;
    }
  };

  const remove = async (cvId: string) => {
    try {
      await deleteCv({
        variables: { cv: { cvId } },
        update: (cache) => {
          cache.evict({ id: cache.identify({ __typename: 'Cv', id: cvId }) });
          cache.gc();
        },
      });
      await onChanged();
      toast.success('CV deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete CV');
      throw err;
    }
  };

  return { create, update, remove };
}
