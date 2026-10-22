import { gql, type TypedDocumentNode } from '@apollo/client';
import type { LanguageProficiency, Proficiency } from '@/shared/types/user';

interface ProfileLanguages {
  id: string;
  languages: LanguageProficiency[];
}

interface LanguageInput {
  userId: string;
  name: string;
  proficiency: Proficiency;
}

export const ADD_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  { addProfileLanguage: ProfileLanguages },
  { language: LanguageInput }
> = gql`
  mutation AddProfileLanguage($language: AddProfileLanguageInput!) {
    addProfileLanguage(language: $language) {
      id
      languages {
        name
        proficiency
      }
    }
  }
`;

export const UPDATE_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  { updateProfileLanguage: ProfileLanguages },
  { language: LanguageInput }
> = gql`
  mutation UpdateProfileLanguage($language: UpdateProfileLanguageInput!) {
    updateProfileLanguage(language: $language) {
      id
      languages {
        name
        proficiency
      }
    }
  }
`;

export const DELETE_PROFILE_LANGUAGE_MUTATION: TypedDocumentNode<
  { deleteProfileLanguage: ProfileLanguages },
  { language: { userId: string; name: string[] } }
> = gql`
  mutation DeleteProfileLanguage($language: DeleteProfileLanguageInput!) {
    deleteProfileLanguage(language: $language) {
      id
      languages {
        name
        proficiency
      }
    }
  }
`;
