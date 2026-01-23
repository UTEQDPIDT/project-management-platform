'useClient';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { DoorOpen, Ellipsis, Pencil, Trash } from 'lucide-react';
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
import { useDeleteEvent, useExitEvent } from '@/hooks/events';
import { Badge } from './ui/badge';
import { userProfile } from 'context/profile-provider';
import { UserRole } from '@repo/types';

export function EventMenu({
  eventId,
  name,
}: {
  eventId: string;
  name: string;
}) {
  const { user } = userProfile();
  const deleteEvent = useDeleteEvent();
  const exitEvent = useExitEvent();

  const handleExitEvent = () => {
    exitEvent.mutate({ eventId, userId: user._id });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'icon-sm'}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {user.role === UserRole.ADMIN ? (
            <div className="flex flex-col gap-1">
              <DropdownMenuItem asChild>
                <Link href={`/admin/eventos/${eventId}/editar`}>
                  <Pencil />
                  Editar evento
                </Link>
              </DropdownMenuItem>
              <Dialog>
                <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
                  <Trash /> Eliminar evento
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <Badge variant="destructive">Eliminando</Badge>
                    <DialogTitle>{name}</DialogTitle>
                    <DialogDescription>
                      ¿Seguro deseas eliminar el evento? Esta es una acción
                      irreversible.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        deleteEvent.mutate(eventId);
                      }}
                    >
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            <DropdownMenuItem onClick={handleExitEvent}>
              <DoorOpen /> Salir del evento
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
