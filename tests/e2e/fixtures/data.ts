export const GRAPHQL_URL = '**/api/graphql';

export type MockSkillMastery = 'Novice' | 'Advanced' | 'Competent' | 'Proficient' | 'Expert';
export type MockProficiency = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';

export type MockSkill = {
  name: string;
  categoryId: string | null;
  mastery: MockSkillMastery;
};

export type MockLanguage = {
  name: string;
  proficiency: MockProficiency;
};

export type MockOrgUnit = {
  id: string;
  created_at: string;
  name: string;
};

export type MockCvUser = {
  __typename?: 'User';
  id: string;
  email: string;
};

export type MockUser = {
  id: string;
  created_at: string;
  email: string;
  is_verified: boolean;
  role: 'Employee';
  department: MockOrgUnit | null;
  position: MockOrgUnit | null;
  cvs: null;
  profile: {
    id: string;
    created_at: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    avatar: string | null;
    skills: MockSkill[];
    languages: MockLanguage[];
    email: string;
    is_verified: boolean;
    role: 'Employee';
  };
};

export const currentUser: MockUser = {
  id: 'user-1',
  created_at: '1704067200000',
  email: 'ada@example.com',
  is_verified: true,
  role: 'Employee',
  department: { id: 'dept-1', created_at: '1704067200000', name: 'Engineering' },
  position: { id: 'pos-1', created_at: '1704067200000', name: 'Frontend Developer' },
  cvs: null,
  profile: {
    id: 'profile-1',
    created_at: '1704067200000',
    first_name: 'Ada',
    last_name: 'Lovelace',
    full_name: 'Ada Lovelace',
    avatar: null,
    skills: [
      { name: 'TypeScript', categoryId: 'cat-1', mastery: 'Expert' },
      { name: 'React', categoryId: 'cat-1', mastery: 'Proficient' },
    ],
    languages: [
      { name: 'English', proficiency: 'C2' },
      { name: 'French', proficiency: 'B1' },
    ],
    email: 'ada@example.com',
    is_verified: true,
    role: 'Employee',
  },
};

export const otherUser: MockUser = {
  id: 'user-2',
  created_at: '1704153600000',
  email: 'grace@example.com',
  is_verified: true,
  role: 'Employee',
  department: { id: 'dept-2', created_at: '1704067200000', name: 'Design' },
  position: { id: 'pos-2', created_at: '1704067200000', name: 'UX Designer' },
  cvs: null,
  profile: {
    id: 'profile-2',
    created_at: '1704153600000',
    first_name: 'Grace',
    last_name: 'Hopper',
    full_name: 'Grace Hopper',
    avatar: null,
    skills: [{ name: 'Figma', categoryId: 'cat-2', mastery: 'Expert' }],
    languages: [{ name: 'English', proficiency: 'Native' }],
    email: 'grace@example.com',
    is_verified: true,
    role: 'Employee',
  },
};

export const departments = [
  { id: 'dept-1', name: 'Engineering' },
  { id: 'dept-2', name: 'Design' },
  { id: 'dept-3', name: 'HR' },
];

export const positions = [
  { id: 'pos-1', name: 'Frontend Developer' },
  { id: 'pos-2', name: 'UX Designer' },
  { id: 'pos-3', name: 'Backend Developer' },
];

export const skillCategories = [
  {
    id: 'cat-1',
    name: 'Frontend',
    order: 1,
    children: [{ id: 'cat-1-1', name: 'Frameworks', order: 1 }],
  },
  {
    id: 'cat-2',
    name: 'Design',
    order: 2,
    children: [],
  },
];

export const skillsCatalog = [
  { id: 'skill-1', name: 'TypeScript', category: { id: 'cat-1', name: 'Frontend' } },
  { id: 'skill-2', name: 'React', category: { id: 'cat-1', name: 'Frontend' } },
  { id: 'skill-3', name: 'GraphQL', category: { id: 'cat-1', name: 'Frontend' } },
  { id: 'skill-4', name: 'Figma', category: { id: 'cat-2', name: 'Design' } },
];

export const languagesCatalog = [
  { id: 'lang-1', iso2: 'en', name: 'English', native_name: 'English' },
  { id: 'lang-2', iso2: 'fr', name: 'French', native_name: 'Français' },
  { id: 'lang-3', iso2: 'de', name: 'German', native_name: 'Deutsch' },
  { id: 'lang-4', iso2: 'es', name: 'Spanish', native_name: 'Español' },
];

export const projectsCatalog = [
  {
    __typename: 'Project' as const,
    id: 'proj-1',
    name: 'CV Builder',
    domain: 'HR Tech',
    description: 'Internal CV management platform',
    environment: ['React', 'GraphQL', 'Next.js'],
    start_date: '2024-01-01',
    end_date: null as string | null,
  },
  {
    __typename: 'Project' as const,
    id: 'proj-2',
    name: 'Analytics Hub',
    domain: 'Data',
    description: 'Company analytics dashboard',
    environment: ['Python', 'PostgreSQL'],
    start_date: '2023-06-01',
    end_date: '2024-06-01',
  },
];

export type MockCvProject = {
  __typename?: 'CvProject';
  id: string;
  name: string;
  domain: string;
  description: string;
  start_date: string;
  end_date: string | null;
  environment: string[];
  roles: string[];
  responsibilities: string[];
  project: (typeof projectsCatalog)[number];
};

export type MockCv = {
  __typename?: 'Cv';
  id: string;
  name: string;
  education: string;
  description: string;
  user: MockCvUser;
  skills: MockSkill[];
  projects: MockCvProject[];
};

function buildDefaultCv(): MockCv {
  return {
    __typename: 'Cv',
    id: 'cv-1',
    name: 'Frontend CV',
    education: 'BS Computer Science',
    description: 'Frontend-focused curriculum vitae',
    user: { __typename: 'User', id: currentUser.id, email: currentUser.email },
    skills: [...currentUser.profile.skills],
    projects: [
      {
        __typename: 'CvProject',
        id: 'cvp-1',
        name: 'CV Builder',
        domain: 'HR Tech',
        description: 'Internal CV management platform',
        start_date: '2024-03-01',
        end_date: null,
        environment: ['React', 'GraphQL', 'Next.js'],
        roles: ['Frontend Developer'],
        responsibilities: ['Built UI', 'Integrated GraphQL'],
        project: { ...projectsCatalog[0] },
      },
    ],
  };
}

export function createCv(overrides: Partial<MockCv> = {}): MockCv {
  return { ...buildDefaultCv(), ...overrides };
}

export const seedCvs: MockCv[] = [createCv()];
