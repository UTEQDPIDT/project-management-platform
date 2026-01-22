'use client';

import { ActivityCard } from '@/components/activity-card';
import ErrorCard from '@/components/error-card';
import EventActivityMenu from '@/components/event-activity-menu';
import EventInfoCard from '@/components/event-info-card';
import { EventMenu } from '@/components/event-menu';
import EventProductMenu from '@/components/event-product-menu';
import FilesCard from '@/components/files-card';
import { ActivityForm } from '@/components/forms/activity-form';
import { Header, HeaderAction, HeaderHeading } from '@/components/header';
import IconSquare from '@/components/icon-square';
import LoadingMessage from '@/components/loading-message';
import { PageContent } from '@/components/page-content';
import ParticipantsCard from '@/components/participants-card';
import ProductCard from '@/components/product-card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Separator } from '@/components/ui/separator';
import { useActivitiesByEntity } from '@/hooks/activities';
import { useGetEventById } from '@/hooks/events';
import { useFilesForEntity, useUploadMultipleFiles } from '@/hooks/files';
import { getBaseUrlBasedOnRole } from '@/lib/utils';
import {
  EntityType,
  IActivity,
  IProduct,
  UserRole,
  UserType,
} from '@repo/types';
import { userProfile } from 'context/profile-provider';
import { ListTodo, Shapes } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { EventInfo } from '../event-info';

const EventPage = () => {
  const { user } = userProfile();
  const baseUrl = getBaseUrlBasedOnRole(user.role);

  /**
   * Tanstack
   */
  const { eventId } = useParams<{ eventId: string }>();
  const {
    data: event,
    isLoading: loadingEvent,
    isError,
  } = useGetEventById(eventId);
  const {
    data: activities,
    isLoading: loadingActivities,
    isError: errorFetchingActivities,
  } = useActivitiesByEntity(eventId);
  const {
    data: files,
    isLoading: loadingFiles,
    isError: errorFetchingFiles,
  } = useFilesForEntity(eventId);
  const uploadFiles = useUploadMultipleFiles();

  // File upload
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  const handleFileUpload = () => {
    uploadFiles.mutate({
      files: filesToUpload,
      entityId: eventId,
      entityType: EntityType.EVENT,
    });
  };

  return (
    <div>
      {loadingEvent ? (
        <LoadingMessage message="Cargando evento" className="w-full h-screen" />
      ) : isError ? (
        <ErrorCard />
      ) : (
        <>
          <Header>
            <HeaderHeading>
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`${baseUrl}/eventos`}>Eventos</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>{event.name}</BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </HeaderHeading>
            <HeaderAction>
              <EventMenu eventId={eventId} name={event.name} />
            </HeaderAction>
          </Header>

          <PageContent>
            <EventInfo event={event} />
            <div className="w-full flex gap-6 lg:gap-4 flex-col lg:flex-row">
              <div className="w-full lg:max-w-sm flex flex-col gap-6">
                {(user.role === UserRole.ADMIN ||
                  user.type === UserType.MAESTRO ||
                  user.type === UserType.ADMINISTRATIVO) && (
                  <FilesCard
                    savedFiles={files}
                    isLoading={loadingFiles}
                    isError={errorFetchingFiles}
                    filesToUpload={filesToUpload}
                    setFilesToUpload={setFilesToUpload}
                    onUpload={handleFileUpload}
                    isUploading={uploadFiles.isPending}
                    accept="pdf"
                  />
                )}

                <ParticipantsCard event={event} />
              </div>

              <div className="w-full flex flex-col gap-6">
                <Card className="w-full">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare color="green">
                          <ListTodo />
                        </IconSquare>

                        <CardTitle>Actividades</CardTitle>
                      </div>
                      <Dialog>
                        <DialogTrigger className="h-7 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                          Crear
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle>Nueva Actividad</DialogTitle>
                          <Separator />
                          <ActivityForm eventId={eventId} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {loadingActivities ? (
                        <LoadingMessage />
                      ) : errorFetchingActivities ? (
                        <ErrorCard />
                      ) : activities?.length ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {activities.map((a: IActivity) => (
                            <ActivityCard
                              key={a._id}
                              activity={a}
                              enableOptions={user.role === UserRole.ADMIN}
                              options={
                                <EventActivityMenu
                                  eventId={eventId}
                                  activity={a}
                                />
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <Empty>
                          <EmptyHeader>
                            <EmptyMedia variant="icon">
                              <ListTodo />
                            </EmptyMedia>
                            <EmptyTitle>No Hay Actividades</EmptyTitle>
                            <EmptyDescription>
                              No se han agregado actividades para el evento.
                              Crea una nueva actividad.
                            </EmptyDescription>
                          </EmptyHeader>
                        </Empty>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="w-full">
                  <CardHeader>
                    <div className="flex gap-3 items-center">
                      <IconSquare color="orange">
                        <Shapes />
                      </IconSquare>

                      <CardTitle>Productos</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {event.products.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {event.products.map((p: IProduct) => (
                          <ProductCard
                            key={p._id}
                            product={p}
                            enableOptions
                            options={
                              <EventProductMenu eventId={eventId} product={p} />
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <Empty>
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Shapes />
                          </EmptyMedia>
                          <EmptyTitle>No Hay Productos</EmptyTitle>
                          <EmptyDescription>
                            No se ha agregado ningún producto. Debes esperar a
                            que los asistentes seleccionen sus productos.
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </PageContent>
        </>
      )}
    </div>
  );
};

export default EventPage;
