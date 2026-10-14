import { gql, TypedDocumentNode } from '@apollo/client';
import { LoginResponse, LoginVariables, SignupResponse, SignupVariables } from '../types/AuthTypes';

export const LOGIN_MUTATION: TypedDocumentNode<LoginResponse, LoginVariables> = gql`
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

export const SIGNUP_MUTATION: TypedDocumentNode<SignupResponse, SignupVariables> = gql`
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
