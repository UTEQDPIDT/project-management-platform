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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const isPdf = file.mimetype === 'application/pdf';

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
            {isPdf && (
              <DropdownMenuItem onClick={handleOpenPdf} disabled={isLoadingPdf}>
                <Eye />
                {isLoadingPdf ? 'Abriendo PDF...' : 'Ver PDF'}
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
    <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
      <DialogContent
        className="flex h-[92dvh] w-[96vw] max-w-[96vw] flex-col p-2 sm:h-[88dvh] sm:w-[88vw] sm:max-w-[88vw] sm:p-4 lg:h-[80dvh] lg:w-[78vw] lg:max-w-[78vw]"
        showCloseButton
        closeButtonClassName="top-2 right-2 sm:top-4 sm:right-4 bg-background/80"
      >
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
