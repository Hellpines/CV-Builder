import { gql, type TypedDocumentNode } from '@apollo/client';
import type { SkillMastery } from '@/shared/types/user';
import type { CatalogSkill, SkillCategory } from '../types/SkillTypes';

export const GET_PROFILE_SKILLS: TypedDocumentNode<
  { profile: { id: string; skills: SkillMastery[] } },
  { userId: string }
> = gql`
  query GetProfileSkills($userId: ID!) {
    profile(userId: $userId) {
      id
      skills {
        name
        categoryId
        mastery
      }
    }
  }
`;

export const GET_SKILL_CATEGORIES: TypedDocumentNode<
  { skillCategories: SkillCategory[] },
  Record<string, never>
> = gql`
  query GetSkillCategories {
    skillCategories {
      id
      name
      order
      children {
        id
        name
        order
      }
    }
  }
`;

export const GET_SKILLS_CATALOG: TypedDocumentNode<
  { skills: { items: CatalogSkill[] } },
  { params?: { search?: string; page?: number; limit?: number } }
> = gql`
  query GetSkillsCatalog($params: SearchPaginationInput) {
    skills(params: $params) {
      items {
        id
        name
        category {
          id
          name
        }
      }
    }
  }
`;
