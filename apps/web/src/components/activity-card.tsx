'use client';

import { cn } from '@/lib/utils';
import { EntityType, IActivity, IFile } from '@repo/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  Ellipsis,
  MoveRight,
  Paperclip,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import AvatarRow from './avatar-row';
import { Badge, badgeVariants } from './ui/badge';
import { Button } from './ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ReactNode, useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { ProfileInfo } from './profile-info';
import FileList from './file-list';
import { Separator } from './ui/separator';
import { useDeleteFile, useFilesForEntity } from '@/hooks/files';
import LoadingMessage from './loading-message';
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
import { useUploadMultipleFiles } from '@/hooks/files/use-upload-multiple-files';
import ErrorCard from './error-card';
import { downloadFile } from '@/services/files.service';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
import { useAddAssignee, useRemoveAssignee } from '@/hooks/activities';
import { userProfile } from 'context/profile-provider';

interface Props {
  activity: IActivity;
  options?: ReactNode;
  enableOptions?: boolean;
  showStatus?: boolean;
  showPriority?: boolean;
  className?: string;
}

export function ActivityCard({
  activity,
  options,
  enableOptions,
  showStatus,
  showPriority,
  className,
}: Props) {
  const { user } = userProfile();

  // Tanstack
  const {
    data: files,
    isLoading: isLoadingFiles,
    isError: isErrorFetchingFiles,
  } = useFilesForEntity(activity._id);
  const uploadFiles = useUploadMultipleFiles();
  const deleteFileMutation = useDeleteFile();
  const addAssignee = useAddAssignee();
  const removeAssignee = useRemoveAssignee();

  const handleAddAssignee = () => {
    addAssignee.mutate({ activityId: activity._id, userId: user._id });
  };
  const handleRemoveAssignee = () => {
    removeAssignee.mutate({ activityId: activity._id, userId: user._id });
  };

  const handleDelete = (fileId: string) => {
    deleteFileMutation.mutate({ fileId });
  };

  const handleDownload = (fileId: string) => {
    const file = files.find((f: IFile) => f._id === fileId);
    if (file) {
      downloadFile(fileId, file.originalName);
    }
  };

  const handleUpload = () => {
    uploadFiles.mutate({
      files: filesToUpload,
      entityId: activity._id,
      entityType: EntityType.ACTIVITY,
    });
    setFilesToUpload([]);
  };

  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  let priorityBadgeVariant:
    | 'orange'
    | 'gray'
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'blue'
    | 'green'
    | 'purple'
    | null
    | undefined;

  switch (activity.priority) {
    case 'Alta':
      priorityBadgeVariant = 'purple';
      break;
    case 'Media':
      priorityBadgeVariant = 'orange';
      break;
    case 'Baja':
      priorityBadgeVariant = 'gray';
      break;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card
          className={cn(
            'hover:shadow-lg hover:cursor-pointer group hover:bg-secondary gap-2',
            className,
          )}
        >
          <CardHeader>
            <div className="flex justify-between items-start gap-1">
              <div className="flex flex-col gap-1">
                <CardTitle>{activity.name}</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {showPriority && (
              <Badge variant={priorityBadgeVariant}>{activity.priority}</Badge>
            )}

            {activity.assignees && activity.assignees.length > 0 && (
              <AvatarRow profiles={activity.assignees} />
            )}

            {activity.dueDate && (
              <div className="flex gap-1">
                <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                  <Calendar size={14} />
                  {format(activity.dueDate, "'Vence el' d 'de' MMM 'de' yyyy", {
                    locale: es,
                  })}
                </span>
                {activity.dueDateEnd && (
                  <span className="flex gap-1 items-center justify-center text-xs text-muted-foreground">
                    <MoveRight size={10} />
                    {format(activity.dueDateEnd, "d 'de' MMM 'de' yyyy", {
                      locale: es,
                    })}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent>
        <SheetHeader>
          <SheetTitle className="text-lg">{activity.name}</SheetTitle>
          <SheetDescription>{activity.description}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 items-end">
          {enableOptions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="flex flex-col items-start gap-1"
              >
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                {options}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <div className="flex flex-col gap-4 w-full">
            {showStatus && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground w-20">Estado</div>
                <Badge variant="blue">{activity.status}</Badge>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground w-20">
                Encargados
              </div>
              {activity.assignees && (
                <AvatarRow profiles={activity.assignees} />
              )}
              {!activity.assignees?.some((a) => a._id === user._id) && (
                <Button onClick={handleAddAssignee} variant="ghost" size="xs">
                  <UserPlus /> Asignarse
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground w-20">
                Creado por
              </div>
              <ProfileInfo
                size="sm"
                givenName={activity.createdBy.givenName}
                familyName={activity.createdBy.familyName}
                avatarUrl={activity.createdBy.avatarUrl}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground w-20">
                Vencimiento
              </div>
              <span className="text-sm">
                {activity.dueDate
                  ? format(activity.dueDate, "d 'de' MMMM 'de' yyyy", {
                      locale: es,
                    })
                  : 'Sin fecha'}
              </span>
            </div>

            {showPriority && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground w-20">
                  Prioridad
                </div>
                <Badge variant={priorityBadgeVariant}>
                  {activity.priority}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-4 w-full">
            <div className="w-full flex justify-between items-center">
              <h2 className="font-medium">Evidencias</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Upload />
                    Subir
                  </Button>
                </SheetTrigger>

                <SheetContent className="flex h-dvh flex-col">
                  <SheetHeader>
                    <SheetTitle>Subir Archivos</SheetTitle>
                    <SheetDescription>
                      Selecciona y sube los archivos
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex min-h-0 flex-1 flex-col px-4">
                    <FileUpload
                      value={filesToUpload}
                      onValueChange={setFilesToUpload}
                      maxSize={5 * 1024 * 1024}
                      accept={'/images/*,application/pdf'}
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
                      <FileUploadList className="flex-1 max-h-[55vh] overflow-y-auto pr-1">
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
                  <SheetFooter className="shrink-0">
                    <Button
                      disabled={uploadFiles.isPending}
                      onClick={handleUpload}
                    >
                      {uploadFiles.isPending ? (
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

            {isLoadingFiles ? (
              <LoadingMessage message="Cargando archivos" />
            ) : isErrorFetchingFiles ? (
              <ErrorCard />
            ) : (
              <FileList
                onDelete={handleDelete}
                onDownload={handleDownload}
                className="lg:max-h-[40dvh] overflow-y-auto scroll-smooth pr-2"
              >
                {files.length ? (
                  files.map((file: IFile) => (
                    <FileList.Item key={file._id} file={file}>
                      <FileList.Actions fileId={file._id} />
                    </FileList.Item>
                  ))
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Paperclip />
                      </EmptyMedia>
                      <EmptyTitle>No Hay Evidencias</EmptyTitle>
                      <EmptyDescription>
                        No haz subido ninguna evidencia. Inicia subiendo tu
                        primer evidencia.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </FileList>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
