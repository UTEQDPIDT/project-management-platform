'useClient';

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { UserRole } from '@repo/types';

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
          {user.role === UserRole.ADMIN && (
            <>
              <DropdownMenuItem asChild>
                <Link href={`${baseUrl}/equipos/${teamId}/editar`}>
                  <Pencil />
                  Editar equipo
                </Link>
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
                  <Trash /> Eliminar equipo
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
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
