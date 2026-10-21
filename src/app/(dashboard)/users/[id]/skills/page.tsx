import { SkillsPage } from '@/features/skills/ui/SkillsPage';

export const instant = false;

export default async function UserSkills({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SkillsPage userId={id} />;
}
