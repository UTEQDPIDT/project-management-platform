'use client';

import { Download, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Skeleton } from './ui/skeleton';

type FilePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  mimeType?: string;
  previewBlobUrl: string | null;
  isLoading: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onDownload?: () => void;
};

export default function FilePreviewDialog({
  open,
  onOpenChange,
  fileName,
  mimeType,
  previewBlobUrl,
  isLoading,
  errorMessage,
  onRetry,
  onDownload,
}: FilePreviewDialogProps) {
  const isPdf = mimeType === 'application/pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[94dvh] w-[98vw] max-w-[98vw] flex-col gap-2 p-2 sm:h-[90dvh] sm:w-[92vw] sm:max-w-[92vw] sm:gap-3 sm:p-4 lg:h-[84dvh] lg:w-[80vw] lg:max-w-[80vw]"
        showCloseButton
        closeButtonClassName="top-2 right-2 bg-background/80 sm:top-4 sm:right-4"
      >
        <DialogHeader className="px-1">
          <DialogTitle className="max-w-[calc(100%-2rem)] truncate text-base sm:text-lg">
            {fileName}
          </DialogTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <DialogDescription className="text-xs sm:text-sm">
              {isPdf ? 'Vista previa nativa de PDF' : 'Vista previa de imagen'}
            </DialogDescription>
            {previewBlobUrl && (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                {onDownload && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-full sm:w-auto"
                    onClick={onDownload}
                  >
                    <Download />
                    Descargar
                  </Button>
                )}
                <Button asChild size="sm" variant="outline" className="h-8 w-full sm:w-auto">
                  <a href={previewBlobUrl} target="_blank" rel="noreferrer">
                    <ExternalLink />
                    Abrir en nueva pestaña
                  </a>
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-hidden rounded-md border bg-muted/20">
          {isLoading && (
            <div className="flex h-full w-full flex-col gap-2 p-2 sm:p-3">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-full w-full" />
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              {onRetry && (
                <Button size="sm" variant="outline" onClick={onRetry}>
                  Reintentar
                </Button>
              )}
            </div>
          )}

          {!isLoading && !errorMessage && previewBlobUrl &&
            (isPdf ? (
              <iframe
                src={previewBlobUrl}
                title={`Vista previa de ${fileName}`}
                className="h-full w-full"
              />
            ) : (
              <div className="h-full w-full overflow-auto p-2">
                <img
                  src={previewBlobUrl}
                  alt={fileName}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
