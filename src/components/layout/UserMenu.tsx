'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApolloClient } from '@apollo/client/react';
import { LogOut, Settings, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/features/auth/model/useAuthStore';

export function UserMenu() {
  const router = useRouter();
  const client = useApolloClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const profile = user?.profile;
  const avatar = profile?.avatar || '';
  const profileFirstName = profile?.first_name || '';
  const profileLastName = profile?.last_name || '';
  const initials = `${profileFirstName[0] || ''}${profileLastName[0] || ''}`.toUpperCase() || 'U';
  const displayName = profile?.full_name || profile?.first_name || profile?.last_name || 'No name';

  const handleLogout = async () => {
    logout();
    await client.clearStore();
    router.replace('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-2 px-4 text-left">
        {avatar ? (
          <Image
            src={avatar}
            alt={displayName}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="bg-muted text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-medium">
            {initials}
          </div>
        )}
        <p className="text-primary-bold truncate">{displayName}</p>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="start" sideOffset={8}>
        <DropdownMenuItem render={<Link href={`/users/${user?.id}`} />}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
