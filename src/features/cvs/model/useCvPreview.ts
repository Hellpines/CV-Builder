import { useMemo } from 'react';
import { skipToken, useQuery } from '@apollo/client/react';
import { GET_CV_PREVIEW, GET_PREVIEW_CATEGORIES } from '../api/CvPreviewQueries';
import { buildCvPreview } from '../helpers/buildCvPreview';

export function useCvPreview(cvId?: string) {
  const { data, loading, error, refetch } = useQuery(
    GET_CV_PREVIEW,
    cvId ? { variables: { cvId }, fetchPolicy: 'cache-and-network' } : skipToken
  );
  const { data: categoryData, loading: categoriesLoading } = useQuery(GET_PREVIEW_CATEGORIES);

  const cv = data?.cv;

  const model = useMemo(
    () => (cv && cv.user ? buildCvPreview(cv, categoryData?.skillCategories ?? []) : null),
    [cv, categoryData]
  );

  return {
    model,
    initialLoading: (loading && !data) || (categoriesLoading && !categoryData),
    error,
    refetch: () => refetch().catch(() => undefined),
  };
}
