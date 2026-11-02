import type { Page, Route } from '@playwright/test';
import { GRAPHQL_URL, currentUser, type MockProficiency, type MockSkillMastery } from './data';
import {
  createEmptyCv,
  createStore,
  departments,
  findCv,
  findUser,
  languagesCatalog,
  positions,
  projectsCatalog,
  skillCategories,
  skillsCatalog,
  type GraphQlStore,
} from './store';

type GraphQlBody = {
  operationName?: string;
  variables?: Record<string, unknown>;
  query?: string;
};

function ok(data: unknown) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data }),
  };
}

function fail(message: string, code = 'BAD_USER_INPUT') {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      errors: [{ message, extensions: { code } }],
      data: null,
    }),
  };
}

function paginate<T>(items: T[], params?: { search?: string; page?: number; limit?: number }) {
  const search = params?.search?.trim().toLowerCase() ?? '';
  const filtered = search
    ? items.filter((item) => JSON.stringify(item).toLowerCase().includes(search))
    : items;
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const start = (page - 1) * limit;
  const slice = filtered.slice(start, start + limit);
  return {
    items: slice,
    total: filtered.length,
    page,
    limit,
    total_pages: Math.max(1, Math.ceil(filtered.length / limit) || 1),
  };
}

function resolveOperation(body: GraphQlBody) {
  if (body.operationName) return body.operationName;
  const match = body.query?.match(/\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
  return match?.[2] ?? '';
}

export function createGraphQlHandler(store: GraphQlStore = createStore()) {
  return async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204 });
      return;
    }

    let body: GraphQlBody = {};
    try {
      body = route.request().postDataJSON() as GraphQlBody;
    } catch {
      body = {};
    }

    const operation = resolveOperation(body);
    const variables = body.variables ?? {};

    const response = handleOperation(store, operation, variables);
    await route.fulfill(response);
  };
}

function handleOperation(
  store: GraphQlStore,
  operation: string,
  variables: Record<string, unknown>
) {
  switch (operation) {
    case 'Login': {
      const auth = variables.auth as { email?: string; password?: string };
      if (auth?.email === 'bad@example.com' || auth?.password === 'wrongpass') {
        return fail('Invalid email or password', 'BAD_USER_INPUT');
      }
      const user =
        store.users.find((item) => item.email === auth?.email) ?? structuredClone(currentUser);
      return ok({
        login: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user,
        },
      });
    }

    case 'Signup': {
      const auth = variables.auth as { email?: string };
      if (auth?.email === 'exists@example.com') {
        return fail('An account with this email already exists');
      }
      const user = {
        ...structuredClone(currentUser),
        id: `user-${Date.now()}`,
        email: auth?.email ?? 'new@example.com',
        is_verified: false,
        profile: {
          ...structuredClone(currentUser.profile),
          email: auth?.email ?? 'new@example.com',
          first_name: null,
          last_name: null,
          full_name: null,
          is_verified: false,
          skills: [],
          languages: [],
        },
      };
      store.users.push(user);
      store.profileSkills[user.id] = [];
      store.profileLanguages[user.id] = [];
      return ok({
        signup: {
          access_token: 'access-token',
          refresh_token: 'refresh-token',
          user,
        },
      });
    }

    case 'ForgotPassword': {
      const auth = variables.auth as { email?: string };
      if (auth?.email === 'missing@example.com') {
        return fail('No account found with this email address');
      }
      return ok({ forgotPassword: null });
    }

    case 'ResetPassword':
      return ok({ resetPassword: null });

    case 'UpdateToken':
      return ok({
        updateToken: {
          access_token: 'access-token-refreshed',
          refresh_token: 'refresh-token-refreshed',
        },
      });

    case 'VerifyMail': {
      const mail = variables.mail as { otp?: string };
      if (mail?.otp === '000000') {
        return fail('Invalid verification code');
      }
      return ok({ verifyMail: null });
    }

    case 'SendVerification':
      return ok({ sendVerification: null });

    case 'GetUsers': {
      const params = variables.params as
        { search?: string; page?: number; limit?: number } | undefined;
      const items = store.users.map((user) => ({
        id: user.id,
        email: user.email,
        profile: {
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          avatar: user.profile.avatar,
        },
        department: user.department ? { id: user.department.id, name: user.department.name } : null,
        position: user.position ? { id: user.position.id, name: user.position.name } : null,
      }));
      return ok({ users: paginate(items, params) });
    }

    case 'GetUserProfile': {
      const userId = String(variables.userId);
      const user = findUser(store, userId === 'me' ? currentUser.id : userId);
      if (!user) return fail('User not found');
      return ok({ user });
    }

    case 'GetDepartments':
      return ok({ departments: paginate(departments, variables.params as never) });

    case 'GetPositions':
    case 'GetRoleOptions':
      return ok({ positions: paginate(positions, variables.params as never) });

    case 'UpdateProfile': {
      const profile = variables.profile as {
        userId: string;
        first_name?: string;
        last_name?: string;
      };
      const user = findUser(store, profile.userId);
      if (!user) return fail('User not found');
      user.profile.first_name = profile.first_name ?? user.profile.first_name;
      user.profile.last_name = profile.last_name ?? user.profile.last_name;
      user.profile.full_name =
        `${user.profile.first_name ?? ''} ${user.profile.last_name ?? ''}`.trim();
      return ok({
        updateProfile: {
          id: user.profile.id,
          first_name: user.profile.first_name,
          last_name: user.profile.last_name,
          full_name: user.profile.full_name,
          avatar: user.profile.avatar,
        },
      });
    }

    case 'UpdateUser': {
      const input = variables.user as {
        userId: string;
        departmentId: string;
        positionId: string;
      };
      const user = findUser(store, input.userId);
      if (!user) return fail('User not found');
      const department = departments.find((item) => item.id === input.departmentId) ?? null;
      const position = positions.find((item) => item.id === input.positionId) ?? null;
      user.department = department
        ? { id: department.id, created_at: '1704067200000', name: department.name }
        : null;
      user.position = position
        ? { id: position.id, created_at: '1704067200000', name: position.name }
        : null;
      return ok({
        updateUser: {
          id: user.id,
          department: user.department,
          position: user.position,
        },
      });
    }

    case 'UploadAvatar': {
      const avatar = variables.avatar as { userId: string };
      const user = findUser(store, avatar.userId);
      if (!user) return fail('User not found');
      user.profile.avatar = 'https://cdn.example.com/avatar.png';
      return ok({ uploadAvatar: user.profile.avatar });
    }

    case 'DeleteAvatar': {
      const avatar = variables.avatar as { userId: string };
      const user = findUser(store, avatar.userId);
      if (!user) return fail('User not found');
      user.profile.avatar = null;
      return ok({ deleteAvatar: true });
    }

    case 'GetProfileSkills': {
      const userId = String(variables.userId);
      return ok({
        profile: {
          id: `profile-${userId}`,
          skills: store.profileSkills[userId] ?? [],
        },
      });
    }

    case 'GetSkillCategories':
    case 'GetPreviewCategories':
      return ok({ skillCategories });

    case 'GetSkillsCatalog':
      return ok({ skills: paginate(skillsCatalog, variables.params as never) });

    case 'AddProfileSkill': {
      const skill = variables.skill as {
        userId: string;
        name: string;
        categoryId?: string | null;
        mastery: MockSkillMastery;
      };
      const next = [
        ...(store.profileSkills[skill.userId] ?? []),
        {
          name: skill.name,
          categoryId: skill.categoryId ?? null,
          mastery: skill.mastery,
        },
      ];
      store.profileSkills[skill.userId] = next;
      return ok({ addProfileSkill: { id: `profile-${skill.userId}`, skills: next } });
    }

    case 'UpdateProfileSkill': {
      const skill = variables.skill as {
        userId: string;
        name: string;
        categoryId?: string | null;
        mastery: MockSkillMastery;
      };
      const next = (store.profileSkills[skill.userId] ?? []).map((item) =>
        item.name === skill.name
          ? { ...item, mastery: skill.mastery, categoryId: skill.categoryId ?? item.categoryId }
          : item
      );
      store.profileSkills[skill.userId] = next;
      return ok({ updateProfileSkill: { id: `profile-${skill.userId}`, skills: next } });
    }

    case 'DeleteProfileSkill': {
      const skill = variables.skill as { userId: string; name: string[] };
      const next = (store.profileSkills[skill.userId] ?? []).filter(
        (item) => !skill.name.includes(item.name)
      );
      store.profileSkills[skill.userId] = next;
      return ok({ deleteProfileSkill: { id: `profile-${skill.userId}`, skills: next } });
    }

    case 'GetProfileLanguages': {
      const userId = String(variables.userId);
      return ok({
        profile: {
          id: `profile-${userId}`,
          languages: store.profileLanguages[userId] ?? [],
        },
      });
    }

    case 'GetLanguagesCatalog':
      return ok({ languages: paginate(languagesCatalog, variables.params as never) });

    case 'AddProfileLanguage': {
      const language = variables.language as {
        userId: string;
        name: string;
        proficiency: MockProficiency;
      };
      const next = [
        ...(store.profileLanguages[language.userId] ?? []),
        { name: language.name, proficiency: language.proficiency },
      ];
      store.profileLanguages[language.userId] = next;
      return ok({ addProfileLanguage: { id: `profile-${language.userId}`, languages: next } });
    }

    case 'UpdateProfileLanguage': {
      const language = variables.language as {
        userId: string;
        name: string;
        proficiency: MockProficiency;
      };
      const next = (store.profileLanguages[language.userId] ?? []).map((item) =>
        item.name === language.name ? { ...item, proficiency: language.proficiency } : item
      );
      store.profileLanguages[language.userId] = next;
      return ok({
        updateProfileLanguage: { id: `profile-${language.userId}`, languages: next },
      });
    }

    case 'DeleteProfileLanguage': {
      const language = variables.language as { userId: string; name: string[] };
      const next = (store.profileLanguages[language.userId] ?? []).filter(
        (item) => !language.name.includes(item.name)
      );
      store.profileLanguages[language.userId] = next;
      return ok({
        deleteProfileLanguage: { id: `profile-${language.userId}`, languages: next },
      });
    }

    case 'GetUserCvs': {
      const userId = String(variables.userId);
      const params = variables.params as
        { search?: string; page?: number; limit?: number } | undefined;
      const items = store.cvs
        .filter((cv) => cv.user.id === userId)
        .map(({ id, name, education, description, user }) => ({
          id,
          name,
          education,
          description,
          user,
        }));
      return ok({ cvsByUserId: paginate(items, params) });
    }

    case 'CreateCv': {
      const cv = variables.cv as {
        userId?: string;
        name: string;
        education: string;
        description: string;
      };
      const owner = findUser(store, cv.userId ?? currentUser.id) ?? currentUser;
      const created = createEmptyCv(owner, cv);
      store.cvs.unshift(created);
      store.cvSkills[created.id] = [];
      store.cvProjects[created.id] = [];
      return ok({
        createCv: {
          id: created.id,
          name: created.name,
          education: created.education,
          description: created.description,
          user: created.user,
        },
      });
    }

    case 'UpdateCv': {
      const cv = variables.cv as {
        cvId: string;
        name: string;
        education: string;
        description: string;
      };
      const existing = findCv(store, cv.cvId);
      if (!existing) return fail('CV not found');
      existing.name = cv.name;
      existing.education = cv.education;
      existing.description = cv.description;
      return ok({
        updateCv: {
          id: existing.id,
          name: existing.name,
          education: existing.education,
          description: existing.description,
          user: existing.user,
        },
      });
    }

    case 'DeleteCv': {
      const cv = variables.cv as { cvId: string };
      store.cvs = store.cvs.filter((item) => item.id !== cv.cvId);
      delete store.cvSkills[cv.cvId];
      delete store.cvProjects[cv.cvId];
      return ok({ deleteCv: { affected: 1 } });
    }

    case 'GetCvDetails': {
      const cv = findCv(store, String(variables.cvId));
      if (!cv) return fail('CV not found');
      return ok({
        cv: {
          __typename: 'Cv',
          id: cv.id,
          name: cv.name,
          education: cv.education,
          description: cv.description,
          user: { ...cv.user, __typename: 'User' },
        },
      });
    }

    case 'GetCvSkills': {
      const cvId = String(variables.cvId);
      return ok({
        cv: {
          __typename: 'Cv',
          id: cvId,
          skills: store.cvSkills[cvId] ?? [],
        },
      });
    }

    case 'AddCvSkill': {
      const skill = variables.skill as {
        cvId: string;
        name: string;
        categoryId?: string | null;
        mastery: MockSkillMastery;
      };
      const next = [
        ...(store.cvSkills[skill.cvId] ?? []),
        {
          name: skill.name,
          categoryId: skill.categoryId ?? null,
          mastery: skill.mastery,
        },
      ];
      store.cvSkills[skill.cvId] = next;
      return ok({ addCvSkill: { id: skill.cvId, skills: next } });
    }

    case 'UpdateCvSkill': {
      const skill = variables.skill as {
        cvId: string;
        name: string;
        categoryId?: string | null;
        mastery: MockSkillMastery;
      };
      const next = (store.cvSkills[skill.cvId] ?? []).map((item) =>
        item.name === skill.name
          ? { ...item, mastery: skill.mastery, categoryId: skill.categoryId ?? item.categoryId }
          : item
      );
      store.cvSkills[skill.cvId] = next;
      return ok({ updateCvSkill: { id: skill.cvId, skills: next } });
    }

    case 'DeleteCvSkill': {
      const skill = variables.skill as { cvId: string; name: string[] };
      const next = (store.cvSkills[skill.cvId] ?? []).filter(
        (item) => !skill.name.includes(item.name)
      );
      store.cvSkills[skill.cvId] = next;
      return ok({ deleteCvSkill: { id: skill.cvId, skills: next } });
    }

    case 'GetCvProjects': {
      const cvId = String(variables.cvId);
      return ok({
        cv: {
          __typename: 'Cv',
          id: cvId,
          projects: store.cvProjects[cvId] ?? [],
        },
      });
    }

    case 'GetProjectsCatalog':
      return ok({ projects: paginate(projectsCatalog, variables.params as never) });

    case 'AddCvProject': {
      const project = variables.project as {
        cvId: string;
        projectId: string;
        start_date: string;
        end_date?: string | null;
        roles: string[];
        responsibilities: string[];
      };
      const catalog = projectsCatalog.find((item) => item.id === project.projectId);
      if (!catalog) return fail('Project not found');
      const created = {
        __typename: 'CvProject' as const,
        id: `cvp-${Date.now()}`,
        name: catalog.name,
        domain: catalog.domain,
        description: catalog.description,
        start_date: project.start_date,
        end_date: project.end_date ?? null,
        environment: catalog.environment,
        roles: project.roles,
        responsibilities: project.responsibilities,
        project: { ...catalog },
      };
      const next = [...(store.cvProjects[project.cvId] ?? []), created];
      store.cvProjects[project.cvId] = next;
      return ok({
        addCvProject: { __typename: 'Cv', id: project.cvId, projects: next },
      });
    }

    case 'UpdateCvProject': {
      const project = variables.project as {
        cvId: string;
        projectId: string;
        start_date: string;
        end_date?: string | null;
        roles: string[];
        responsibilities: string[];
      };
      const next = (store.cvProjects[project.cvId] ?? []).map((item) =>
        item.project.id === project.projectId || item.id === project.projectId
          ? {
              ...item,
              start_date: project.start_date,
              end_date: project.end_date ?? null,
              roles: project.roles,
              responsibilities: project.responsibilities,
            }
          : item
      );
      store.cvProjects[project.cvId] = next;
      return ok({
        updateCvProject: { __typename: 'Cv', id: project.cvId, projects: next },
      });
    }

    case 'RemoveCvProject': {
      const project = variables.project as { cvId: string; projectId: string };
      const next = (store.cvProjects[project.cvId] ?? []).filter(
        (item) => item.id !== project.projectId && item.project.id !== project.projectId
      );
      store.cvProjects[project.cvId] = next;
      return ok({
        removeCvProject: { __typename: 'Cv', id: project.cvId, projects: next },
      });
    }

    case 'GetCvPreview': {
      const cv = findCv(store, String(variables.cvId));
      if (!cv) return fail('CV not found');
      const owner = findUser(store, cv.user.id) ?? currentUser;
      return ok({
        cv: {
          __typename: 'Cv',
          id: cv.id,
          name: cv.name,
          education: cv.education,
          description: cv.description,
          skills: store.cvSkills[cv.id] ?? cv.skills,
          projects: store.cvProjects[cv.id] ?? cv.projects,
          user: {
            __typename: 'User',
            id: owner.id,
            email: owner.email,
            position: owner.position
              ? { __typename: 'Position', id: owner.position.id, name: owner.position.name }
              : null,
            profile: {
              __typename: 'Profile',
              id: owner.profile.id,
              first_name: owner.profile.first_name,
              last_name: owner.profile.last_name,
              full_name: owner.profile.full_name,
              languages: store.profileLanguages[owner.id] ?? owner.profile.languages,
            },
          },
        },
      });
    }

    case 'ExportPdf':
      return ok({
        exportPdf: Buffer.from('%PDF-1.4 mock').toString('base64'),
      });

    case 'ChangePassword': {
      const args = variables.args as { oldPassword?: string };
      if (args?.oldPassword === 'wrong-password') {
        return fail('Current password is incorrect');
      }
      return ok({ changePassword: { id: currentUser.id } });
    }

    default:
      return fail(`Unhandled GraphQL operation: ${operation || 'unknown'}`);
  }
}

export async function mockGraphQl(page: Page, store: GraphQlStore = createStore()) {
  const handler = createGraphQlHandler(store);
  await page.route(GRAPHQL_URL, handler);
  await page.route(/\/graphql(?:\?|$)/i, handler);
  return store;
}
