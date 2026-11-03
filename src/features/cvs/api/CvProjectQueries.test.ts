import { print } from 'graphql';
import { describe, expect, it } from 'vitest';
import {
  CV_PROJECT_FIELDS,
  GET_CV_PROJECTS,
  GET_PROJECTS_CATALOG,
  GET_ROLE_OPTIONS,
} from './CvProjectQueries';

describe('CV_PROJECT_FIELDS', () => {
  it('covers project identity, dates, roles and nested project', () => {
    const source = print(CV_PROJECT_FIELDS);

    expect(source).toContain('fragment CvProjectFields on CvProject');
    expect(source).toContain('start_date');
    expect(source).toContain('environment');
    expect(source).toContain('responsibilities');
    expect(source).toContain('project');
  });
});

describe('GET_CV_PROJECTS', () => {
  it('spreads CvProjectFields on cv projects', () => {
    const source = print(GET_CV_PROJECTS);

    expect(source).toContain('query GetCvProjects');
    expect(source).toContain('cv(cvId: $cvId)');
    expect(source).toContain('...CvProjectFields');
  });
});

describe('catalog queries', () => {
  it('loads projects catalog and role options', () => {
    const projects = print(GET_PROJECTS_CATALOG);
    const roles = print(GET_ROLE_OPTIONS);

    expect(projects).toContain('query GetProjectsCatalog');
    expect(projects).toContain('projects(params: $params)');
    expect(projects).toContain('domain');

    expect(roles).toContain('query GetRoleOptions');
    expect(roles).toContain('positions(params: $params)');
  });
});
