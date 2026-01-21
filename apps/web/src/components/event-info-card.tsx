'use client';

import { EntityType, IEvent, UserRole } from '@repo/types';
import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { Info, Upload, X } from 'lucide-react';
import CopyButton from './ui/copy';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { userProfile } from 'context/profile-provider';
import { useFilesForEntity, useUploadFile } from '@/hooks/files';
import FileButton from './file-button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
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
import { toast } from 'sonner';
import { useUploadMultipleFiles } from '@/hooks/files/use-upload-multiple-files';

interface EventInfoCardProps {
  event: IEvent;
}

export default function EventInfoCard({ event }: EventInfoCardProps) {
  const { user } = userProfile();
  const { data: files = [], isLoading, isError } = useFilesForEntity(event._id);
  const uploadFiles = useUploadMultipleFiles();

  // Handle file upload
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const onFileValidate = useCallback(
    (file: File): string | null => {
      // Validate max files
      if (files.length >= 1) {
        return 'Sólo puedes subir un archivo';
      }

      // Validate file type (only images)
      if (!file.type.endsWith('pdf')) {
        return 'Solo se aceptan PDFs';
      }

      // Validate file size (max 2MB)
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_SIZE) {
        return `El peso del archivo no debe exceder ${MAX_SIZE / (1024 * 1024)}MB`;
      }

      return null;
    },
    [files],
  );

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" fue rechazado`,
    });
  }, []);

  const handleFileUpload = () => {
    uploadFiles.mutate({
      files: filesToUpload,
      entityId: event._id,
      entityType: EntityType.EVENT,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <IconSquare>
              <Info />
            </IconSquare>

            <CardTitle>Acerca del Evento</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col text-sm gap-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground w-24">Nombre</span>
            <span>{event.name}</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="text-muted-foreground w-24">Organización</span>
            <span>{event.organization}</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="text-muted-foreground">Resumen</span>
            <span className="max-w-96">{event.summary}</span>
          </div>

          <div className="flex justify-between gap-5">
            <span className="text-muted-foreground w-24">Ubicación</span>
            <div className="relative group text-right">
              <span className="max-w-96">{event.location}</span>
              <CopyButton
                valueToCopy={event.location}
                variant="outline"
                className="absolute top-0 right-0 group-hover:opacity-100 opacity-0"
              />
            </div>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground w-24">Fecha</span>
            {event.endDate ? (
              <div>
                {format(event.startDate, "d 'de' MMMM 'al' ", {
                  locale: es,
                })}
                {format(event.endDate, "d 'de' MMMM 'del' yyyy", {
                  locale: es,
                })}
              </div>
            ) : (
              <div>
                {format(event.startDate, "d',' MMM 'del' yyyy", {
                  locale: es,
                })}
              </div>
            )}
          </div>

          {user.role === UserRole.ADMIN && (
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground w-24">Informe</span>
              {files.length ? (
                <FileButton canDelete file={files[0]} className="max-w-52" />
              ) : (
                <Dialog>
                  <DialogTrigger className="border h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5">
                    <Upload />
                    Subir Informe
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Informe del Evento</DialogTitle>

                    <FileUpload
                      value={filesToUpload}
                      onValueChange={setFilesToUpload}
                      onFileValidate={onFileValidate}
                      onFileReject={onFileReject}
                      accept="application/pdf"
                      maxFiles={1}
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
                            o haz click para buscar (max 2 MB)
                          </p>
                        </div>
                        <FileUploadTrigger>
                          <Button size="sm" variant="outline">
                            Buscar
                          </Button>
                        </FileUploadTrigger>
                      </FileUploadDropzone>

                      <FileUploadList>
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

                    <div className="flex gap-2">
                      <DialogClose asChild>
                        <Button variant="outline">Cerrar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={handleFileUpload}>
                          Subir Informe
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
