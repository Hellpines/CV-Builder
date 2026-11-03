import { gql, type TypedDocumentNode } from '@apollo/client';
import type { CvFormValues, CvListItem } from '../types/CvTypes';

export const CREATE_CV_MUTATION: TypedDocumentNode<
  { createCv: CvListItem },
  { cv: CvFormValues & { userId?: string } }
> = gql`
  mutation CreateCv($cv: CreateCvInput!) {
    createCv(cv: $cv) {
      id
      name
      education
      description
      user {
        id
        email
      }
    }
  }
`;

export const UPDATE_CV_MUTATION: TypedDocumentNode<
  { updateCv: CvListItem },
  { cv: CvFormValues & { cvId: string } }
> = gql`
  mutation UpdateCv($cv: UpdateCvInput!) {
    updateCv(cv: $cv) {
      id
      name
      education
      description
      user {
        id
        email
      }
    }
  }
`;

export const DELETE_CV_MUTATION: TypedDocumentNode<
  { deleteCv: { affected: number } },
  { cv: { cvId: string } }
> = gql`
  mutation DeleteCv($cv: DeleteCvInput!) {
    deleteCv(cv: $cv) {
      affected
    }
  }
`;
