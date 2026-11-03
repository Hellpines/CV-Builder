import { CvSkillsPage } from '@/features/skills/ui/CvSkillsPage';

export const instant = false;

export default async function CvSkills({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CvSkillsPage cvId={id} />;
}
