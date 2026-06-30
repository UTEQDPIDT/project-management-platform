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
import React from 'react';

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
      <DropdownMenuTrigger asChild >
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
          <div className="flex items-center gap-2 w-full cursor-pointer">
            <Copy className="size-4" /> Copiar ID
          </div>
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
                ¿Seguro deseas eliminar el evento? Esta es una operación irreversible.
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
          <div className="max-w-40 sm:max-w-65 truncate">
            <span>{name}</span>
          </div>
          <CopyButton
            valueToCopy={name}
            className="group-hover:opacity-100 opacity-0 hidden sm:flex"
          />
        </div>
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
  {
    accessorKey: 'isPrivate',
    header: 'Acceso',
    meta: { className: 'whitespace-nowrap' }, // Siempre visible, pero evitamos que rompa línea
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
    meta: { className: 'hidden md:table-cell' }, // Visible desde tablets pequeñas (md)
  },
  {
    accessorKey: 'organization',
    header: 'Organización',
    meta: { className: 'hidden md:table-cell' }, // Visible desde tablets verticales (md)
  },
  {
    id: 'fechas',
    header: 'Fechas',
    meta: { className: 'hidden md:table-cell' },
    cell: ({ row }) => {
      const event = row.original;
      const start = new Date(event.startDate);

      if (event.endDate) {
        const end = new Date(event.endDate);
        return (
          <div className="whitespace-nowrap">
            {format(start, "d 'de' MMMM 'al' ", { locale: es })}
            {format(end, "d 'de' MMMM 'del' yyyy", { locale: es })}
          </div>
        );
      }

      return (
        <div className="whitespace-nowrap">
          {format(start, "d',' MMM 'del' yyyy", { locale: es })}
        </div>
      );
    },
  },
  {
    id: 'period',
    accessorFn: (event) => {
      const periodDate = event.endDate ?? event.startDate;
      const timestamp = periodDate ? new Date(periodDate).getTime() : NaN;
      if (Number.isNaN(timestamp)) return 'Sin año';
      return String(new Date(timestamp).getFullYear());
    },
    header: 'Periodo',
    filterFn: facetedFilter,
    meta: { className: 'hidden lg:table-cell' }, // Visible desde pantallas de laptop (lg)
    cell: ({ row }) => {
      const event = row.original;
      const start = new Date(event.startDate);
      if (event.endDate) {
        return <span>{new Date(event.endDate).getFullYear()}</span>;
      }
      return <span>{start.getFullYear()}</span>;
    },
  },
  {
    accessorKey: 'location',
    header: 'Ubicación',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => {
      const { location } = row.original;

      return (
        <div className="flex gap-1 items-center justify-start group">
          <div className="max-w-44 truncate">
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
    meta: { className: 'hidden xl:table-cell' }, // Visible solo en monitores grandes (xl)
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
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => {
      const event = row.original;
      const { products } = event;
      return <div>{products?.length}</div>;
    },
  },
  {
    accessorKey: 'createdBy',
    header: 'Creado por',
    meta: { className: 'hidden xl:table-cell' },
    cell: ({ row }) => {
      const event = row.original;
      const { createdBy } = event;

      if (!createdBy) {
        return <div className='w-35 text-muted-foreground'>Vacío</div>;
      }

      return (
        <div className="w-35">
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
    meta: { className: 'hidden xl:table-cell' },
    cell: ({ row }) => {
      const date = format(
        new Date(row.getValue('createdAt')),
        "d',' MMM 'del' yyyy kk':'mm",
        { locale: es },
      );
      return <div className="whitespace-nowrap">{date}</div>;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Fecha de modificación',
    meta: { className: 'hidden xl:table-cell' },
    cell: ({ row }) => {
      const date = format(
        new Date(row.getValue('updatedAt')),
        "d',' MMM 'del' yyyy kk':'mm",
        { locale: es },
      );
      return <div className="whitespace-nowrap">{date}</div>;
    },
  },
  {
    id: 'technical-report',
    header: 'Informe Técnico',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="min-w-32">
          <EventFileButton
            eventId={event._id}
            filePurpose={FilePurpose.EVENT_TECHNICAL_REPORT}
          />
        </div>
      );
    },
  },
  {
    id: 'financial-report',
    header: 'Informe Financiero',
    meta: { className: 'hidden lg:table-cell' },
    cell: ({ row }) => {
      const event = row.original;
      return (
        <div className="min-w-32">
          <EventFileButton
            eventId={event._id}
            filePurpose={FilePurpose.EVENT_FINANCIAL_REPORT}
          />
        </div>
      );
    },
  },
];

const facetedFiltersConfig: FacetedFilterConfig[] = [
  {
    columnId: 'type',
    title: 'Tipo de evento',
    options: [
      { value: 'interno', label: 'Interno' },
      { value: 'externo', label: 'Externo' },
    ],
  },
  {
    columnId: 'period',
    title: 'Año',
    options: [], 
  },
];

export function EventsTable() {
  const { data: events, isLoading: loadingEvents } = useGetAllEvents();
  const typedEvents = React.useMemo(() => (events ?? []) as IEvent[], [events]);

  const yearFilterOptions = React.useMemo<FacetedFilterConfig['options']>(() => {
    if (!typedEvents.length) return [];

    const years: string[] = Array.from(
      new Set(
        typedEvents
          .map((event) => {
            const periodDate = event.endDate ?? event.startDate;
            const timestamp = periodDate ? new Date(periodDate).getTime() : NaN;
            if (Number.isNaN(timestamp)) return null;
            return String(new Date(timestamp).getFullYear());
          })
          .filter((year): year is string => Boolean(year)),
      ),
    ).sort((a, b) => Number(b) - Number(a));

    return years.map((year) => ({ label: year, value: year }));
  }, [typedEvents]);

  const eventFacetedFilters = React.useMemo<FacetedFilterConfig[]>(
    () =>
      facetedFiltersConfig.map((filter): FacetedFilterConfig =>
        filter.columnId === 'period'
          ? { ...filter, options: yearFilterOptions }
          : filter,
      ),
    [yearFilterOptions],
  );

  return (
    <div className="max-w-8xl w-full p-1">
      {loadingEvents ? (
        <LoadingMessage message="Cargando eventos" />
      ) : (
        <DataTable
          columns={columns}
          data={typedEvents}
          facetedFilters={eventFacetedFilters}
        />
      )}
    </div>
  );
}