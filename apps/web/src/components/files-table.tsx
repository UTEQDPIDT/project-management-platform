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
      const { originalName, _id } = row.original;

      return <div>{trimFileNameMiddle(originalName)}</div>;
    },
  },
  {
    accessorKey: 'size',
    header: 'Tamaño de archivo',
    cell: ({ row }) => {
      const { size } = row.original;
      return <div>{formatFileSize(size)}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Subido el',
    cell: ({ row }) => {
      const { createdAt } = row.original;

      return (
        <div>
          {format(createdAt, "d 'de' MMMM 'de' yyyy HH':'mm ", { locale: es })}
        </div>
      );
    },
  },
  {
    accessorKey: 'owner',
    header: 'Proprietario',
    cell: ({ row }) => {
      const { owner } = row.original;

      return (
        <ProfileInfo
          size="sm"
          givenName={owner.givenName}
          familyName={owner.familyName}
          avatarUrl={owner.avatarUrl}
        />
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const file = row.original;

      const handleDownload = async () => {
        try {
          await downloadFile(file._id, file.originalName);
        } catch (error) {
          console.error('Failed to download file:', error);
          // You can add a toast notification here if you have one
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
];
export default function FilesTable() {
  const { data, isLoading } = useFiles();

  return (
    <div className="max-w-6xl w-full">
      {isLoading ? (
        <LoadingMessage message="Cargando equipos" />
      ) : (
        <DataTable data={data} columns={columns} />
      )}
    </div>
  );
}
