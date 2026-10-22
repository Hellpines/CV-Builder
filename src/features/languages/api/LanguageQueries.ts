import { gql, type TypedDocumentNode } from '@apollo/client';
import type { LanguageProficiency } from '@/shared/types/user';
import type { CatalogLanguage } from '../types/LanguageTypes';

export const GET_PROFILE_LANGUAGES: TypedDocumentNode<
  { profile: { id: string; languages: LanguageProficiency[] } },
  { userId: string }
> = gql`
  query GetProfileLanguages($userId: ID!) {
    profile(userId: $userId) {
      id
      languages {
        name
        proficiency
      }
    }
  }
`;

export const GET_LANGUAGES_CATALOG: TypedDocumentNode<
  { languages: { items: CatalogLanguage[] } },
  { params?: { search?: string; page?: number; limit?: number } }
> = gql`
  query GetLanguagesCatalog($params: SearchPaginationInput) {
    languages(params: $params) {
      items {
        id
        iso2
        name
        native_name
      }
    }
  }
`;
