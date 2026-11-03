import { LanguagesPage } from '@/features/languages/ui/LanguagesPage';

export const instant = false;

export default async function UserLanguages({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LanguagesPage userId={id} />;
}
