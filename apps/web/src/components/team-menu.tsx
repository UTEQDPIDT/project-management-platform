'useClient';

import React from 'react';
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
import { useDeleteTeam } from '@/hooks/team';
import { useRouter } from 'next/navigation';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import { userProfile } from 'context/profile-provider';

export function TeamMenu({ teamId, name }: { teamId: string; name: string }) {
  const deleteTeam = useDeleteTeam();
  const router = useRouter();
  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Button
            className="font-normal w-full justify-start"
            variant="ghost"
            asChild
          >
            <Link href={`${baseUrl}/equipos/${teamId}/editar`}>
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
                    router.push(`${baseUrl}/equipos`);
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
