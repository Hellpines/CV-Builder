import {
  createCv,
  currentUser,
  departments,
  languagesCatalog,
  otherUser,
  positions,
  projectsCatalog,
  seedCvs,
  skillCategories,
  skillsCatalog,
  type MockCv,
  type MockLanguage,
  type MockSkill,
  type MockUser,
} from './data';

export interface GraphQlStore {
  users: MockUser[];
  cvs: MockCv[];
  profileSkills: Record<string, MockSkill[]>;
  profileLanguages: Record<string, MockLanguage[]>;
  cvSkills: Record<string, MockSkill[]>;
  cvProjects: Record<string, NonNullable<MockCv['projects']>>;
}

export function createStore(): GraphQlStore {
  const me = structuredClone(currentUser);
  const other = structuredClone(otherUser);
  const cvs = seedCvs.map((cv) => structuredClone(cv));

  return {
    users: [me, other],
    cvs,
    profileSkills: {
      [me.id]: structuredClone(me.profile.skills),
      [other.id]: structuredClone(other.profile.skills),
    },
    profileLanguages: {
      [me.id]: structuredClone(me.profile.languages),
      [other.id]: structuredClone(other.profile.languages),
    },
    cvSkills: Object.fromEntries(cvs.map((cv) => [cv.id, structuredClone(cv.skills)])),
    cvProjects: Object.fromEntries(cvs.map((cv) => [cv.id, structuredClone(cv.projects ?? [])])),
  };
}

export {
  departments,
  languagesCatalog,
  positions,
  projectsCatalog,
  skillCategories,
  skillsCatalog,
};

export function findUser(store: GraphQlStore, userId: string) {
  return store.users.find((user) => user.id === userId);
}

export function findCv(store: GraphQlStore, cvId: string) {
  return store.cvs.find((cv) => cv.id === cvId);
}

export function createEmptyCv(
  user: MockUser,
  values: { name: string; education: string; description: string }
) {
  return createCv({
    id: `cv-${Date.now()}`,
    name: values.name,
    education: values.education,
    description: values.description,
    user: { id: user.id, email: user.email },
    skills: [],
    projects: [],
  });
}
