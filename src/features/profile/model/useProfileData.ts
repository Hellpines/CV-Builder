import { useQuery } from '@apollo/client/react';
import { GET_DEPARTMENTS, GET_POSITIONS } from '../api/ProfileQueries';
import { useProfileUser } from './useProfileUser';

export function useProfileData() {
  const { userData, isEditable, loading, error } = useProfileUser();
  const { data: deptData } = useQuery(GET_DEPARTMENTS);
  const { data: posData } = useQuery(GET_POSITIONS);

  return {
    userData,
    departments: deptData?.departments?.items ?? [],
    positions: posData?.positions?.items ?? [],
    isEditable,
    loading,
    error,
  };
}
