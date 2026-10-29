import { useMemo } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import { GET_CV_PREVIEW, GET_PREVIEW_CATEGORIES } from '../api/CvPreviewQueries';
import { buildCvPreview } from '../helpers/buildCvPreview';

export function useCvPreview(cvId?: string) {
  const cvQuery = useQuery(
    GET_CV_PREVIEW,
    cvId
      ? {
          variables: { cvId },
          fetchPolicy: 'cache-and-network',
          errorPolicy: 'all',
        }
      : skipToken
  );
  const categoriesQuery = useQuery(GET_PREVIEW_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const cv = cvQuery.data?.cv;
  const categories = categoriesQuery.data?.skillCategories;

  const model = useMemo(
    () => (cv && categories ? buildCvPreview(cv, categories) : null),
    [cv, categories]
  );

  const hasData = Boolean(cv && categories);
  const error = hasData ? undefined : (cvQuery.error ?? categoriesQuery.error);

  return {
    model,
    initialLoading:
      (cvQuery.loading && !cvQuery.data && !cvQuery.error) ||
      (categoriesQuery.loading && !categoriesQuery.data && !categoriesQuery.error),
    error,
    refetch: async () => {
      await Promise.all([
        cvQuery.refetch().catch(() => undefined),
        categoriesQuery.refetch().catch(() => undefined),
      ]);
    },
  };
}
