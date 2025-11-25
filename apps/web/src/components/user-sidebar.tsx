import { House, Users, Folders, Calendar } from 'lucide-react';
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

// Menu items
const items = [
  { title: 'Inicio', url: '/user', icon: House },
  { title: 'Equipos', url: '/user/equipos', icon: Users },
  { title: 'Proyectos', url: '/user/proyectos', icon: Folders },
  { title: 'Eventos', url: '/user/eventos', icon: Calendar },
];

export function UserSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
        <NavUser name="Aeon Julien" email="aeonruiz@uteq.edu.mx" />
      </SidebarFooter>
    </Sidebar>
  );
}
