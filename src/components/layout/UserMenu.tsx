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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center gap-2 text-left outline-none ${
          isOpen ? 'w-full' : 'w-10 justify-center'
        }`}
      >
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
        {isOpen && <p className="text-primary-bold truncate">{displayName}</p>}
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" align="center" sideOffset={8}>
        <DropdownMenuItem render={<Link href={`/users/${user?.id}`} />}>
          <User size={20} />
          {isOpen && <span>Profile</span>}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings size={20} />
          {isOpen && <span>Settings</span>}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut size={20} />
          {isOpen && <span>Logout</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
