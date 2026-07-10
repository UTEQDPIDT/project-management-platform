'use client';

import { useFiles } from '@/hooks/files';
import { copyValue, formatFileSize, trimFileNameMiddle } from '@/lib/utils';
import { downloadFile, getFileBlobUrl } from '@/services/files.service';
import { IFile } from '@repo/types';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Copy, Download, Eye, MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import LoadingMessage from './loading-message';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import { DataTable } from './ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

function FileRowActions({ file }: { file: IFile }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const isPdf = file.mimetype === 'application/pdf';

  const handleDownload = async () => {
    try {
      await downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleOpenPdf = async () => {
    if (!isPdf) return;

    try {
      setIsLoadingPdf(true);
      const blobUrl = await getFileBlobUrl(file._id);
      setPdfBlobUrl(blobUrl);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('Failed to open PDF preview:', error);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  useEffect(() => {
    if (isViewerOpen) return;

    if (pdfBlobUrl) {
      window.URL.revokeObjectURL(pdfBlobUrl);
      setPdfBlobUrl(null);
    }
  }, [isViewerOpen, pdfBlobUrl]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        window.URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {isPdf && (
            <DropdownMenuItem onClick={handleOpenPdf} disabled={isLoadingPdf}>
              <Eye /> {isLoadingPdf ? 'Abriendo PDF...' : 'Ver PDF'}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDownload}>
            <Download /> Descargar archivo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => copyValue(file._id)}>
            <Copy /> Copiar ID
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="flex h-[95dvh] w-[80vw] max-w-[78vw] flex-col p-2 sm:max-w-[78vw] sm:p-4" showCloseButton>
          <DialogHeader className="px-1">
            <DialogTitle className="truncate">{file.originalName}</DialogTitle>
            <DialogDescription>Vista previa nativa de PDF</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1">
            {pdfBlobUrl ? (
              <iframe
                src={pdfBlobUrl}
                title={`Vista previa de ${file.originalName}`}
                className="h-full w-full rounded-md border"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No se pudo cargar la vista previa del PDF.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function FilesTable() {
  const { data, isLoading } = useFiles();

  const columns: ColumnDef<IFile>[] = useMemo(
    () => [
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
      return <FileRowActions file={file} />;
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
],
    [],
  );

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