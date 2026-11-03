import { gql, type TypedDocumentNode } from '@apollo/client';
import type { PaginatedCvs } from '../types/CvTypes';

export const GET_USER_CVS: TypedDocumentNode<
  { cvsByUserId: PaginatedCvs },
  {
    userId: string;
    params?: {
      search?: string;
      sort_by?: string;
      sort_order?: string;
      page?: number;
      limit?: number;
    };
  }
> = gql`
  query GetUserCvs($userId: ID!, $params: SearchPaginationInput) {
    cvsByUserId(userId: $userId, params: $params) {
      items {
        id
        name
        education
        description
        user {
          id
          email
        }
      }
      total
      page
      limit
      total_pages
    }
  }
`;
