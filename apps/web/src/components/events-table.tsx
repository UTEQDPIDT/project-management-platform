'use client';

import { useDeleteEvent, useGetAllEvents } from '@/hooks/events';
import { FilePurpose, IEvent, IFile } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import {
  DataTable,
  facetedFilter,
  type FacetedFilterConfig,
} from './ui/data-table';
import LoadingMessage from './loading-message';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import {
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
import CopyButton from './ui/copy';
import { useFilesForEntity } from '@/hooks/files';
import FileButton from './file-button';
import { copyValue } from '@/lib/utils';

const EventFileButton = ({
  eventId,
  filePurpose,
}: {
  eventId: string;
  filePurpose: FilePurpose;
}) => {
  const { data: files = [], isLoading } = useFilesForEntity(eventId);

  const file = files.find((file: IFile) => file.purpose === filePurpose);

  return (
    <div>
      {isLoading ? (
        <LoadingMessage />
      ) : file ? (
        <FileButton canDelete file={file} className="max-w-72" />
      ) : (
        <span className="text-sm text-muted-foreground">Vacío</span>
      )}
    </div>
  );
};

const EventActions = (event: IEvent) => {
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
        <DropdownMenuItem onClick={() => copyValue(event._id)}>
          <Copy /> Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="hover:text-destructive-foreground">
          <Dialog>
            <DialogTrigger className="has-[>svg]:px-2 [&_svg]:text-muted-foreground hover:[&_svg]:text-destructive-foreground px-0 border-transparent w-full h-8 justify-start hover:text-destructive-foreground font-normal">
              <Trash />
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
};

const columns: ColumnDef<IEvent>[] = [
  {
    accessorKey: 'name',
    header: 'Nombre',
    cell: ({ row }) => {
      const { name } = row.original;

      return (
        <div className="flex gap-1 items-center justify-start group">
          <div className="max-w-72 truncate">
            <span>{name}</span>
          </div>
          <CopyButton
            valueToCopy={name}
            className="group-hover:opacity-100 opacity-0"
          />
        </div>
      );
    },
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
      const { location } = row.original;

      return (
        <div className="flex gap-1 items-center justify-start group">
          <div className="max-w-72 truncate">
            <span>{location}</span>
          </div>
          <CopyButton
            valueToCopy={location}
            className="group-hover:opacity-100 opacity-0"
          />
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
      return (
        <div>
          {participants.length ? (
            <AvatarRow profiles={participants} />
          ) : (
            <span className="text-sm text-muted-foreground">Vacío</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'products',
    header: 'Productos',
    cell: ({ row }) => {
      const event = row.original;
      const { products } = event;

      return <div>{products?.length}</div>;
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
    accessorKey: 'createdAt',
    header: 'Fecha de creación',
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
    accessorKey: 'updatedBy',
    header: 'Modificado por',
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
    accessorKey: 'updatedAt',
    header: 'Fecha de modificación',
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
    id: 'technical-report',
    header: 'Informe Técnico',
    cell: ({ row }) => {
      const event = row.original;

      return (
        <EventFileButton
          eventId={event._id}
          filePurpose={FilePurpose.EVENT_TECHNICAL_REPORT}
        />
      );
    },
  },
  {
    id: 'financial-report',
    header: 'Informe Financiero',
    cell: ({ row }) => {
      const event = row.original;

      return (
        <EventFileButton
          eventId={event._id}
          filePurpose={FilePurpose.EVENT_FINANCIAL_REPORT}
        />
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const event = row.original;

      return <EventActions {...event} />;
    },
  },
];

const facetedFilters: FacetedFilterConfig[] = [
  {
    columnId: 'type',
    title: 'Tipo de evento',
    options: [
      { value: 'interno', label: 'Interno' },
      { value: 'externo', label: 'Externo' },
    ],
  },
];

export function EventsTable() {
  const { data: events, isLoading: loadingEvents } = useGetAllEvents();

  return (
    <div className="max-w-6xl w-full">
      {loadingEvents ? (
        <LoadingMessage message="Cargando eventos" />
      ) : (
        <DataTable
          columns={columns}
          data={events}
          facetedFilters={facetedFilters}
        />
      )}
    </div>
  );
}
