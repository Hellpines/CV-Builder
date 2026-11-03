import { gql, type TypedDocumentNode } from '@apollo/client';

export const CHANGE_PASSWORD_MUTATION: TypedDocumentNode<
  { changePassword: { id: string } },
  { args: { oldPassword: string; newPassword: string; confirmPassword: string } }
> = gql`
  mutation ChangePassword($args: ChangePasswordInput!) {
    changePassword(args: $args) {
      id
    }
  }
`;
