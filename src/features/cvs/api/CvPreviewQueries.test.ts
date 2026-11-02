import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import { EXPORT_PDF_MUTATION, GET_CV_PREVIEW, GET_PREVIEW_CATEGORIES } from './CvPreviewQueries';

describe('GET_CV_PREVIEW', () => {
  it('loads preview payload with skills, projects and user profile', () => {
    const source = print(GET_CV_PREVIEW);

    expect(source).toContain('query GetCvPreview');
    expect(source).toContain('cv(cvId: $cvId)');
    expect(source).toContain('skills');
    expect(source).toContain('...CvProjectFields');
    expect(source).toContain('full_name');
    expect(source).toContain('languages');
  });
});

describe('GET_PREVIEW_CATEGORIES', () => {
  it('loads skill categories with children', () => {
    const source = print(GET_PREVIEW_CATEGORIES);

    expect(source).toContain('query GetPreviewCategories');
    expect(source).toContain('skillCategories');
    expect(source).toContain('children');
    expect(source).toContain('order');
  });
});

describe('EXPORT_PDF_MUTATION', () => {
  it('exports pdf from html input', () => {
    const source = print(EXPORT_PDF_MUTATION);

    expect(source).toContain('mutation ExportPdf');
    expect(source).toContain('exportPdf(pdf: $pdf)');
  });
});
