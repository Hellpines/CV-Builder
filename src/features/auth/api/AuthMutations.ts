import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  LoginResponse,
  LoginVariables,
  SignupResponse,
  SignupVariables,
} from '../types/AuthTypes';

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    created_at
    email
    role
    is_verified
    profile {
      id
      created_at
      first_name
      last_name
      full_name
      avatar
      email
      is_verified
      role
      skills {
        name
        categoryId
        mastery
      }
      languages {
        name
        proficiency
      }
    }
    department {
      id
      created_at
      name
    }
    position {
      id
      created_at
      name
    }
    cvs {
      id
      created_at
      name
      education
      description
    }
  }
`;

export const LOGIN_MUTATION: TypedDocumentNode<LoginResponse, LoginVariables> = gql`
  mutation Login($auth: AuthInput!) {
    login(auth: $auth) {
      access_token
      refresh_token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const SIGNUP_MUTATION: TypedDocumentNode<SignupResponse, SignupVariables> = gql`
  mutation Signup($auth: SignupInput!) {
    signup(auth: $auth) {
      access_token
      refresh_token
      user {
        ...UserFields
      }
    }
  }
  ${USER_FIELDS}
`;

export const FORGOT_PASSWORD_MUTATION: TypedDocumentNode<
  { forgotPassword: null },
  { auth: { email: string } }
> = gql`
  mutation ForgotPassword($auth: ForgotPasswordInput!) {
    forgotPassword(auth: $auth)
  }
`;

export const RESET_PASSWORD_MUTATION: TypedDocumentNode<
  { resetPassword: null },
  { auth: { newPassword: string; confirmPassword: string } }
> = gql`
  mutation ResetPassword($auth: ResetPasswordInput!) {
    resetPassword(auth: $auth)
  }
`;

export const UPDATE_TOKEN_MUTATION: TypedDocumentNode<
  {
    updateToken: {
      access_token: string;
      refresh_token: string;
    };
  },
  Record<string, never>
> = gql`
  mutation UpdateToken {
    updateToken {
      access_token
      refresh_token
    }
  }
`;

export const VERIFY_MAIL_MUTATION: TypedDocumentNode<
  { verifyMail: null },
  { mail: { otp: string } }
> = gql`
  mutation VerifyMail($mail: VerifyMailInput!) {
    verifyMail(mail: $mail)
  }
`;

export const SEND_VERIFICATION_MUTATION: TypedDocumentNode<
  { sendVerification: null },
  { email: string }
> = gql`
  mutation SendVerification($email: String!) {
    sendVerification(email: $email)
  }
`;
