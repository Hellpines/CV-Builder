import { Department, Position, User } from '@/shared/types/user';
import { gql, TypedDocumentNode } from '@apollo/client';

export const GET_USER_PROFILE: TypedDocumentNode<{ user: User }, { userId: string }> = gql`
  query GetUserProfile($userId: ID!) {
    user(userId: $userId) {
      id
      created_at
      email
      role
      is_verified
      department {
        id
        name
      }
      position {
        id
        name
      }
      profile {
        id
        first_name
        last_name
        full_name
        avatar
      }
    }
  }
`;

export const GET_DEPARTMENTS: TypedDocumentNode<
  { departments: { items: Department[] } },
  { params?: { search?: string; page?: number; limit?: number } }
> = gql`
  query GetDepartments($params: SearchPaginationInput) {
    departments(params: $params) {
      items {
        id
        name
      }
    }
  }
`;

export const GET_POSITIONS: TypedDocumentNode<
  { positions: { items: Position[] } },
  { params?: { search?: string; page?: number; limit?: number } }
> = gql`
  query GetPositions($params: SearchPaginationInput) {
    positions(params: $params) {
      items {
        id
        name
      }
    }
  }
`;
