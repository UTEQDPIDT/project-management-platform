'use client';

import { useGetAllEvents } from '@/hooks/events';
import { IEvent } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from './ui/data-table';
import LoadingMessage from './loading-message';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import Link from 'next/link';

const columns: ColumnDef<IEvent>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
  },
  {
    accessorKey: 'organization',
    header: 'Organización',
  },
  {
    accessorKey: 'startDate',
    header: 'Fechas',
    cell: ({ row }) => {
      const date = format(row.getValue('startDate'), "d',' MMM 'del' yyyy", {
        locale: es,
      });

      return <div>{date}</div>;
    },
  },
  {
    accessorKey: 'participants',
    header: 'Participantes',
  },
  {
    accessorKey: 'report',
    header: 'Reporte',
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const event = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/admin/eventos/${event._id}/editar`}>
                <Pencil /> Editar evento
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="hover:text-destructive-foreground"
            >
              <Dialog>
                <DialogTrigger className="px-0 group items-start font-normal hover:text-destructive-foreground">
                  <Trash className="text-muted-foreground group:hover:text-destructive-foreground" />{' '}
                  Eliminar evento
                </DialogTrigger>
                <DialogContent>
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{event.name}</DialogTitle>
                  <DialogDescription>
                    ¿Seguro deseas eliminar el evento? Esta es una operación
                    irreversible.
                  </DialogDescription>
                  <div className="flex gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive">Eliminar</Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function EventsTable() {
  const { data: events, isLoading: loadingEvents } = useGetAllEvents();

  return (
    <div className="flex items-center justify-center px-4">
      {loadingEvents ? (
        <LoadingMessage message="Cargando eventos" />
      ) : (
        <DataTable columns={columns} data={events} />
      )}
    </div>
  );
}
