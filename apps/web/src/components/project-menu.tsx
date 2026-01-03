'useClient';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { useDeleteTeam } from '@/hooks/team';
import { useRouter } from 'next/navigation';
import { useDeleteProject } from '@/hooks/projects';

export function ProjectMenu({
  projectId,
  name,
}: {
  projectId: string;
  name: string;
}) {
  const deleteProject = useDeleteProject();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon-sm'}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <Button
            className="font-normal w-full justify-start"
            variant="ghost"
            asChild
          >
            <Link href={`/user/proyectos/${projectId}/editar`}>
              <Pencil />
              Editar
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger className="font-normal border-transparent hover:text-destructive-foreground w-full justify-start">
              <Trash /> Eliminar
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
                    router.push('/user/proyectos');
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
