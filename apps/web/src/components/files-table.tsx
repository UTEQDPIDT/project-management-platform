'use client';

import { useFiles } from '@/hooks/files';
import { copyValue, formatFileSize, trimFileNameMiddle } from '@/lib/utils';
import { downloadFile } from '@/services/files.service';
import { IFile } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Copy, Download, MoreHorizontal } from 'lucide-react';
import LoadingMessage from './loading-message';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import { DataTable } from './ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const columns: ColumnDef<IFile>[] = [
  {
    accessorKey: 'originalName',
    header: 'Nombre',
    cell: ({ row }) => {
      const { originalName } = row.original;
      return (
        <div className="max-w-36 sm:max-w-64 md:max-w-xs truncate">
          {trimFileNameMiddle(originalName)}
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const file = row.original;

      const handleDownload = async () => {
        try {
          await downloadFile(file._id, file.originalName);
        } catch (error) {
          console.error('Failed to download file:', error);
        }
      };
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleDownload}>
              <Download /> Descargar archivo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => copyValue(file._id)}>
              <Copy /> Copiar ID
            </DropdownMenuItem>
            {/* <DropdownMenuItem
            <DropdownMenuSeparator />
              asChild
              className="hover:text-destructive-foreground"
            >
              <Dialog>
                <DialogTrigger className="group items-center justify-start p-0 font-normal hover:text-destructive-foreground">
                  <Trash className="text-muted-foreground group-hover:text-destructive-foreground" />{' '}
                  Eliminar equipo
                </DialogTrigger>
                <DialogContent>
                  <Badge variant="destructive">Eliminando</Badge>
                  <DialogTitle>{team.teamName}</DialogTitle>
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
                        onClick={() => deleteTeam.mutate(team._id)}
                        variant="destructive"
                      >
                        Eliminar
                      </Button>
                    </DialogClose>
                  </div>
                </DialogContent>
              </Dialog>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  {
    accessorKey: 'size',
    header: 'Tamaño de archivo',
    meta: { className: 'hidden sm:table-cell' }, // Oculto en móviles verticales
    cell: ({ row }) => {
      const { size } = row.original;
      return <div className="whitespace-nowrap">{formatFileSize(size)}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Subido el',
    meta: { className: 'hidden md:table-cell' }, // Oculto en móviles y tablets verticales
    cell: ({ row }) => {
      const { createdAt } = row.original;
      return (
        <div className="whitespace-nowrap">
          {format(createdAt, "d 'de' MMMM 'de' yyyy HH':'mm ", { locale: es })}
        </div>
      );
    },
  },
  {
    accessorKey: 'owner',
    header: 'Propietario',
    // Se mantiene completamente visible en móviles junto a nombre y acciones
    cell: ({ row }) => {
      const { owner } = row.original;

      if (!owner) return <div className="w-36 md:w-52 text-muted-foreground">Vacío</div>;

      return (
        <div className="w-36 md:w-52">
          <ProfileInfo
            size="sm"
            givenName={owner.givenName}
            familyName={owner.familyName}
            avatarUrl={owner.avatarUrl}
          />
        </div>
      );
    },
  },
];

export default function FilesTable() {
  const { data, isLoading } = useFiles();

  return (
    <div className="max-w-7xl w-full p-1">
      {isLoading ? (
        <LoadingMessage message="Cargando archivos" />
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}