'use client';

import { useEffect, useState } from 'react';
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
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Button } from './ui/button';
import { Arrow as PopoverArrow } from '@radix-ui/react-popover';

export function OpenMobileSidebarForProfileReminder() {
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    const url = new URL(window.location.href);
    if (
      url.searchParams.get('profileReminder') === '1' &&
      window.matchMedia('(max-width: 767px)').matches
    ) {
      setOpenMobile(true);
    }
  }, [setOpenMobile]);

  return null;
}

export function NavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUserProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);
  const [mounted, setMounted] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(max-width: 767px)').matches && !isMobile) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get('profileReminder') !== '1') return;
    setReminderOpen(true);
    url.searchParams.delete('profileReminder');
    window.history.replaceState(window.history.state, '', url);
  }, [isMobile]);

  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <ProfileInfo
              givenName={user.givenName}
              familyName={user.familyName}
              email={user.email}
              avatarUrl={user.avatarUrl}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Popover open={reminderOpen} onOpenChange={setReminderOpen}>
          <DropdownMenu
            onOpenChange={(open) => {
              if (open) setReminderOpen(false);
            }}
          >
            <PopoverAnchor asChild>
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
            </PopoverAnchor>
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
          <PopoverContent
            side={isMobile ? 'top' : 'right'}
            align="end"
            sideOffset={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <PopoverArrow className="fill-popover stroke-border" />
            <p className="font-semibold">Conoce tu perfil</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Abre el menú de usuario para explorar tu perfil y actualizar tus
              datos.
            </p>
            <Button
              className="mt-3"
              size="sm"
              onClick={() => setReminderOpen(false)}
            >
              Entendido
            </Button>
          </PopoverContent>
        </Popover>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
