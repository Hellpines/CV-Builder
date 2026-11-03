import { User, UserRole } from '@/shared/types/user';
import { gql, TypedDocumentNode } from '@apollo/client';

type UpdatedProfile = Pick<
  User['profile'],
  'id' | 'first_name' | 'last_name' | 'full_name' | 'avatar'
>;

export const UPDATE_PROFILE_MUTATION: TypedDocumentNode<
  { updateProfile: UpdatedProfile },
  {
    profile: {
      userId: string;
      first_name?: string;
      last_name?: string;
    };
  }
> = gql`
  mutation UpdateProfile($profile: UpdateProfileInput!) {
    updateProfile(profile: $profile) {
      id
      first_name
      last_name
      full_name
      avatar
    }
  }
`;

export const UPDATE_USER_MUTATION: TypedDocumentNode<
  { updateUser: Pick<User, 'id' | 'department' | 'position'> },
  {
    user: {
      userId: string;
      departmentId: string;
      positionId: string;
      role: UserRole;
    };
  }
> = gql`
  mutation UpdateUser($user: UpdateUserInput!) {
    updateUser(user: $user) {
      id
      department {
        id
        name
      }
      position {
        id
        name
      }
    }
  }
`;

export const UPLOAD_AVATAR_MUTATION: TypedDocumentNode<
  { uploadAvatar: string },
  {
    avatar: {
      userId: string;
      base64: string;
      size: number;
      type: string;
    };
  }
> = gql`
  mutation UploadAvatar($avatar: UploadAvatarInput!) {
    uploadAvatar(avatar: $avatar)
  }
`;

export const DELETE_AVATAR_MUTATION: TypedDocumentNode<
  { deleteAvatar: boolean },
  {
    avatar: {
      userId: string;
    };
  }
> = gql`
  mutation DeleteAvatar($avatar: DeleteAvatarInput!) {
    deleteAvatar(avatar: $avatar)
  }
`;
