'use client';

import { House, Users, Folder, Calendar, Shapes } from 'lucide-react';
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

// Menu items
const items = [
  { title: 'Inicio', url: '/user/inicio', icon: House },
  { title: 'Equipos', url: '/user/equipos', icon: Users },
  { title: 'Proyectos', url: '/user/proyectos', icon: Folder },
  {
    title: 'Productos Independientes',
    url: '/user/productos-independientes',
    icon: Shapes,
  },
  { title: 'Eventos', url: '/user/eventos', icon: Calendar },
];

export function UserSidebar() {
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
