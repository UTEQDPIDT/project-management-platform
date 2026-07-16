'use client';

import { useAddAssignee, useUpdateActivity } from '@/hooks/activities';
import { useDeleteFile, useFilesForEntity } from '@/hooks/files';
import { useUploadMultipleFiles } from '@/hooks/files/use-upload-multiple-files';
import { cn } from '@/lib/utils';
import { downloadFile } from '@/services/files.service';
import { EntityType, FilePurpose, IActivity, IFile, Status } from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
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
import { ReactNode, useEffect, useRef, useState } from 'react';
import AvatarRow from './avatar-row';
import ErrorCard from './error-card';
import FileList from './file-list';
import LoadingMessage from './loading-message';
import { PriorityBadge } from './priority-badge';
import { StatusBadge } from './status-badge';
import { ProfileInfo } from './profile-info';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from './ui/empty';
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
import { Separator } from './ui/separator';
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

interface Props {
  activity: IActivity;
  options?: ReactNode;
  enableOptions?: boolean;
  showStatus?: boolean;
  showPriority?: boolean;
  isReadOnly?: boolean;
  className?: string;
}

export function ActivityCard({
  activity,
  options,
  enableOptions,
  showStatus,
  showPriority,
  isReadOnly = false,
  className,
}: Props) {
  const { user } = useUserProfile();

  // Tanstack
  const {
    data: files = [],
    isLoading: isLoadingFiles,
    isError: isErrorFetchingFiles,
  } = useFilesForEntity(activity._id);
  const uploadFiles = useUploadMultipleFiles();
  const deleteFileMutation = useDeleteFile();
  const updateActivityMutation = useUpdateActivity();
  const addAssignee = useAddAssignee();
  const autoRevertTriggeredRef = useRef(false);
// This effect checks if the activity is marked as COMPLETED but has no evidence files. 
// If so, it automatically reverts the status back to PROGRESS and shows a toast notification. 
// It also ensures that this auto-revert logic is only triggered once per relevant state change to prevent infinite loops.
  useEffect(() => {
    const shouldAutoRevert =
      !isLoadingFiles &&
      activity.status === Status.COMPLETED &&
      files.length === 0;

    if (!shouldAutoRevert) {
      autoRevertTriggeredRef.current = false;
      return;
    }

    if (autoRevertTriggeredRef.current || updateActivityMutation.isPending) {
      return;
    }

    autoRevertTriggeredRef.current = true;

    updateActivityMutation.mutate({
      activityId: activity._id,
      activityData: {
        name: activity.name,
        status: Status.PROGRESS,
      },
    });
  }, [
    activity._id,
    activity.name,
    activity.status,
    files.length,
    isLoadingFiles,
    updateActivityMutation,
  ]);

  const handleAddAssignee = () => {
    addAssignee.mutate({ activityId: activity._id, userId: user._id });
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
      purpose: FilePurpose.GENERIC,
    });
    setFilesToUpload([]);
  };

  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const validAssignees = (activity.assignees ?? []).filter(
    (assignee): assignee is NonNullable<typeof assignee> => Boolean(assignee),
  );
  const firstAssignee = validAssignees[0];

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
            {showPriority && <PriorityBadge priority={activity.priority} />}

            {validAssignees.length > 0 && (
              <AvatarRow profiles={validAssignees} />
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
          <div className="pr-2 flex flex-col gap-2 relative">
            <SheetTitle>Detalles</SheetTitle>
            {enableOptions && (
              <div className="absolute top-0 right-6 h-25">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    className="text-muted-foreground hover:text-neutral-800 [svg]:size-4"
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="flex flex-col items-start gap-1"
                  >
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    {options}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 items-end overflow-y-auto pb-4">
          <div className="flex flex-col gap-4 w-full">
            <span className="font-medium text-lg">{activity.name}</span>
            <span className="text-muted-foreground text-sm">
              {activity.description}
            </span>

            {showStatus && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground w-20">Estado</div>
                <StatusBadge status={activity.status} />
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground w-20">
                Encargados
              </div>
              {firstAssignee && validAssignees.length === 1 && (
                <ProfileInfo
                  size="sm"
                  givenName={firstAssignee.givenName}
                  familyName={firstAssignee.familyName}
                  avatarUrl={firstAssignee.avatarUrl}
                />
              )}
              {validAssignees.length > 1 && (
                <AvatarRow profiles={validAssignees} />
              )}
              {!validAssignees.some((a) => a._id === user._id) && (
                <Button onClick={handleAddAssignee} variant="ghost" size="xs">
                  <UserPlus /> Asignarse
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground w-20">
                Creada por
              </div>
              {activity.createdBy ? (
                <ProfileInfo
                  size="sm"
                  givenName={activity.createdBy.givenName}
                  familyName={activity.createdBy.familyName}
                  avatarUrl={activity.createdBy.avatarUrl}
                />
              ) : (
                <span className="text-sm text-muted-foreground">Sin registro</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground w-20">
                Vencimiento
              </div>

              {activity.dueDate ? (
                <span className="text-sm">
                  {format(activity.dueDate, "d 'de' MMMM 'de' yyyy", {
                    locale: es,
                  })}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">Sin fecha</span>
              )}
            </div>

            {showPriority && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground w-20">
                  Prioridad
                </div>
                <PriorityBadge priority={activity.priority} />
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-4 w-full">
            <div className="w-full flex justify-between items-center">
              <h2 className="font-medium">Evidencias</h2>
              {!isReadOnly && (
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
                        accept={
                          '.pdf, .doc, .docx, .xls, .xlsx, .png, .jpg, .jpeg'
                        }
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
              )}
            </div>

            {isLoadingFiles ? (
              <LoadingMessage message="Cargando archivos" />
            ) : isErrorFetchingFiles ? (
              <ErrorCard />
            ) : (
              <FileList
                onDelete={handleDelete}
                onDownload={handleDownload}
                allowDelete={!isReadOnly}
                className="lg:max-h-[40dvh] overflow-y-auto scroll-smooth pr-2"
              >
                {files.length ? (
                  files.map((file: IFile) => (
                    <FileList.Item key={file._id} file={file}>
                      <FileList.Actions file={file} />
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
                        Necesitas ser encargado para subir archivos.
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
