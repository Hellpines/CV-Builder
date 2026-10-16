export type UserRole = 'Employee' | 'Admin';

export type Proficiency = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Native';

export type Mastery = 'Novice' | 'Advanced' | 'Competent' | 'Proficient' | 'Expert';

export interface UserProfile {
  first_name?: string | null;
  last_name?: string | null;
  avatar?: string | null;
}

export interface SkillMastery {
  name: string;
  categoryId: string | null;
  mastery: Mastery;
}

export interface LanguageProficiency {
  name: string;
  proficiency: Proficiency;
}

export interface Profile {
  id: string;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar: string | null;
  skills: SkillMastery[];
  languages: LanguageProficiency[];
  email: string | null;
  is_verified: boolean | null;
  role: UserRole | null;
}

export interface Department {
  id: string;
  created_at: string;
  name: string;
}

export interface Position {
  id: string;
  created_at: string;
  name: string;
}

export interface CvProject {
  id: string;
  project: Project;
  name: string;
  internal_name: string;
  description: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  environment: string[];
  roles: string[];
  responsibilities: string[];
}

export interface Cv {
  id: string;
  created_at: string;
  name: string;
  education: string | null;
  description: string;
  user: User | null;
  projects: CvProject[] | null;
  skills: SkillMastery[];
  languages: LanguageProficiency[];
}

export interface Project {
  id: string;
  created_at: string;
  name: string;
  internal_name: string;
  domain: string;
  start_date: string;
  end_date: string | null;
  description: string;
  environment: string[];
}

export interface User {
  id: string;
  created_at: string;
  email: string;
  is_verified: boolean;
  profile: Profile;
  role: UserRole;
  department: Department | null;
  position: Position | null;
  cvs: Cv[] | null;
}

export interface PaginatedUsers {
  items: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UsersQueryParams {
  search?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}
