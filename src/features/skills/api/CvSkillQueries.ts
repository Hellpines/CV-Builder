import { gql, type TypedDocumentNode } from '@apollo/client';
import type { SkillMastery } from '@/shared/types/user';

export const GET_CV_SKILLS: TypedDocumentNode<
  { cv: { id: string; skills: SkillMastery[] } },
  { cvId: string }
> = gql`
  query GetCvSkills($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;
