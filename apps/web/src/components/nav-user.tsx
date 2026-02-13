'use client';

import { LogOut, CircleUserRound, EllipsisVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from './ui/sidebar';

import { logout } from '@/lib/auth/logout';
import Link from 'next/link';
import { ProfileInfo } from './profile-info';
import { useUserProfile } from 'context/profile-provider';
import { getBaseUrlBasedOnRole } from '@/lib/utils';

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ProfileInfo
                givenName={user.givenName}
                familyName={user.familyName}
                email={user.email}
                avatarUrl={user.avatarUrl}
              />
              <EllipsisVertical className="size-4 ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal px-2 py-1.5">
              <ProfileInfo
                givenName={user.givenName}
                familyName={user.familyName}
                email={user.email}
                avatarUrl={user.avatarUrl}
              />
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SidebarMenuButton asChild>
                <Link href={`${baseUrl}/perfil/${user._id}`}>
                  <CircleUserRound className="stroke-gray-500" />
                  <span>Perfil</span>
                </Link>
              </SidebarMenuButton>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
