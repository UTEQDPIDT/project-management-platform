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

export function TeamMenu({ teamId, name }: { teamId: string; name: string }) {
  const deleteTeam = useDeleteTeam();
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={'icon'}>
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
            <Link href={`/user/equipos/${teamId}/editar`}>
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
                  ¿Seguro deseas eliminar el equipo? Esta es una acción
                  irreversible.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  disabled={deleteTeam.isPending}
                  variant="destructive"
                  onClick={() => {
                    deleteTeam.mutate(teamId);
                    router.push('/user/equipos');
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
