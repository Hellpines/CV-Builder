import { gql, type TypedDocumentNode } from '@apollo/client';
import type { CvPreviewData, PreviewCategory } from '../types/CvPreviewTypes';
import { CV_PROJECT_FIELDS } from './CvProjectQueries';

export const GET_CV_PREVIEW: TypedDocumentNode<{ cv: CvPreviewData }, { cvId: string }> = gql`
  query GetCvPreview($cvId: ID!) {
    cv(cvId: $cvId) {
      id
      name
      education
      description
      skills {
        name
        categoryId
        mastery
      }
      projects {
        ...CvProjectFields
      }
      user {
        id
        email
        position {
          id
          name
        }
        profile {
          id
          first_name
          last_name
          full_name
          languages {
            name
            proficiency
          }
        }
      }
    }
  }
  ${CV_PROJECT_FIELDS}
`;

export const GET_PREVIEW_CATEGORIES: TypedDocumentNode<
  { skillCategories: PreviewCategory[] },
  Record<string, never>
> = gql`
  query GetPreviewCategories {
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

export const EXPORT_PDF_MUTATION: TypedDocumentNode<
  { exportPdf: string },
  {
    pdf: {
      html: string;
      margin?: { top: string; bottom: string; left: string; right: string };
    };
  }
> = gql`
  mutation ExportPdf($pdf: ExportPdfInput!) {
    exportPdf(pdf: $pdf)
  }
`;
