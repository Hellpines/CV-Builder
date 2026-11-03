import { CvProjectsPage } from '@/features/cvs/ui/CvProjectsPage';

export const instant = false;

export default async function CvProjects({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CvProjectsPage cvId={id} />;
}
