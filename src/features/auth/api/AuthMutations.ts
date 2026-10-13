import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($auth: AuthInput!) {
    login(auth: $auth) {
      access_token
      refresh_token
      user {
        id
        email
        role
        is_verified
      }
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($auth: SignupInput!) {
    signup(auth: $auth) {
      access_token
      refresh_token
      user {
        id
        email
        role
        is_verified
      }
    }
  }
`;
