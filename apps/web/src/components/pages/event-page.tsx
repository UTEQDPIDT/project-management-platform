'use client';

import { ActivityCard } from '@/components/activity-card';
import ErrorCard from '@/components/error-card';
import EventActivityMenu from '@/components/event-activity-menu';
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
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
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
  FilePurpose,
  IActivity,
  IFile,
  IProduct,
  UserRole,
  UserType,
} from '@repo/types';
import { useUserProfile } from 'context/profile-provider';
import { ListTodo, Shapes } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { EventInfo } from '../event-info';
import RegisterProductsForm from '../forms/register-product-form';
import { toast } from 'sonner';

const EventPage = () => {
  const { user } = useUserProfile();
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

  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);

  const handleEvidenceUpload = async () => {
    if(evidenceFiles.length === 0) return false;
      try {
      // 1. Esperamos a que la petición termine exitosamente en NestJS
      await uploadFiles.mutateAsync({
        files: evidenceFiles,
        entityId: eventId,
        entityType: EntityType.EVENT,
        purpose: FilePurpose.EVENT_EVIDENCE,
      });
      // 2. Limpiamos la lista local del Dropzone para que visualmente desaparezcan los archivos ya subidos
      setEvidenceFiles([]);
      return true;
    } catch (error) {
      // El error ya lo maneja el onError global de tu hook useUploadMultipleFiles con Sonner
      console.error('Error al subir evidencias:', error);
      return false;
    }
  }
  const handleOtherFilesUpload = async () => {
    if(otherFiles.length === 0) return false;
    try {
      await uploadFiles.mutateAsync({
        files: otherFiles,
        entityId: eventId,
        entityType: EntityType.EVENT,
        purpose: FilePurpose.EVENT_OTHER,
      });
      setOtherFiles([]);
      return true;
    } catch (error) {
      console.error('Error al subir otros archivos:', error);
      return false;
    }
  }

  // File upload
  //const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  
  /*const handleFileUpload = () => {
    uploadFiles.mutate({
      files: filesToUpload,
      entityId: eventId,
      entityType: EntityType.EVENT,
    });
  };*/

  const onFileValidate = useCallback((file: File): string | null => {

    const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se aceptan PDFs, PNGs, JPGs y JPEGs';
    }
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return `El peso del archivo no debe exceder ${MAX_SIZE / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" fue rechazado`,
    });
  }, []);

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
            <div className="w-full flex flex-col gap-2 p-2 bg-neutral-200 rounded-2xl md:flex-row md:gap-4 md:p-4">
              <div className="w-full lg:max-w-sm flex flex-col gap-4">
                {(user.role === UserRole.ADMIN ||
                  user.type === UserType.MAESTRO ||
                  user.type === UserType.ADMINISTRATIVO || user.type === UserType.ESTUDIANTE) && (
                  <div className="flex flex-col gap-2">
                  
                    {/* Apartado 1: Evidencias */}
                    <FilesCard
                      title="Evidencias"
                      description="Aquí puedes subir y administrar evidencias relacionadas con el evento: Fotografías(PDF), Ficha Informativa, Programa del Evento y Listado de Participantes."
                      iconColor="blue"
                      savedFiles={files?.filter((f: IFile) => f.purpose === FilePurpose.EVENT_EVIDENCE) || []} 
                      isLoading={loadingFiles}
                      isError={errorFetchingFiles}
                      filesToUpload={evidenceFiles}
                      setFilesToUpload={setEvidenceFiles}
                      onUpload={handleEvidenceUpload}
                      onFileValidate={onFileValidate}
                      onFileReject={onFileReject}
                      isUploading={uploadFiles.isPending}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />

                    {/* Apartado 2: Otros Archivos */}
                    <FilesCard
                      title="Otros Archivos"
                      description="Aquí puedes subir y administrar otros archivos relacionados con el evento."
                      iconColor="green"
                      savedFiles={files?.filter((f: IFile) => f.purpose === FilePurpose.EVENT_OTHER || f.purpose === FilePurpose.GENERIC) || []} 
                      isLoading={loadingFiles}
                      isError={errorFetchingFiles}
                      filesToUpload={otherFiles}
                      setFilesToUpload={setOtherFiles}
                      onUpload={handleOtherFilesUpload}
                      onFileValidate={onFileValidate}
                      onFileReject={onFileReject}
                      isUploading={uploadFiles.isPending}
                      accept=".pdf,.png,.jpg,.jpeg"
                    />

                    <ParticipantsCard className='border border-neutral-400' event={event} />

                  </div>
                )}
              </div>

              <div className="w-full flex flex-col gap-2">
                <Card className="w-full min-h-168 border border-neutral-400">
                  <CardHeader>
                    <div className="flex justify-between">
                      <div className="flex gap-3 items-center">
                        <IconSquare color="green">
                          <ListTodo />
                        </IconSquare>

                        <CardTitle>Actividades</CardTitle>
                      </div>
                      {user.role === UserRole.ADMIN && (
                        <Dialog>
                          <DialogTrigger className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                            Crear
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Nueva Actividad</DialogTitle>
                            <Separator />
                            <ActivityForm eventId={eventId} />
                          </DialogContent>
                        </Dialog>
                      )}
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
                              className="border border-neutral-400"
                              key={a._id}
                              activity={a}
                              enableOptions
                              options={<EventActivityMenu activity={a} />}
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

                {event.acceptsProducts && (
                  <Card className="w-full border border-neutral-400">
                    <CardHeader>
                      <div className="flex gap-4 justify-between items-center">
                        <div className="flex gap-3 items-center">
                          <IconSquare color="orange">
                            <Shapes />
                          </IconSquare>

                          <CardTitle>Productos</CardTitle>
                        </div>
                        <Dialog>
                          <DialogTrigger className="h-8 px-3 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-transparent">
                            Agregar Productos
                          </DialogTrigger>
                          <DialogContent>
                            <DialogTitle>Agregar Productos</DialogTitle>
                            <RegisterProductsForm
                              eventId={eventId}
                              products={event.products}
                            />
                          </DialogContent>
                        </Dialog>
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
                                <EventProductMenu
                                  eventId={eventId}
                                  product={p}
                                />
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
                )}
              </div>
            </div>
          </PageContent>
        </>
      )}
    </div>
  );
};

export default EventPage;
