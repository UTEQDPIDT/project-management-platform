'use client';

import { useDeleteEvent, useGetAllEvents } from '@/hooks/events';
import { EventType, IEvent } from '@repo/types';
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
import {
  ArrowUpRight,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Badge } from './ui/badge';
import Link from 'next/link';
import AvatarRow from './avatar-row';
import { ProfileInfo } from './profile-info';

const columns: ColumnDef<IEvent>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
  },
  {
    accessorKey: 'isPrivate',
    header: 'Acceso',
    cell: ({ row }) => {
      const event = row.original;
      const { isPrivate } = event;

      return (
        <div>
          {isPrivate ? (
            <Badge variant="purple">Privado</Badge>
          ) : (
            <Badge variant="blue">Público</Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
    cell: ({ row }) => {
      const event = row.original;
      const { type } = event;

      return (
        <div>
          <Badge variant="outline">{type}</Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'organization',
    header: 'Organización',
  },
  {
    id: 'fechas',
    header: 'Fechas',
    cell: ({ row }) => {
      const event = row.original;

      const date = event.endDate ? (
        <div>
          {format(event.startDate, "d 'de' MMMM 'al' ", { locale: es })}
          {format(event.endDate, "d 'de' MMMM 'del' yyyy", { locale: es })}
        </div>
      ) : (
        <div>
          {format(event.startDate, "d',' MMM 'del' yyyy", { locale: es })}
        </div>
      );
      return date;
    },
  },
  {
    accessorKey: 'location',
    header: 'Ubicación',
    cell: ({ row }) => {
      const location = String(row.getValue('location'));

      return (
        <div className="flex gap-1 items-center justify-center">
          <span>{location}</span>
          <Button
            size="icon-sm"
            variant="ghost"
            title="Copiar la ubicación"
            onClick={() => navigator.clipboard.writeText(location)}
          >
            <Copy />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'participants',
    header: 'Participantes',
    cell: ({ row }) => {
      const event = row.original;
      const { participants } = event;
      return <AvatarRow profiles={participants} />;
    },
  },
  {
    accessorKey: 'activities',
    header: 'No. Actividades',
    cell: ({ row }) => {
      const event = row.original;
      const { activities } = event;

      return <div>{activities?.length}</div>;
    },
  },
  {
    accessorKey: 'products',
    header: 'No. Productos',
    cell: ({ row }) => {
      const event = row.original;
      const { products } = event;

      return <div>{products?.length}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Creado el',
    cell: ({ row }) => {
      const date = format(
        row.getValue('createdAt'),
        "d',' MMM 'del' yyyy kk':'mm",
        {
          locale: es,
        },
      );

      return <div>{date}</div>;
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'Creado por',
    cell: ({ row }) => {
      const event = row.original;
      const { createdBy } = event;

      return (
        <div className="w-52">
          <ProfileInfo
            size="sm"
            givenName={createdBy.givenName}
            familyName={createdBy.familyName}
            avatarUrl={createdBy.avatarUrl}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Editado el',
    cell: ({ row }) => {
      const date = format(
        row.getValue('updatedAt'),
        "d',' MMM 'del' yyyy kk':'mm",
        {
          locale: es,
        },
      );

      return <div>{date}</div>;
    },
  },
  {
    accessorKey: 'updatedBy',
    header: 'Editado por',
    cell: ({ row }) => {
      const event = row.original;
      const { createdBy: updatedBy } = event;

      return (
        <div className="w-52">
          <ProfileInfo
            size="sm"
            givenName={updatedBy.givenName}
            familyName={updatedBy.familyName}
            avatarUrl={updatedBy.avatarUrl}
          />
        </div>
      );
    },
  },
  {
    accessorKey: 'report',
    header: 'Reporte',
    cell: ({ row }) => {
      const event = row.original;
      const report = event.report;

      return (
        <div>
          {report ? (
            <div>reporte</div>
          ) : (
            <span className="text-sm text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const event = row.original;
      const deleteEvent = useDeleteEvent();

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
            <DropdownMenuItem asChild>
              <Link href={`/admin/eventos/${event._id}`}>
                <ExternalLink /> Visitar evento
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="hover:text-destructive-foreground"
            >
              <Dialog>
                <DialogTrigger className="group items-center justify-start p-0 font-normal hover:text-destructive-foreground">
                  <Trash className="text-muted-foreground group-hover:text-destructive-foreground" />{' '}
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
                      <Button
                        onClick={() => deleteEvent.mutate(event._id)}
                        variant="destructive"
                      >
                        Eliminar
                      </Button>
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
    <div className="flex items-center justify-center px-4 max-w-7xl">
      {loadingEvents ? (
        <LoadingMessage message="Cargando eventos" />
      ) : (
        <DataTable columns={columns} data={events} />
      )}
    </div>
  );
}
