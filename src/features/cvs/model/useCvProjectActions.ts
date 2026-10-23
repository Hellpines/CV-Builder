import { useMemo } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import {
  ADD_CV_PROJECT_MUTATION,
  REMOVE_CV_PROJECT_MUTATION,
  UPDATE_CV_PROJECT_MUTATION,
} from '../api/CvProjectMutations';
import { GET_PROJECTS_CATALOG, GET_ROLE_OPTIONS } from '../api/CvProjectQueries';
import type { CvProjectPayload } from '../types/CvProjectTypes';

const OPTIONS_LIMIT = 100;

export function useCvProjectActions(cvId?: string) {
  const { data: catalogData } = useQuery(GET_PROJECTS_CATALOG, {
    variables: { params: { limit: OPTIONS_LIMIT } },
  });
  const { data: rolesData } = useQuery(GET_ROLE_OPTIONS, {
    variables: { params: { limit: OPTIONS_LIMIT } },
  });

  const [addProject] = useMutation(ADD_CV_PROJECT_MUTATION);
  const [updateProject] = useMutation(UPDATE_CV_PROJECT_MUTATION);
  const [removeProject] = useMutation(REMOVE_CV_PROJECT_MUTATION);

  const catalog = useMemo(() => catalogData?.projects.items ?? [], [catalogData]);
  const roles = useMemo(
    () => Array.from(new Set((rolesData?.positions.items ?? []).map((item) => item.name))),
    [rolesData]
  );

  const add = async (payload: CvProjectPayload) => {
    if (!cvId) throw new Error('CV not found');
    await addProject({ variables: { project: { cvId, ...payload } } });
  };

  const update = async (payload: CvProjectPayload) => {
    if (!cvId) throw new Error('CV not found');
    await updateProject({ variables: { project: { cvId, ...payload } } });
  };

  const remove = async (projectId: string) => {
    if (!cvId) throw new Error('CV not found');
    await removeProject({ variables: { project: { cvId, projectId } } });
  };

  return { catalog, roles, add, update, remove };
}
