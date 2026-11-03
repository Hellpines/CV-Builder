import { useQuery } from '@apollo/client/react';
import { GET_DEPARTMENTS, GET_POSITIONS } from '../api/ProfileQueries';
import { useProfileUser } from './useProfileUser';

const OPTIONS_LIMIT = 50;

export function useProfileData() {
  const { userData, isEditable, loading, error } = useProfileUser();
  const { data: deptData } = useQuery(GET_DEPARTMENTS, {
    variables: { params: { limit: OPTIONS_LIMIT } },
  });
  const { data: posData } = useQuery(GET_POSITIONS, {
    variables: { params: { limit: OPTIONS_LIMIT } },
  });

  return {
    userData,
    departments: deptData?.departments?.items ?? [],
    positions: posData?.positions?.items ?? [],
    isEditable,
    loading,
    error,
  };
}
