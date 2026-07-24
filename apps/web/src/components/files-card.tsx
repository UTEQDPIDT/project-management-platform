'use client';

import { IFile } from '@repo/types';
import { Dispatch, SetStateAction, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { Info, Paperclip, Upload, X} from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from './ui/file-upload';
import FileList from './file-list';
import LoadingMessage from './loading-message';
import ErrorCard from './error-card';
import { useDeleteFile } from '@/hooks/files/use-delete-file';
import { downloadFile } from '@/services/files.service';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

type FileCardProps = {
  title?: string;
  description?: string;
  iconColor?: 'indigo' | 'blue' | 'green' | 'red' | 'yellow';
  savedFiles: IFile[];
  filesToUpload: File[];
  setFilesToUpload: Dispatch<SetStateAction<File[]>>;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: () => Promise<boolean> | boolean;
  accept?: string;
  isLoading?: boolean;
  isError?: boolean;
  isUploading?: boolean;
  isProjectClosed?: boolean;
};

export default function FilesCard({
  title= 'Archivos',
  description = 'Administra los archivos relacionados con el evento.',
  iconColor = 'indigo',
  savedFiles,
  filesToUpload,
  setFilesToUpload,
  onFileReject,
  onFileValidate,
  onUpload,
  accept,
  isLoading,
  isError,
  isUploading,
  isProjectClosed = false,
}: FileCardProps) {
  const deleteFileMutation = useDeleteFile();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const handleDelete = (fileId: string) => {
    deleteFileMutation.mutate({ fileId });
  };

  const handleDownload = (fileId: string) => {
    const file = savedFiles.find((f) => f._id === fileId);
    if (file) {
      downloadFile(fileId, file.originalName);
    }
  };

  const handleUploadClick = async () => {
    if (!onUpload) return;

    const wasSuccessful = await onUpload();
    if (wasSuccessful) {
      setIsUploadDialogOpen(false);
    }
  };

  return (
    <Card className="w-full min-w-0 max-w-full border border-neutral-400 sm:max-w-md">
      <CardHeader>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <IconSquare color={iconColor}>
              <Paperclip />
            </IconSquare>
            <CardTitle className="wrap-break-word">{title}</CardTitle>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <Info />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
          {!isProjectClosed && (
            <Dialog
              open={isUploadDialogOpen}
              onOpenChange={setIsUploadDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Upload />
                  Subir
                </Button>
              </DialogTrigger>

              <DialogContent className="flex w-[calc(100vw-3rem)] sm:w-[calc(100vw-1rem)] max-w-2xl max-h-[92dvh] flex-col overflow-hidden p-0 lg:max-w-xl">
              <DialogHeader className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6">
                <DialogTitle>{`Subir ${title}`}</DialogTitle>
                <DialogDescription>
                  {`Selecciona y sube los ${title.toLowerCase()} relacionados con el evento.`}
                </DialogDescription>
              </DialogHeader>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6">
                <FileUpload
                  value={filesToUpload}
                  onValueChange={setFilesToUpload}
                  onFileValidate={onFileValidate}
                  onFileReject={onFileReject}
                  maxSize={5 * 1024 * 1024}
                  accept={accept}
                  multiple
                >
                  <FileUploadDropzone>
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center rounded-full border p-2.5">
                        <Upload className="size-6 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">
                        Arrastra archivos aquí
                      </p>
                      <p className="text-muted-foreground text-xs">
                        o haz click para buscar (max 5 MB)
                      </p>
                    </div>
                    <FileUploadTrigger asChild>
                      <Button size="sm" variant="outline">
                        Buscar
                      </Button>
                    </FileUploadTrigger>
                  </FileUploadDropzone>
                  <FileUploadList className="flex-1 max-h-[45vh] overflow-y-auto pr-1 sm:max-h-[55vh]">
                    {filesToUpload.map((file, index) => (
                      <FileUploadItem
                        key={`${file.name}-${file.lastModified}-${index}`}
                        value={file}
                      >
                        <FileUploadItemPreview />
                        <FileUploadItemMetadata />
                        <FileUploadItemDelete asChild>
                          <Button variant="ghost" size="icon-xs">
                            <X />
                          </Button>
                        </FileUploadItemDelete>
                      </FileUploadItem>
                    ))}
                  </FileUploadList>
                </FileUpload>
              </div>
                <DialogFooter className="shrink-0 px-4 pb-4 sm:px-6 sm:pb-6 [&>button]:w-full sm:[&>button]:w-auto">
                <Button disabled={isUploading} onClick={handleUploadClick}>
                  {isUploading ? (
                    <LoadingMessage message="Subiendo archivos" />
                  ) : (
                    'Subir archivos'
                  )}
                </Button>
                  <DialogClose asChild>
                  <Button variant="outline">Cerrar</Button>
                  </DialogClose>
                </DialogFooter>
                </DialogContent>
              </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingMessage message="Cargando archivos" />
        ) : isError ? (
          <ErrorCard />
        ) : savedFiles.length ? (
          <FileList
            onDelete={handleDelete}
            onDownload={handleDownload}
            allowDelete={!isProjectClosed}
            className="max-h-[45dvh] overflow-y-auto scroll-smooth pr-2.5 lg:max-h-[50dvh]"
          >
            {savedFiles.map((f: IFile) => (
              <FileList.Item key={f._id} file={f}>
                <FileList.Actions file={f} />
              </FileList.Item>
            ))}
          </FileList>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Paperclip />
              </EmptyMedia>
              <EmptyTitle>No Hay Archivos</EmptyTitle>
              <EmptyDescription>No haz subido ningún archivo.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
