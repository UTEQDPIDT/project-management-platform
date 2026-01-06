'useClient';

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
import { useDeleteEvent } from '@/hooks/events';
import { Badge } from './ui/badge';

export function EventMenu({
  eventId,
  name,
}: {
  eventId: string;
  name: string;
}) {
  const deleteEvent = useDeleteEvent();

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
            <Link href={`/admin/eventos/${eventId}/editar`}>
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
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
