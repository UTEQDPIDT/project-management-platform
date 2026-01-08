'use client';

import { House, Users, Contact, Calendar, Folder, File } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar';
import Link from 'next/link';
import { NavLogo } from './nav-logo';
import { NavUser } from './nav-user';
import { usePathname } from 'next/navigation';

const items = [
  { title: 'Inicio', url: '/admin/inicio', icon: House },
  { title: 'Usuarios', url: '/admin/usuarios', icon: Contact },
  { title: 'Equipos', url: '/admin/equipos', icon: Users },
  { title: 'Proyectos', url: '/admin/proyectos', icon: Folder },
  { title: 'Eventos', url: '/admin/eventos', icon: Calendar },
  { title: 'Archivos', url: '/admin/archivos', icon: File },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
