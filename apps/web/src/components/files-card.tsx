'use client';

import { IFile } from '@repo/types';
import React, { Dispatch, SetStateAction } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { Paperclip, Upload, X } from 'lucide-react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
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

type FileCardProps = {
  savedFiles: IFile[];
  filesToUpload: File[];
  setFilesToUpload: Dispatch<SetStateAction<File[]>>;
  onUpload?: () => void;
  onDelete?: (fileId: string) => void;
  accept?: string;
  isLoading?: boolean;
  isError?: boolean;
  isUploading?: boolean;
};

export default function FilesCard({
  savedFiles,
  filesToUpload,
  setFilesToUpload,
  onUpload,
  onDelete,
  accept,
  isLoading,
  isError,
  isUploading,
}: FileCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex gap-4 justify-between">
          <div className="flex gap-2 items-center">
            <IconSquare color="indigo">
              <Paperclip />
            </IconSquare>
            <CardTitle>Archivos</CardTitle>
          </div>
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" size="sm">
                <Upload />
                Subir
              </Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>Subir Archivos</SheetTitle>
                <SheetDescription>
                  Selecciona y sube los archivos
                </SheetDescription>
              </SheetHeader>

              <div className="px-4">
                <FileUpload
                  value={filesToUpload}
                  onValueChange={setFilesToUpload}
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
                  <FileUploadList>
                    {filesToUpload.map((file) => (
                      <FileUploadItem
                        key={`${file.name}-${file.lastModified}`}
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
              <SheetFooter>
                <Button disabled={isUploading} onClick={onUpload}>
                  {isUploading ? (
                    <LoadingMessage message="Subiendo archivos" />
                  ) : (
                    'Subir archivos'
                  )}
                </Button>
                <SheetClose asChild>
                  <Button variant="outline">Cerrar</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingMessage message="Cargando archivos" />
        ) : isError ? (
          <ErrorCard />
        ) : (
          <FileList>
            {savedFiles.map((f: IFile) => (
              <FileList.Item key={f._id} file={f}>
                <FileList.Actions fileId={f._id} />
              </FileList.Item>
            ))}
          </FileList>
        )}
      </CardContent>
    </Card>
  );
}
