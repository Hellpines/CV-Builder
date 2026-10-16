import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers($params: SearchPaginationInput) {
    users(params: $params) {
      items {
        id
        email
        profile {
          first_name
          last_name
          avatar
        }
        department {
          id
          name
        }
        position {
          id
          name
        }
      }
      total
      page
      limit
      total_pages
    }
  }
`;
