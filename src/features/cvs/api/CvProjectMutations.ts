import { gql, type TypedDocumentNode } from '@apollo/client';
import type { CvProjectItem, CvProjectPayload } from '../types/CvProjectTypes';
import { CV_PROJECT_FIELDS } from './CvProjectQueries';

interface CvWithProjects {
  id: string;
  projects: CvProjectItem[] | null;
}

export const ADD_CV_PROJECT_MUTATION: TypedDocumentNode<
  { addCvProject: CvWithProjects },
  { project: CvProjectPayload & { cvId: string } }
> = gql`
  mutation AddCvProject($project: AddCvProjectInput!) {
    addCvProject(project: $project) {
      id
      projects {
        ...CvProjectFields
      }
    }
  }
  ${CV_PROJECT_FIELDS}
`;

export const UPDATE_CV_PROJECT_MUTATION: TypedDocumentNode<
  { updateCvProject: CvWithProjects },
  { project: CvProjectPayload & { cvId: string } }
> = gql`
  mutation UpdateCvProject($project: UpdateCvProjectInput!) {
    updateCvProject(project: $project) {
      id
      projects {
        ...CvProjectFields
      }
    }
  }
  ${CV_PROJECT_FIELDS}
`;

export const REMOVE_CV_PROJECT_MUTATION: TypedDocumentNode<
  { removeCvProject: CvWithProjects },
  { project: { cvId: string; projectId: string } }
> = gql`
  mutation RemoveCvProject($project: RemoveCvProjectInput!) {
    removeCvProject(project: $project) {
      id
      projects {
        ...CvProjectFields
      }
    }
  }
  ${CV_PROJECT_FIELDS}
`;
