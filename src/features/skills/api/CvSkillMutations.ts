import { gql, type TypedDocumentNode } from '@apollo/client';
import type { Mastery, SkillMastery } from '@/shared/types/user';

interface CvSkills {
  id: string;
  skills: SkillMastery[];
}

interface CvSkillInput {
  cvId: string;
  name: string;
  categoryId?: string | null;
  mastery: Mastery;
}

export const ADD_CV_SKILL_MUTATION: TypedDocumentNode<
  { addCvSkill: CvSkills },
  { skill: CvSkillInput }
> = gql`
  mutation AddCvSkill($skill: AddCvSkillInput!) {
    addCvSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export const UPDATE_CV_SKILL_MUTATION: TypedDocumentNode<
  { updateCvSkill: CvSkills },
  { skill: CvSkillInput }
> = gql`
  mutation UpdateCvSkill($skill: UpdateCvSkillInput!) {
    updateCvSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export const DELETE_CV_SKILL_MUTATION: TypedDocumentNode<
  { deleteCvSkill: CvSkills },
  { skill: { cvId: string; name: string[] } }
> = gql`
  mutation DeleteCvSkill($skill: DeleteCvSkillInput!) {
    deleteCvSkill(skill: $skill) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;
