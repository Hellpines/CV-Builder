import { CvPreviewPage } from '@/features/cvs/ui/CvPreviewPage';

export const instant = false;

export default async function CvPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CvPreviewPage cvId={id} />;
}
