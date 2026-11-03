import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Mastery, SkillMastery } from '@/shared/types/user';

interface ProfileSkills {
  id: string;
  skills: SkillMastery[];
}

interface SkillInput {
  userId: string;
  name: string;
  categoryId?: string | null;
  mastery: Mastery;
}

export const ADD_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  { addProfileSkill: ProfileSkills },
  { skill: SkillInput }
> = gql`
  mutation AddProfileSkill($skill: AddProfileSkillInput!) {
    addProfileSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export const UPDATE_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  { updateProfileSkill: ProfileSkills },
  { skill: SkillInput }
> = gql`
  mutation UpdateProfileSkill($skill: UpdateProfileSkillInput!) {
    updateProfileSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export const DELETE_PROFILE_SKILL_MUTATION: TypedDocumentNode<
  { deleteProfileSkill: ProfileSkills },
  { skill: { userId: string; name: string[] } }
> = gql`
  mutation DeleteProfileSkill($skill: DeleteProfileSkillInput!) {
    deleteProfileSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;
