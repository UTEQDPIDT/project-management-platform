'useClient';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Ellipsis, Pencil, Trash } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { useRouter } from 'next/navigation';
import { useDeleteProject } from '@/hooks/projects';
import { userProfile } from 'context/profile-provider';
import { UserRole } from '@repo/types';

export function ProjectMenu({
  projectId,
  name,
}: {
  projectId: string;
  name: string;
}) {
  const deleteProject = useDeleteProject();
  const router = useRouter();
  const { user } = userProfile();
  const rootUrl = user.role === UserRole.ADMIN ? '/admin' : '/user';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon-sm'}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <Button
            className="has-[>svg]:px-2 [&_svg]:text-muted-foreground px-0 h-8 border-transparent w-full justify-start font-normal"
            variant="ghost"
            asChild
          >
            <Link href={`${rootUrl}/proyectos/${projectId}/editar`}>
              <Pencil />
              Editar proyecto
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
              <Trash /> Eliminar proyecto
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Eliminar: {name}</DialogTitle>
                <DialogDescription>
                  ¿Seguro deseas eliminar el proyecto? Esta es una acción
                  irreversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  disabled={deleteProject.isPending}
                  variant="destructive"
                  onClick={() => {
                    deleteProject.mutate(projectId);
                    router.push(`${rootUrl}/proyectos`);
                  }}
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
