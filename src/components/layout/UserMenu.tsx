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

export function UserMenu({ isOpen }: { isOpen: boolean }) {
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

  const itemClass = isOpen ? undefined : 'justify-center px-0';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="block w-full text-left outline-none">
        <span className="flex items-center gap-2 px-2">
          {avatar ? (
            <Image
              src={avatar}
              alt={displayName}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="bg-muted text-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-medium">
              {initials}
            </span>
          )}
          {isOpen && <span className="text-foreground truncate">{displayName}</span>}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        positionerClassName={isOpen ? 'w-48' : 'w-14'}
      >
        <DropdownMenuItem render={<Link href={`/users/${user?.id}`} />} className={itemClass}>
          <User size={20} />
          {isOpen && <span>Profile</span>}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />} className={itemClass}>
          <Settings size={20} />
          {isOpen && <span>Settings</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className={itemClass}>
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
