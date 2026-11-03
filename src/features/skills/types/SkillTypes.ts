export interface SkillCategory {
  id: string;
  name: string;
  order: number;
  children?: SkillCategory[];
}

export interface CatalogSkill {
  id: string;
  name: string;
  category: { id: string; name: string };
}
