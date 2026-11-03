import { ProfileLayout } from '@/features/profile/ui/ProfileLayout';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return <ProfileLayout>{children}</ProfileLayout>;
}
