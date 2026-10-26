import type { SkillMastery } from '@/shared/types/user';
import type { PreviewCategory } from '../types/CvPreviewTypes';

interface CategoryInfo {
  id: string;
  name: string;
  order: number;
}

export interface PreviewSkillBucket extends CategoryInfo {
  rootOrder: number;
  skills: SkillMastery[];
}

const OTHER: CategoryInfo = { id: 'other', name: 'Other', order: Number.MAX_SAFE_INTEGER };

function indexCategories(categories: PreviewCategory[]) {
  const byId = new Map<string, CategoryInfo>();
  const parentOf = new Map<string, string>();

  const visit = (category: PreviewCategory, parentId?: string) => {
    byId.set(category.id, { id: category.id, name: category.name, order: category.order });
    if (parentId) parentOf.set(category.id, parentId);
    if (category.parent) {
      visit(category.parent);
      parentOf.set(category.id, category.parent.id);
    }
    category.children?.forEach((child) => visit(child, category.id));
  };
  categories.forEach((category) => visit(category));

  const rootOf = (id: string): CategoryInfo | undefined => {
    const seen = new Set<string>();
    let current = id;
    while (parentOf.has(current) && !seen.has(current)) {
      seen.add(current);
      current = parentOf.get(current) as string;
    }
    return byId.get(current);
  };

  return { byId, rootOf };
}

function toBuckets(
  entries: { key: CategoryInfo; root: CategoryInfo; skill: SkillMastery }[]
): PreviewSkillBucket[] {
  const buckets = new Map<string, PreviewSkillBucket>();

  for (const { key, root, skill } of entries) {
    const bucket = buckets.get(key.id) ?? { ...key, rootOrder: root.order, skills: [] };
    bucket.skills.push(skill);
    buckets.set(key.id, bucket);
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.rootOrder === b.rootOrder ? a.order - b.order : a.rootOrder < b.rootOrder ? -1 : 1
  );
}

export function groupPreviewSkills(skills: SkillMastery[], categories: PreviewCategory[]) {
  const { byId, rootOf } = indexCategories(categories);

  const resolved = skills.map((skill) => {
    const leaf = skill.categoryId ? byId.get(skill.categoryId) : undefined;
    const root = leaf ? (rootOf(leaf.id) ?? leaf) : OTHER;
    return { skill, leaf: leaf ?? OTHER, root };
  });

  return {
    byRoot: toBuckets(resolved.map(({ skill, root }) => ({ key: root, root, skill }))),
    byCategory: toBuckets(resolved.map(({ skill, leaf, root }) => ({ key: leaf, root, skill }))),
  };
}
