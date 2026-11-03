import { gql, type TypedDocumentNode } from '@apollo/client';
import type { CvProjectItem, ProjectInfo } from '../types/CvProjectTypes';

type CatalogParams = { params?: { search?: string; page?: number; limit?: number } };

export const CV_PROJECT_FIELDS = gql`
  fragment CvProjectFields on CvProject {
    id
    name
    domain
    description
    start_date
    end_date
    environment
    roles
    responsibilities
    project {
      id
      name
      domain
      description
      environment
      start_date
      end_date
    }
  }
`;

export const GET_CV_PROJECTS: TypedDocumentNode<
  { cv: { id: string; projects: CvProjectItem[] | null } },
  { cvId: string }
> = gql`
  query GetCvProjects($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      projects {
        ...CvProjectFields
      }
    }
  }
  ${CV_PROJECT_FIELDS}
`;

export const GET_PROJECTS_CATALOG: TypedDocumentNode<
  { projects: { items: ProjectInfo[] } },
  CatalogParams
> = gql`
  query GetProjectsCatalog($params: SearchPaginationInput) {
    projects(params: $params) {
      items {
        id
        name
        domain
        description
        environment
        start_date
        end_date
      }
    }
  }
`;

export const GET_ROLE_OPTIONS: TypedDocumentNode<
  { positions: { items: { id: string; name: string }[] } },
  CatalogParams
> = gql`
  query GetRoleOptions($params: SearchPaginationInput) {
    positions(params: $params) {
      items {
        id
        name
      }
    }
  }
`;
