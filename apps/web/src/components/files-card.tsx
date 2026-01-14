'use client';

import { IFile } from '@repo/types';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import IconSquare from './icon-square';
import { File as FileIcon, Upload, X } from 'lucide-react';
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

type FileCardProps = {
  files: IFile[];
  onUpload?: (files: File[]) => Promise<void>;
  onDelete?: (fileId: string) => void;
  onDownload?: (fileId: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  isUploading?: boolean;
};

export default function FilesCard({
  files,
  onUpload,
  onDelete,
  isLoading,
  isError,
  isUploading,
}: FileCardProps) {
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex gap-4 justify-between">
          <div className="flex gap-2 items-center">
            <IconSquare color="indigo">
              <FileIcon />
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
                  value={uploadedFiles}
                  onValueChange={setUploadedFiles}
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
                    {uploadedFiles.map((file) => (
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
                <Button disabled={isUploading}>
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
        <FileList>
          {files.map((f: IFile) => (
            <FileList.Item key={f._id} file={f}>
              <FileList.Actions fileId={f._id} />
            </FileList.Item>
          ))}
        </FileList>
      </CardContent>
    </Card>
  );
}
