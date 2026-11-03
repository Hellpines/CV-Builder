import { gql, type TypedDocumentNode } from '@apollo/client';
import type { CvListItem } from '../types/CvTypes';

export const GET_CV_DETAILS: TypedDocumentNode<{ cv: CvListItem }, { cvId: string }> = gql`
  query GetCvDetails($cvId: ID!) {
    cv(cvId: $cvId) {
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
