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
import { DataTable, fuzzyFilter } from './ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import FilePreviewDialog from './file-preview-dialog';

function FileRowActions({ file }: { file: IFile }) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const isPdf = file.mimetype === 'application/pdf';
  const isImage = file.mimetype?.startsWith('image/');
  const canPreview = isPdf || isImage;

  const handleDownload = async () => {
    try {
      await downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleOpenPreview = async () => {
    if (!canPreview) return;

    try {
      setIsViewerOpen(true);
      setIsLoadingPreview(true);
      setPreviewError(null);
      setPreviewBlobUrl(null);
      const blobUrl = await getFileBlobUrl(file._id);
      setPreviewBlobUrl(blobUrl);
    } catch (error) {
      console.error('Failed to open file preview:', error);
      setPreviewError('No se pudo cargar la vista previa del archivo.');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isViewerOpen) return;

    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewError(null);
  }, [isViewerOpen, previewBlobUrl]);

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

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
          {canPreview && (
            <DropdownMenuItem onClick={handleOpenPreview} disabled={isLoadingPreview}>
              <Eye /> {isLoadingPreview ? 'Abriendo archivo...' : 'Ver archivo'}
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

      <FilePreviewDialog
        open={isViewerOpen}
        onOpenChange={setIsViewerOpen}
        fileName={file.originalName}
        mimeType={file.mimetype}
        previewBlobUrl={previewBlobUrl}
        isLoading={isLoadingPreview}
        errorMessage={previewError}
        onRetry={handleOpenPreview}
        onDownload={handleDownload}
      />
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
    filterFn: fuzzyFilter,
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
        <DataTable 
        data={data} 
        columns={columns} 
        searchColumnId='originalName' 
        persistStateKey='files-table'
        />
      )}
    </div>
  );
}