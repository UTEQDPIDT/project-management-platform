import { IFile } from '@repo/types';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { downloadFile, getFileBlobUrl } from '@/services/files.service';
import { ChevronDown, Download, Eye, Trash } from 'lucide-react';
import LoadingMessage from './loading-message';
import { ButtonGroup } from './ui/button-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useDeleteFile } from '@/hooks/files';
import { cn } from '@/lib/utils';
import FilePreviewDialog from './file-preview-dialog';

type FileButtonProps = {
  file: IFile;
  canDelete?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
};

export default function FileButton({
  file,
  canDelete = false,
  size = 'xs',
  className,
}: FileButtonProps) {
  const deleteFile = useDeleteFile();

  const [isLoading, setIsLoading] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const isPdf = file.mimetype === 'application/pdf';
  const isImage = file.mimetype?.startsWith('image/');
  const canPreview = isPdf || isImage;

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      await downloadFile(file._id, file.originalName);
    } catch (error) {
      console.error('Failed to download file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    deleteFile.mutate({ fileId: file._id });
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
    <ButtonGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size={size}
            variant="outline"
            onClick={handleDownload}
            disabled={isLoading}
            className={cn(className)}
          >
            {isLoading ? (
              <LoadingMessage message="descargando" />
            ) : (
              <div className="flex items-center gap-1 overflow-x-hidden">
                <Download />
                <span className="truncate">{file.originalName}</span>
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Descargar</TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size={`icon-${size}`}
            aria-label="Más opciones"
          >
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            {canPreview && (
              <DropdownMenuItem onClick={handleOpenPreview} disabled={isLoadingPreview}>
                <Eye />
                {isLoadingPreview ? 'Abriendo archivo...' : 'Ver archivo'}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDownload} disabled={isLoading}>
              <Download />
              Descargar archivo
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteFile.isPending || !canDelete}
            >
              <Trash />
              Eliminar archivo
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
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
